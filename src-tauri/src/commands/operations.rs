//! 文件操作命令
//!
//! 提供创建文件夹、删除、重命名、移动、复制功能

use crate::error::AppError;
use crate::webdav::AppState;
use tauri::State;

/// 创建新文件夹
#[tauri::command]
pub async fn create_folder(state: State<'_, AppState>, path: String) -> Result<(), AppError> {
    log::info!("Creating folder: {}", path);
    let client = state.get_client()?;
    client.create_folder(&path).await
}

/// 删除文件或文件夹
#[tauri::command]
pub async fn delete_item(state: State<'_, AppState>, path: String) -> Result<(), AppError> {
    let client = state.get_client()?;
    client.delete(&path).await
}

/// 重命名文件或文件夹
#[tauri::command]
pub async fn rename_item(state: State<'_, AppState>, from: String, to: String) -> Result<(), AppError> {
    let client = state.get_client()?;
    client.rename(&from, &to).await
}

/// 移动文件或文件夹
///
/// 底层使用与重命名相同的 MOVE 方法
#[tauri::command]
pub async fn move_item(state: State<'_, AppState>, from: String, to: String) -> Result<(), AppError> {
    let client = state.get_client()?;
    client.rename(&from, &to).await
}

/// 复制文件或文件夹
#[tauri::command]
pub async fn copy_item(state: State<'_, AppState>, from: String, to: String) -> Result<(), AppError> {
    let client = state.get_client()?;
    client.copy(&from, &to).await
}
