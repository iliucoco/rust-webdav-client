//! Tauri IPC 命令模块
//!
//! 所有暴露给前端的命令处理函数按功能分组

/// 连接管理命令 - 连接、断开、配置持久化
pub mod connection;
/// 文件浏览命令 - 列出目录内容
pub mod files;
/// 上传命令 - 上传文件到 WebDAV 服务器
pub mod upload;
/// 下载命令 - 从 WebDAV 服务器下载文件
pub mod download;
/// 文件操作命令 - 创建文件夹、删除、重命名、移动、复制
pub mod operations;
/// 预览命令 - 获取文件预览数据
pub mod preview;
/// 编辑命令 - 文本文件读写
pub mod edit;
