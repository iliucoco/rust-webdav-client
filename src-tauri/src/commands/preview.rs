//! 文件预览命令

use crate::error::AppError;
use crate::webdav::AppState;
use tauri::State;

/// 获取文件预览数据
///
/// 与 download_file 相同，但专门用于前端预览目的
/// _size 参数保留用于未来的大小限制
#[tauri::command]
pub async fn get_preview_data(
    state: State<'_, AppState>,
    path: String,
    _size: Option<u64>,
) -> Result<Vec<u8>, AppError> {
    let client = state.get_client()?;
    Ok(client.download(&path).await?)
}
