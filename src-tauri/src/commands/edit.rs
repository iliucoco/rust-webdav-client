//! 文本编辑命令
//!
//! 提供文本文件的读取和写入功能

use crate::error::AppError;
use crate::webdav::AppState;
use tauri::State;

/// 文本编辑的最大文件大小限制（5MB）
const MAX_TEXT_SIZE: u64 = 5 * 1024 * 1024;

/// 获取文件文本内容
///
/// 超过大小限制的文件不允许在线编辑
#[tauri::command]
pub async fn get_text_content(
    state: State<'_, AppState>,
    path: String,
    size: Option<u64>,
) -> Result<String, AppError> {
    // 检查文件大小是否超过编辑限制
    if let Some(s) = size {
        if s > MAX_TEXT_SIZE {
            return Err(AppError::WebDav(format!(
                "File too large to edit ({:.1} MB). Please download to edit locally.",
                s as f64 / 1024.0 / 1024.0
            )));
        }
    }

    let client = state.get_client()?;
    client.get_text(&path).await
}

/// 保存文本内容到文件
#[tauri::command]
pub async fn save_text_content(
    state: State<'_, AppState>,
    path: String,
    content: String,
) -> Result<(), AppError> {
    let client = state.get_client()?;
    client.put_text(&path, content).await
}
