import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface JsonStats {
  key_count: number;
  max_depth: number;
  object_count: number;
  array_count: number;
}

interface JsonValidationResult {
  is_valid: boolean;
  error: string | null;
  stats: JsonStats | null;
}

interface JsonToolProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

function JsonTool({ isDarkMode, setIsDarkMode }: JsonToolProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [validation, setValidation] = useState<JsonValidationResult | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  // 高亮代码
  const highlightCode = (code: string) => {
    try {
      const highlighted = hljs.highlight(code, { language: 'json' }).value;
      return highlighted;
    } catch (err) {
      return code;
    }
  };

  // 格式化 JSON
  const handleFormat = async () => {
    if (!input.trim()) {
      setError('请输入 JSON 字符串');
      return;
    }

    try {
      setError('');
      const result = await invoke<string>('format_json', { jsonStr: input });
      setOutput(result);
      setValidation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '格式化失败');
      setOutput('');
    }
  };

  // 压缩 JSON
  const handleMinify = async () => {
    if (!input.trim()) {
      setError('请输入 JSON 字符串');
      return;
    }

    try {
      setError('');
      const result = await invoke<string>('minify_json', { jsonStr: input });
      setOutput(result);
      setValidation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '压缩失败');
      setOutput('');
    }
  };

  // 验证 JSON
  const handleValidate = async () => {
    if (!input.trim()) {
      setError('请输入 JSON 字符串');
      return;
    }

    try {
      setError('');
      const result = await invoke<JsonValidationResult>('validate_json', { jsonStr: input });
      setValidation(result);

      if (result.is_valid) {
        // 验证成功，显示格式化结果
        const formatted = await invoke<string>('format_json', { jsonStr: input });
        setOutput(formatted);
      } else {
        setOutput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败');
    }
  };

  // 清空
  const handleClear = () => {
    setInput('');
    setOutput('');
    setValidation(null);
    setError('');
    setFileName(null);
  };

  // 导入文件
  const handleImportFile = async () => {
    try {
      setError('');
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (selected && typeof selected === 'string') {
        const content = await invoke<string>('read_json_file', { filePath: selected });
        setInput(content);
        setFileName(selected);
        setOutput('');
        setValidation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入文件失败');
    }
  };

  // 导出文件
  const handleExportFile = async () => {
    try {
      setError('');
      const contentToExport = output || input;

      if (!contentToExport.trim()) {
        setError('没有可导出的内容');
        return;
      }

      const savePath = await save({
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (savePath) {
        await invoke('write_json_file', { filePath: savePath, content: contentToExport });
        setFileName(savePath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出文件失败');
    }
  };

  // 复制到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加成功提示
    } catch (err) {
      setError('复制失败');
    }
  };

  // 快捷键支持
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleFormat();
    }
  };

  return (
    <div className="json-tool">
      {/* 工具栏 */}
      <div className="json-toolbar">
        <button className="toolbar-btn" onClick={handleImportFile}>
          📂 导入
        </button>
        <button className="toolbar-btn" onClick={handleExportFile}>
          💾 导出
        </button>
        <div className="toolbar-divider"></div>
        <button className="toolbar-btn" onClick={handleFormat}>
          ✨ 格式化
        </button>
        <button className="toolbar-btn" onClick={handleMinify}>
          🗜️ 压缩
        </button>
        <button className="toolbar-btn" onClick={handleValidate}>
          ✅ 验证
        </button>
        <button className="toolbar-btn clear" onClick={handleClear}>
          🔄 清空
        </button>
      </div>

      {/* 文件名显示 */}
      {fileName && (
        <div className="file-info">
          📄 当前文件: {fileName}
        </div>
      )}

      {/* 输入区 */}
      <div className="json-section">
        <label className="json-label">JSON 输入</label>
        <textarea
          className="json-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="在此输入 JSON 字符串...&#10;快捷键: Ctrl+Enter 快速格式化"
          spellCheck={false}
        />
      </div>

      {/* 操作提示 */}
      <div className="json-hint">
        💡 提示: 使用 Ctrl+Enter 快速格式化
      </div>

      {/* 输出区 */}
      {output && (
        <div className="json-section">
          <label className="json-label">
            输出结果
            <button
              className="copy-btn-inline"
              onClick={() => handleCopy(output)}
              title="复制结果"
            >
              📋 复制
            </button>
          </label>
          <pre className="json-output">
            <code
              className="language-json hljs"
              dangerouslySetInnerHTML={{ __html: highlightCode(output) }}
            />
          </pre>
        </div>
      )}

      {/* 统计信息 */}
      {validation && validation.is_valid && validation.stats && (
        <div className="json-stats">
          <span className="stat-item valid">✅ JSON 有效</span>
          <span className="stat-item">🔢 {validation.stats.key_count} 个键</span>
          <span className="stat-item">📊 深度: {validation.stats.max_depth} 层</span>
          <span className="stat-item">📦 {validation.stats.object_count} 对象</span>
          <span className="stat-item">📋 {validation.stats.array_count} 数组</span>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="json-error">
          ❌ {error}
        </div>
      )}

      {validation && !validation.is_valid && validation.error && (
        <div className="json-error">
          ❌ {validation.error}
        </div>
      )}
    </div>
  );
}

export default JsonTool;
