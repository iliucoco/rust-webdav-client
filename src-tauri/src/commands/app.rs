use crate::ExitConfirmed;
use std::sync::atomic::Ordering;
use tauri::Manager;

#[tauri::command]
pub async fn confirm_exit(app: tauri::AppHandle) {
    app.state::<ExitConfirmed>().0.store(true, Ordering::Relaxed);
    app.exit(0);
}

#[tauri::command]
pub fn get_system_locale() -> String {
    sys_locale::get_locale().unwrap_or_else(|| String::from("en"))
}
