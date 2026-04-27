//! 文件下载命令

use crate::error::AppError;
use crate::webdav::AppState;
use std::io::Write;
use tauri::State;

/// 下载文件并返回字节数组给前端
#[tauri::command]
pub async fn download_file(
    state: State<'_, AppState>,
    path: String,
) -> Result<Vec<u8>, AppError> {
    let client = state.get_client()?;
    client.download(&path).await
}

/// 下载文件并保存到本地路径
///
/// 适用于大文件下载，避免数据经过前端传输
#[tauri::command]
pub async fn download_file_to(
    state: State<'_, AppState>,
    path: String,
    local_path: String,
) -> Result<(), AppError> {
    let client = state.get_client()?;
    let data = client.download(&path).await?;

    // 直接写入本地文件系统
    let mut file = std::fs::File::create(&local_path)?;
    file.write_all(&data)?;
    Ok(())
}
