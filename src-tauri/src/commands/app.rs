#[tauri::command]
pub async fn confirm_exit(app: tauri::AppHandle) {
    app.exit(0);
}
