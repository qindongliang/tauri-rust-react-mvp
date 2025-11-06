// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};
use std::env;
use std::fs;
use std::path::PathBuf;

// 环境变量数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnvVar {
    pub key: String,
    pub value: String,
    pub is_valid: bool,
    pub error_message: Option<String>,
}

// JSON 统计信息
#[derive(Debug, Serialize, Deserialize)]
pub struct JsonStats {
    pub key_count: usize,
    pub max_depth: usize,
    pub object_count: usize,
    pub array_count: usize,
}

// JSON 验证结果
#[derive(Debug, Serialize, Deserialize)]
pub struct JsonValidationResult {
    pub is_valid: bool,
    pub error: Option<String>,
    pub stats: Option<JsonStats>,
}

// 获取所有用户环境变量
#[tauri::command]
async fn get_env_vars() -> Result<Vec<EnvVar>, String> {
    let mut vars = Vec::new();

    for (key, value) in env::vars() {
        let (is_valid, error_message) = validate_env_value_internal(&key, &value);
        vars.push(EnvVar {
            key,
            value,
            is_valid,
            error_message,
        });
    }

    // 按键名排序
    vars.sort_by(|a, b| a.key.to_lowercase().cmp(&b.key.to_lowercase()));

    Ok(vars)
}

// 添加环境变量
#[tauri::command]
async fn add_env_var(key: String, value: String) -> Result<(), String> {
    // 验证变量名格式
    if key.trim().is_empty() {
        return Err("变量名不能为空".to_string());
    }

    if !is_valid_var_name(&key) {
        return Err("变量名只能包含字母、数字和下划线，且必须以字母或下划线开头".to_string());
    }

    // 检查是否已存在
    if env::var(&key).is_ok() {
        return Err("该环境变量已存在".to_string());
    }

    // 添加到当前进程环境变量
    env::set_var(&key, &value);

    // 写入shell配置文件
    write_to_shell_config(&key, &value)?;

    Ok(())
}

// 更新环境变量
#[tauri::command]
async fn update_env_var(key: String, value: String) -> Result<(), String> {
    if key.trim().is_empty() {
        return Err("变量名不能为空".to_string());
    }

    // 更新当前进程环境变量
    env::set_var(&key, &value);

    // 更新shell配置文件
    update_shell_config(&key, &value)?;

    Ok(())
}

// 删除环境变量
#[tauri::command]
async fn delete_env_var(key: String) -> Result<(), String> {
    if key.trim().is_empty() {
        return Err("变量名不能为空".to_string());
    }

    // 从当前进程环境变量移除
    env::remove_var(&key);

    // 从shell配置文件移除
    remove_from_shell_config(&key)?;

    Ok(())
}

// 验证环境变量值 - 返回序列化的验证结果
#[tauri::command]
async fn validate_env_value(key: &str, value: &str) -> Result<(bool, Option<String>), String> {
    let (is_valid, error_message) = validate_env_value_internal(key, value);
    Ok((is_valid, error_message))
}

// 内部验证函数
fn validate_env_value_internal(key: &str, value: &str) -> (bool, Option<String>) {
    // 验证变量名格式
    if !is_valid_var_name(key) {
        return (false, Some("变量名格式无效".to_string()));
    }

    // 验证值
    if value.trim().is_empty() {
        return (false, Some("值不能为空".to_string()));
    }

    // 如果值看起来像路径，检查路径是否存在
    if value.contains('/') || value.contains('\\') {
        let path = PathBuf::from(value);
        if !path.exists() {
            return (false, Some("路径不存在".to_string()));
        }
    }

    (true, None)
}

// 检查变量名是否有效
fn is_valid_var_name(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let first_char = name.chars().next().unwrap();
    if !first_char.is_ascii_alphabetic() && first_char != '_' {
        return false;
    }

    name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
}

// 获取shell配置文件路径
fn get_shell_config_path() -> Result<PathBuf, String> {
    let home = env::var("HOME").map_err(|_| "无法获取HOME目录".to_string())?;

    let shell = env::var("SHELL").unwrap_or_default();
    let config_file = if shell.contains("zsh") {
        format!("{}/.zshrc", home)
    } else {
        format!("{}/.bashrc", home)
    };

    Ok(PathBuf::from(config_file))
}

// 写入shell配置文件
fn write_to_shell_config(key: &str, value: &str) -> Result<(), String> {
    let config_path = get_shell_config_path()?;

    // 如果文件不存在，尝试创建
    if !config_path.exists() {
        // 尝试创建基本的配置文件
        let basic_config = format!("# Environment variables configuration\n");
        fs::write(&config_path, basic_config)
            .map_err(|e| format!("无法创建配置文件: {}", e))?;
    }

    // 读取现有内容
    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("无法读取配置文件: {}", e))?;

    // 检查是否已存在该变量
    let export_pattern = format!("export {}", key);
    if content.contains(&export_pattern) {
        return Err("配置文件已包含该变量，请使用更新功能".to_string());
    }

    // 添加新的环境变量
    let mut new_content = content;
    if !new_content.ends_with('\n') {
        new_content.push('\n');
    }
    new_content.push_str(&format!("export {}={}\n", key, value));

    // 写入文件
    fs::write(&config_path, new_content)
        .map_err(|e| format!("无法写入配置文件: {}", e))?;

    Ok(())
}

// 更新shell配置文件
fn update_shell_config(key: &str, value: &str) -> Result<(), String> {
    let config_path = get_shell_config_path()?;

    if !config_path.exists() {
        return write_to_shell_config(key, value);
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("无法读取配置文件: {}", e))?;

    let export_line = format!("export {}=", key);
    let lines: Vec<&str> = content.split('\n').collect();
    let mut new_lines: Vec<String> = Vec::new();
    let mut found = false;

    for line in lines {
        if line.starts_with(&export_line) {
            new_lines.push(format!("export {}={}", key, value));
            found = true;
        } else {
            new_lines.push(line.to_string());
        }
    }

    // 如果未找到，添加新行
    if !found {
        new_lines.push(format!("export {}={}", key, value));
    }

    let new_content = new_lines.join("\n");
    fs::write(&config_path, new_content)
        .map_err(|e| format!("无法写入配置文件: {}", e))?;

    Ok(())
}

// 从shell配置文件删除
fn remove_from_shell_config(key: &str) -> Result<(), String> {
    let config_path = get_shell_config_path()?;

    if !config_path.exists() {
        return Ok(());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("无法读取配置文件: {}", e))?;

    let export_pattern = format!("export {}", key);
    let lines: Vec<&str> = content.split('\n').collect();
    let new_lines: Vec<String> = lines
        .into_iter()
        .filter(|line| !line.starts_with(&export_pattern) && !line.trim().is_empty())
        .map(|line| line.to_string())
        .collect();

    let new_content = new_lines.join("\n");
    fs::write(&config_path, new_content)
        .map_err(|e| format!("无法写入配置文件: {}", e))?;

    Ok(())
}

// =======================
// 文件操作命令
// =======================

// 读取 JSON 文件
#[tauri::command]
async fn read_json_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path)
        .map_err(|e| format!("读取文件失败: {}", e))
}

// 写入 JSON 文件
#[tauri::command]
async fn write_json_file(file_path: String, content: String) -> Result<(), String> {
    fs::write(&file_path, content)
        .map_err(|e| format!("写入文件失败: {}", e))
}

// =======================
// JSON 工具命令
// =======================

// 格式化 JSON
#[tauri::command]
async fn format_json(json_str: String) -> Result<String, String> {
    if json_str.trim().is_empty() {
        return Err("JSON 字符串不能为空".to_string());
    }

    // 解析 JSON
    let value: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("JSON 解析错误: {}", e))?;

    // 美化输出（缩进 2 空格）
    let formatted = serde_json::to_string_pretty(&value)
        .map_err(|e| format!("格式化失败: {}", e))?;

    Ok(formatted)
}

// 压缩 JSON
#[tauri::command]
async fn minify_json(json_str: String) -> Result<String, String> {
    if json_str.trim().is_empty() {
        return Err("JSON 字符串不能为空".to_string());
    }

    // 解析 JSON
    let value: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("JSON 解析错误: {}", e))?;

    // 压缩输出（无空格）
    let minified = serde_json::to_string(&value)
        .map_err(|e| format!("压缩失败: {}", e))?;

    Ok(minified)
}

// 验证 JSON
#[tauri::command]
async fn validate_json(json_str: String) -> Result<JsonValidationResult, String> {
    if json_str.trim().is_empty() {
        return Ok(JsonValidationResult {
            is_valid: false,
            error: Some("JSON 字符串不能为空".to_string()),
            stats: None,
        });
    }

    // 尝试解析 JSON
    match serde_json::from_str::<serde_json::Value>(&json_str) {
        Ok(value) => {
            let stats = calculate_json_stats(&value);
            Ok(JsonValidationResult {
                is_valid: true,
                error: None,
                stats: Some(stats),
            })
        }
        Err(e) => Ok(JsonValidationResult {
            is_valid: false,
            error: Some(e.to_string()),
            stats: None,
        }),
    }
}

// 计算 JSON 统计信息
fn calculate_json_stats(value: &serde_json::Value) -> JsonStats {
    let mut key_count = 0;
    let mut max_depth = 0;
    let mut object_count = 0;
    let mut array_count = 0;

    fn calculate_depth(
        value: &serde_json::Value,
        current_depth: usize,
        key_count: &mut usize,
        max_depth: &mut usize,
        object_count: &mut usize,
        array_count: &mut usize,
    ) {
        *max_depth = (*max_depth).max(current_depth);

        match value {
            serde_json::Value::Object(map) => {
                *object_count += 1;
                *key_count += map.len();
                for v in map.values() {
                    calculate_depth(v, current_depth + 1, key_count, max_depth, object_count, array_count);
                }
            }
            serde_json::Value::Array(arr) => {
                *array_count += 1;
                for v in arr {
                    calculate_depth(v, current_depth + 1, key_count, max_depth, object_count, array_count);
                }
            }
            _ => {}
        }
    }

    calculate_depth(value, 0, &mut key_count, &mut max_depth, &mut object_count, &mut array_count);

    JsonStats {
        key_count,
        max_depth,
        object_count,
        array_count,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // 环境变量管理
            get_env_vars,
            add_env_var,
            update_env_var,
            delete_env_var,
            validate_env_value,
            // 文件操作
            read_json_file,
            write_json_file,
            // JSON 工具
            format_json,
            minify_json,
            validate_json
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
