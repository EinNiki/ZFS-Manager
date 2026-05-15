use axum::{
    extract::{Path, State},
    routing::{delete, get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use sha2::{Sha256, Digest};
use rand::Rng;

use crate::state::AppState;
use crate::error::ApiError;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/v1/settings/api-keys",     get(list_api_keys).post(create_api_key))
        .route("/api/v1/settings/api-keys/:id", delete(revoke_api_key))
        .route("/api/v1/settings/password",     post(change_password))
        .with_state(state)
}

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

fn generate_key() -> String {
    let bytes: [u8; 32] = rand::thread_rng().gen();
    hex::encode(bytes)
}

async fn list_api_keys(
    State(state): State<AppState>,
) -> Result<Json<Value>, ApiError> {
    let pg = state.pg.as_ref().ok_or_else(|| ApiError::InternalError("Database unavailable".into()))?;

    let rows = pg.query(
        "SELECT id, name, key_prefix, permissions, created_at, last_used_at FROM api_keys ORDER BY created_at DESC",
        &[],
    ).await.map_err(|e| ApiError::InternalError(format!("DB error: {e}")))?;

    let keys: Vec<Value> = rows.iter().map(|row| {
        let id: i32 = row.get(0);
        let name: String = row.get(1);
        let prefix: String = row.get(2);
        let permissions: String = row.get(3);
        let created_at: chrono::DateTime<chrono::Utc> = row.get(4);
        let last_used_at: Option<chrono::DateTime<chrono::Utc>> = row.get(5);
        json!({
            "id": id,
            "name": name,
            "key_prefix": prefix,
            "permissions": permissions,
            "created_at": created_at.to_rfc3339(),
            "last_used_at": last_used_at.map(|t| t.to_rfc3339()),
        })
    }).collect();

    Ok(Json(json!({ "keys": keys })))
}

#[derive(Deserialize)]
struct CreateApiKeyBody {
    name: String,
    permissions: String,
}

async fn create_api_key(
    State(state): State<AppState>,
    Json(body): Json<CreateApiKeyBody>,
) -> Result<Json<Value>, ApiError> {
    if body.name.is_empty() {
        return Err(ApiError::BadRequest("'name' is required".into()));
    }
    if body.name.len() > 64 {
        return Err(ApiError::BadRequest("'name' must be at most 64 characters".into()));
    }
    let valid_perms = ["read", "readwrite", "admin"];
    if !valid_perms.contains(&body.permissions.as_str()) {
        return Err(ApiError::BadRequest("'permissions' must be one of: read, readwrite, admin".into()));
    }

    let pg = state.pg.as_ref().ok_or_else(|| ApiError::InternalError("Database unavailable".into()))?;

    let key = generate_key();
    let prefix = key[..8].to_string();
    let key_hash = hash_token(&key);

    let row = pg.query_one(
        "INSERT INTO api_keys(name, key_hash, key_prefix, permissions) VALUES($1,$2,$3,$4) RETURNING id",
        &[&body.name, &key_hash, &prefix, &body.permissions],
    ).await.map_err(|e| ApiError::InternalError(format!("DB error: {e}")))?;

    let id: i32 = row.get(0);

    Ok(Json(json!({
        "key": key,
        "prefix": prefix,
        "id": id,
    })))
}

async fn revoke_api_key(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Value>, ApiError> {
    let pg = state.pg.as_ref().ok_or_else(|| ApiError::InternalError("Database unavailable".into()))?;

    pg.execute("DELETE FROM api_keys WHERE id = $1", &[&id])
        .await
        .map_err(|e| ApiError::InternalError(format!("DB error: {e}")))?;

    Ok(Json(json!({ "ok": true })))
}

#[derive(Deserialize)]
struct ChangePasswordBody {
    current_password: String,
    new_password: String,
    confirm_password: String,
}

async fn change_password(
    State(state): State<AppState>,
    Json(body): Json<ChangePasswordBody>,
) -> Result<Json<Value>, ApiError> {
    if body.new_password.len() < 12 {
        return Err(ApiError::BadRequest("New password must be at least 12 characters".into()));
    }
    if body.new_password != body.confirm_password {
        return Err(ApiError::BadRequest("New password and confirmation do not match".into()));
    }

    let pg = state.pg.as_ref().ok_or_else(|| ApiError::InternalError("Database unavailable".into()))?;

    // Verify current password
    let mut verified = false;
    let result = pg.query_opt(
        "SELECT password_hash FROM users WHERE username = 'admin'",
        &[],
    ).await.map_err(|e| ApiError::InternalError(format!("DB error: {e}")))?;

    if let Some(row) = result {
        let stored_hash: String = row.get(0);
        let pw = body.current_password.clone();
        verified = tokio::task::spawn_blocking(move || {
            bcrypt::verify(&pw, &stored_hash).unwrap_or(false)
        }).await.unwrap_or(false);
    }

    // Fall back to env var
    if !verified {
        let api_key = std::env::var("ZFS_API_KEY").unwrap_or_default();
        if !api_key.is_empty() && body.current_password == api_key {
            verified = true;
        }
    }

    if !verified {
        return Err(ApiError::BadRequest("Current password is incorrect".into()));
    }

    // Hash new password
    let new_pw = body.new_password.clone();
    let new_hash = tokio::task::spawn_blocking(move || {
        bcrypt::hash(new_pw, 12)
    }).await
        .map_err(|e| ApiError::InternalError(format!("Spawn error: {e}")))?
        .map_err(|e| ApiError::InternalError(format!("Bcrypt error: {e}")))?;

    pg.execute(
        "UPDATE users SET password_hash = $1, is_default_password = false WHERE username = 'admin'",
        &[&new_hash],
    ).await.map_err(|e| ApiError::InternalError(format!("DB error: {e}")))?;

    Ok(Json(json!({ "ok": true })))
}
