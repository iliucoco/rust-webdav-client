//! Tauri 应用二进制入口
//!
//! 委托给库中的 run() 函数执行

// release 构建时隐藏 Windows 控制台窗口；debug 模式保留以便调试
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// 主函数 - 应用程序入口
fn main() {
    rust_webdev_client_lib::run()
}
