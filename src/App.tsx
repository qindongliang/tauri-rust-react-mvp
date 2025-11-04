import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

interface ProcessOutput {
  result: string;
  original: string;
  length: number;
}

interface SystemInfo {
  platform: string;
  architecture: string;
  cargo_version: string;
}

function App() {
  const [inputText, setInputText] = useState('')
  const [processResult, setProcessResult] = useState<ProcessOutput | null>(null)
  const [error, setError] = useState('')
  const [numA, setNumA] = useState('')
  const [numB, setNumB] = useState('')
  const [sumResult, setSumResult] = useState<number | null>(null)
  const [fibN, setFibN] = useState('')
  const [fibResult, setFibResult] = useState<number | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  // 加载系统信息
  useEffect(() => {
    loadSystemInfo()
  }, [])

  const loadSystemInfo = async () => {
    try {
      const info = await invoke<SystemInfo>('get_system_info')
      setSystemInfo(info)
    } catch (err) {
      console.error('Failed to load system info:', err)
    }
  }

  const handleTextProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setProcessResult(null)

    try {
      const response = await invoke<ProcessOutput>('process_text', {
        text: inputText
      })
      setProcessResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleCalculateSum = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSumResult(null)

    try {
      const result = await invoke<number>('calculate_sum', {
        a: parseInt(numA),
        b: parseInt(numB)
      })
      setSumResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleFibonacci = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFibResult(null)

    try {
      const result = await invoke<number>('fibonacci', {
        n: parseInt(fibN)
      })
      setFibResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🚀 Tauri + React + Rust</h1>
        <p className="description">
          一个展示 React 前端与 Rust 后端通信的 MVP 示例
        </p>

        {/* 系统信息 */}
        {systemInfo && (
          <div className="system-info">
            <h3>💻 系统信息</h3>
            <p><strong>平台:</strong> {systemInfo.platform}</p>
            <p><strong>架构:</strong> {systemInfo.architecture}</p>
            <p><strong>Rust 版本:</strong> {systemInfo.cargo_version}</p>
          </div>
        )}

        {/* 文本处理 */}
        <div className="feature-section">
          <h3>📝 文本处理 (反转字符串)</h3>
          <form onSubmit={handleTextProcess}>
            <div className="input-group">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入要处理的文本..."
                required
              />
            </div>
            <button type="submit">处理文本</button>
          </form>

          {processResult && (
            <div className="result">
              <strong>处理结果:</strong>
              <p>{processResult.result}</p>
              <p className="details">
                <small>原文: {processResult.original} | 长度: {processResult.length}</small>
              </p>
            </div>
          )}
        </div>

        {/* 数字计算 */}
        <div className="feature-section">
          <h3>🔢 数字加法计算</h3>
          <form onSubmit={handleCalculateSum}>
            <div className="input-group-row">
              <input
                type="number"
                value={numA}
                onChange={(e) => setNumA(e.target.value)}
                placeholder="数字 A"
                required
              />
              <span className="operator">+</span>
              <input
                type="number"
                value={numB}
                onChange={(e) => setNumB(e.target.value)}
                placeholder="数字 B"
                required
              />
            </div>
            <button type="submit">计算和</button>
          </form>

          {sumResult !== null && (
            <div className="result">
              <strong>计算结果:</strong> {numA} + {numB} = {sumResult}
            </div>
          )}
        </div>

        {/* 斐波那契数列 */}
        <div className="feature-section">
          <h3>🌀 斐波那契数列</h3>
          <form onSubmit={handleFibonacci}>
            <div className="input-group">
              <input
                type="number"
                value={fibN}
                onChange={(e) => setFibN(e.target.value)}
                placeholder="输入 n (0-50)"
                min="0"
                max="50"
                required
              />
            </div>
            <button type="submit">计算 fib(n)</button>
          </form>

          {fibResult !== null && (
            <div className="result">
              <strong>斐波那契结果:</strong> fib({fibN}) = {fibResult}
            </div>
          )}
        </div>

        {error && (
          <div className="error">
            <strong>错误:</strong> {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
