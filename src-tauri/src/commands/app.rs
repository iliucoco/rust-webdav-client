use crate::ExitConfirmed;
use std::sync::atomic::Ordering;
use tauri::Manager;

#[tauri::command]
pub async fn confirm_exit(app: tauri::AppHandle) {
    app.state::<ExitConfirmed>().0.store(true, Ordering::Relaxed);
    app.exit(0);
}
