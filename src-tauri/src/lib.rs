//! WebDAV 桌面客户端 Tauri 应用库

mod commands;
mod error;
mod streaming;
mod webdav;

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder},
    Emitter, Manager, RunEvent,
};
use webdav::AppState;

/// 用户已确认退出的标志，用于跳出 ExitRequested → prevent_exit 的死循环
struct ExitConfirmed(AtomicBool);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = AppState::default();
    let port = streaming::start_http_server(state.stream_paths.clone());
    *state.streaming_port.lock().unwrap() = port;

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .manage(ExitConfirmed(AtomicBool::new(false)))
        .invoke_handler(tauri::generate_handler![
            commands::connection::connect,
            commands::connection::disconnect,
            commands::connection::test_connection,
            commands::connection::save_profile,
            commands::connection::load_profiles,
            commands::connection::delete_profile,
            commands::files::list_directory,
            commands::download::download_file,
            commands::download::download_file_to,
            commands::upload::upload_file,
            commands::upload::upload_local_file,
            commands::operations::create_folder,
            commands::operations::delete_item,
            commands::operations::rename_item,
            commands::operations::move_item,
            commands::operations::copy_item,
            commands::preview::get_preview_data,
            commands::preview::start_video_stream,
            commands::preview::stop_video_stream,
            commands::edit::get_text_content,
            commands::edit::save_text_content,
            commands::app::confirm_exit,
            commands::app::get_system_locale,
        ])
        .setup(|app| {
            let quit = MenuItemBuilder::with_id("custom_quit", "Quit WebDAV Client")
                .accelerator("CmdOrCtrl+Q")
                .build(app)?;

            let app_menu = SubmenuBuilder::new(app, "WebDAV Client")
                .item(&quit)
                .separator()
                .item(&PredefinedMenuItem::services(app, None)?)
                .separator()
                .item(&PredefinedMenuItem::hide(app, None)?)
                .item(&PredefinedMenuItem::hide_others(app, None)?)
                .item(&PredefinedMenuItem::show_all(app, None)?)
                .build()?;

            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .item(&PredefinedMenuItem::undo(app, None)?)
                .item(&PredefinedMenuItem::redo(app, None)?)
                .separator()
                .item(&PredefinedMenuItem::cut(app, None)?)
                .item(&PredefinedMenuItem::copy(app, None)?)
                .item(&PredefinedMenuItem::paste(app, None)?)
                .item(&PredefinedMenuItem::select_all(app, None)?)
                .build()?;

            let window_menu = SubmenuBuilder::new(app, "Window")
                .item(&PredefinedMenuItem::minimize(app, None)?)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&app_menu)
                .item(&edit_menu)
                .item(&window_menu)
                .build()?;

            app.set_menu(menu)?;

            let handle = app.handle().clone();
            app.on_menu_event(move |_app, event| {
                if event.id() == "custom_quit" {
                    if let Some(window) = handle.get_webview_window("main") {
                        let _ = window.emit("close-requested", ());
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.emit("close-requested", ());
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                let confirmed = app.state::<ExitConfirmed>();
                if confirmed.0.load(Ordering::Relaxed) {
                    return;
                }
                api.prevent_exit();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("close-requested", ());
                }
            }
        });
}
