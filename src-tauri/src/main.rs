// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;

// 输出数据结构
#[derive(Serialize)]
struct ProcessOutput {
    result: String,
    original: String,
    length: usize,
}

// 定义命令 - 处理输入文本
#[tauri::command]
fn process_text(text: String) -> Result<ProcessOutput, String> {
    if text.is_empty() {
        return Err("Input text cannot be empty".to_string());
    }

    // 简单的文本处理：反转字符串并添加后缀
    let reversed: String = text.chars().rev().collect();
    let output = ProcessOutput {
        result: format!("处理完成: {}", reversed),
        original: text.clone(),
        length: text.len(),
    };
    Ok(output)
}

// 计算两个数字的和
#[tauri::command]
fn calculate_sum(a: i64, b: i64) -> i64 {
    a + b
}

// 计算斐波那契数列
#[tauri::command]
fn fibonacci(n: u32) -> Result<u64, String> {
    if n > 50 {
        return Err("n too large (max 50)".to_string());
    }

    match n {
        0 => Ok(0),
        1 => Ok(1),
        _ => {
            let mut a = 0;
            let mut b = 1;
            for _ in 2..=n {
                let temp = a + b;
                a = b;
                b = temp;
            }
            Ok(b)
        }
    }
}

// 获取系统信息
#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "platform": std::env::consts::OS,
        "architecture": std::env::consts::ARCH,
        "cargo_version": env!("CARGO_PKG_VERSION"),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            process_text,
            calculate_sum,
            fibonacci,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
