//! 应用错误类型定义
//!
//! 统一处理所有可能的错误类型，并支持通过 Tauri IPC 序列化传递

/// 应用全局错误枚举
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    /// WebDAV 协议相关错误
    #[error("WebDAV error: {0}")]
    WebDav(String),
    /// 本地 IO 操作错误
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    /// 未连接到 WebDAV 服务器
    #[error("Not connected")]
    NotConnected,
    /// 序列化/反序列化错误
    #[error("Serialization error: {0}")]
    Serialization(String),
}

/// 错误序列化实现 - 用于通过 Tauri IPC 传递给前端
impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

/// 从 reqwest_dav 错误转换为应用错误
impl From<reqwest_dav::Error> for AppError {
    fn from(e: reqwest_dav::Error) -> Self {
        AppError::WebDav(e.to_string())
    }
}
