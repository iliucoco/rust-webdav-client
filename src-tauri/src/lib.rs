//! WebDAV 桌面客户端 Tauri 应用库
//!
//! 提供跨平台 WebDAV 文件管理功能，包括：
//! - 多连接管理
//! - 文件浏览与预览
//! - 文件上传/下载
//! - 文本文件在线编辑

mod commands;
mod error;
mod webdav;

use webdav::AppState;

/// Tauri 应用入口
///
/// 初始化 Tauri 应用并注册所有插件、状态和 IPC 命令处理器
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 持久化存储插件 - 用于保存连接配置
        .plugin(tauri_plugin_store::Builder::default().build())
        // 对话框插件 - 文件选择/保存对话框
        .plugin(tauri_plugin_dialog::init())
        // 文件系统插件 - 本地文件操作
        .plugin(tauri_plugin_fs::init())
        // 应用状态管理 - WebDAV 连接池
        .manage(AppState::default())
        // 注册所有 IPC 命令处理函数
        .invoke_handler(tauri::generate_handler![
            // 连接管理命令
            commands::connection::connect,
            commands::connection::disconnect,
            commands::connection::test_connection,
            commands::connection::save_profile,
            commands::connection::load_profiles,
            commands::connection::delete_profile,
            // 文件浏览命令
            commands::files::list_directory,
            // 下载命令
            commands::download::download_file,
            commands::download::download_file_to,
            // 上传命令
            commands::upload::upload_file,
            commands::upload::upload_local_file,
            // 文件操作命令
            commands::operations::create_folder,
            commands::operations::delete_item,
            commands::operations::rename_item,
            commands::operations::move_item,
            commands::operations::copy_item,
            // 预览命令
            commands::preview::get_preview_data,
            // 文本编辑命令
            commands::edit::get_text_content,
            commands::edit::save_text_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
