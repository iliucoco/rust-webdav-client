//! 文件浏览命令

use crate::error::AppError;
use crate::webdav::types::FileMetadata;
use crate::webdav::AppState;
use tauri::State;

/// 列出指定目录下的所有文件和文件夹
#[tauri::command]
pub async fn list_directory(state: State<'_, AppState>, path: String) -> Result<Vec<FileMetadata>, AppError> {
    let client = state.get_client()?;
    client.list_dir(&path).await
}
