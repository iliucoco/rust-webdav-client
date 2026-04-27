//! WebDAV 模块 - 核心业务逻辑
//!
//! 包含 WebDAV 客户端实现和应用状态管理

pub mod client;
pub mod types;

use client::WebDavClient;
use std::collections::HashMap;
use std::sync::Mutex;

/// 应用全局状态
///
/// 管理所有 WebDAV 连接和当前活动连接
/// 使用 Mutex 确保线程安全访问
pub struct AppState {
    /// 连接池 - 存储所有已建立的 WebDAV 客户端连接
    pub connections: Mutex<HashMap<String, WebDavClient>>,
    /// 当前活动连接的 ID
    pub active_connection_id: Mutex<Option<String>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            connections: Mutex::new(HashMap::new()),
            active_connection_id: Mutex::new(None),
        }
    }
}

impl AppState {
    /// 获取当前活动的 WebDAV 客户端
    ///
    /// 为避免在 await 期间持有锁，返回客户端的克隆
    pub fn get_client(&self) -> Result<WebDavClient, crate::error::AppError> {
        // 获取活动连接 ID
        let active_id = self
            .active_connection_id
            .lock()
            .map_err(|e| crate::error::AppError::Io(std::io::Error::other(e.to_string())))?
            .clone();

        let id = active_id.ok_or(crate::error::AppError::NotConnected)?;

        // 从连接池获取客户端
        let conns = self
            .connections
            .lock()
            .map_err(|e| crate::error::AppError::Io(std::io::Error::other(e.to_string())))?;

        // 克隆客户端以释放锁后再进行异步操作
        let client = conns.get(&id).ok_or(crate::error::AppError::NotConnected)?;
        Ok(WebDavClient::clone_client(client))
    }
}
