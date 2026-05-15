use std::sync::Arc;
use std::sync::Mutex;
use std::collections::HashMap;
use std::time::Instant;
use std::sync::atomic::AtomicU64;
use tokio_postgres::Client;
use redis::aio::ConnectionManager;

pub type RateLimitMap = Arc<Mutex<HashMap<String, Vec<Instant>>>>;

#[derive(Clone)]
pub struct AppState {
    pub redis: Option<ConnectionManager>,
    pub pg: Option<Arc<Client>>,
    pub rate_limit: RateLimitMap,
    pub total_read_bytes: Arc<AtomicU64>,
    pub total_write_bytes: Arc<AtomicU64>,
}
