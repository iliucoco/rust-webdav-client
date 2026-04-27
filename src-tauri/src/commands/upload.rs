//! 文件上传命令

use crate::error::AppError;
use crate::webdav::AppState;
use std::io::Read;
use tauri::State;

/// 上传前端提供的字节数据到 WebDAV
#[tauri::command]
pub async fn upload_file(
    state: State<'_, AppState>,
    remote_path: String,
    data: Vec<u8>,
) -> Result<(), AppError> {
    let client = state.get_client()?;
    client.upload(&remote_path, data).await
}

/// 从本地文件系统直接读取并上传
///
/// 适用于大文件上传，避免数据经过前端传输
#[tauri::command]
pub async fn upload_local_file(
    state: State<'_, AppState>,
    remote_path: String,
    local_path: String,
) -> Result<(), AppError> {
    log::info!("Uploading file to: {}", remote_path);
    // 读取本地文件到内存
    let mut file = std::fs::File::open(&local_path)?;
    let mut data = Vec::new();
    file.read_to_end(&mut data)?;
    log::info!("File size: {} bytes", data.len());

    let client = state.get_client()?;
    client.upload(&remote_path, data).await
}
