import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';
import JsonTool from './JsonTool';

interface EnvVar {
  key: string;
  value: string;
  is_valid: boolean;
  error_message: string | null;
}

interface ValidationResult {
  is_valid: boolean;
  message: string;
}

type ActiveSection = 'env' | 'json';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('env');
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 新环境变量表单
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // 编辑环境变量表单
  const [editValue, setEditValue] = useState('');

  // 加载环境变量
  const loadEnvVars = async () => {
    try {
      const vars = await invoke<EnvVar[]>('get_env_vars');
      setEnvVars(vars);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载环境变量失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    loadEnvVars();
  }, []);

  // 验证新变量
  useEffect(() => {
    const validateNewVar = async () => {
      if (!newKey.trim() || !newValue.trim()) {
        setValidation(null);
        return;
      }

      try {
        const result = await invoke<[boolean, string | null]>('validate_env_value', {
          key: newKey,
          value: newValue,
        });
        const [isValid, message] = result;
        setValidation({
          is_valid: isValid,
          message: message || '变量有效',
        });
      } catch (err) {
        console.error('验证失败:', err);
      }
    };

    validateNewVar();
  }, [newKey, newValue]);

  // 添加环境变量
  const handleAdd = async () => {
    if (!validation?.is_valid) {
      setError('请先修正验证错误');
      return;
    }

    try {
      await invoke('add_env_var', { key: newKey, value: newValue });
      setSuccess('环境变量添加成功');
      setIsAdding(false);
      setNewKey('');
      setNewValue('');
      setValidation(null);
      setTimeout(() => setSuccess(''), 3000);
      loadEnvVars();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
      setTimeout(() => setError(''), 5000);
    }
  };

  // 开始编辑
  const handleEdit = (envVar: EnvVar) => {
    setEditingKey(envVar.key);
    setEditValue(envVar.value);
  };

  // 保存编辑
  const handleSaveEdit = async (key: string) => {
    try {
      await invoke('update_env_var', { key, value: editValue });
      setSuccess('环境变量更新成功');
      setEditingKey(null);
      setEditValue('');
      setTimeout(() => setSuccess(''), 3000);
      loadEnvVars();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
      setTimeout(() => setError(''), 5000);
    }
  };

  // 删除环境变量
  const handleDelete = async (key: string) => {
    if (!confirm(`确定要删除环境变量 "${key}" 吗？`)) {
      return;
    }

    try {
      await invoke('delete_env_var', { key });
      setSuccess(`环境变量 "${key}" 已删除`);
      setTimeout(() => setSuccess(''), 3000);
      loadEnvVars();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      setTimeout(() => setError(''), 5000);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  // 复制到剪贴板
  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setSuccess('已复制到剪贴板');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('复制失败');
      setTimeout(() => setError(''), 2000);
    }
  };

  // 过滤环境变量
  const filteredVars = envVars.filter((envVar) =>
    envVar.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    envVar.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="app-layout">
        {/* 侧边栏 */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>🛠️ 工具箱</h1>
          </div>
          <nav className="sidebar-nav">
            <button
              className={activeSection === 'env' ? 'active' : ''}
              onClick={() => setActiveSection('env')}
            >
              🔧 环境变量
            </button>
            <button
              className={activeSection === 'json' ? 'active' : ''}
              onClick={() => setActiveSection('json')}
            >
              📄 JSON 工具
            </button>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="main-content">
          {activeSection === 'env' ? (
            <>
              {/* 头部 */}
              <header className="header">
                <div className="header-content">
                  <h1>🔧 环境变量管理器</h1>
                  <div className="header-actions">
                    <button
                      className="theme-toggle"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      title={isDarkMode ? '切换到亮色主题' : '切换到暗色主题'}
                    >
                      {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button
                      className="refresh-btn"
                      onClick={loadEnvVars}
                      title="刷新"
                    >
                      🔄
                    </button>
                    <button
                      className="add-btn"
                      onClick={() => setIsAdding(true)}
                    >
                      ➕ 添加变量
                    </button>
                  </div>
                </div>
              </header>

              {/* 搜索栏 */}
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="搜索环境变量 (键或值)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* 添加表单 */}
              {isAdding && (
                <div className="add-form">
                  <h3>添加新的环境变量</h3>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="变量名 (例如: NODE_ENV)"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="变量值 (例如: production)"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  </div>
                  {validation && (
                    <div className={`validation ${validation.is_valid ? 'valid' : 'invalid'}`}>
                      {validation.is_valid ? '✅' : '❌'} {validation.message}
                    </div>
                  )}
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleAdd} disabled={!validation?.is_valid}>
                      💾 保存
                    </button>
                    <button className="cancel-btn" onClick={() => {
                      setIsAdding(false);
                      setNewKey('');
                      setNewValue('');
                      setValidation(null);
                    }}>
                      ❌ 取消
                    </button>
                  </div>
                </div>
              )}

              {/* 消息提示 */}
              {error && <div className="message error-message">{error}</div>}
              {success && <div className="message success-message">{success}</div>}

              {/* 环境变量表格 */}
              <div className="table-container">
                <table className="env-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>变量名</th>
                      <th style={{ width: '55%' }}>值</th>
                      <th style={{ width: '10%' }}>状态</th>
                      <th style={{ width: '10%' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVars.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-state">
                          {searchTerm ? '没有找到匹配的环境变量' : '暂无环境变量'}
                        </td>
                      </tr>
                    ) : (
                      filteredVars.map((envVar) => (
                        <tr key={envVar.key}>
                          <td className="var-key">
                            <code>{envVar.key}</code>
                          </td>
                          <td className="var-value">
                            {editingKey === envVar.key ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="edit-input"
                              />
                            ) : (
                              <div className="value-content">
                                <span className="value-text" title={envVar.value}>
                                  {envVar.value.length > 50
                                    ? envVar.value.substring(0, 50) + '...'
                                    : envVar.value}
                                </span>
                                {envVar.value.length > 50 && (
                                  <button
                                    className="copy-btn"
                                    onClick={() => handleCopy(envVar.value)}
                                    title="复制完整值"
                                  >
                                    📋
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="var-status">
                            {envVar.is_valid ? (
                              <span className="status-badge valid">✅ 有效</span>
                            ) : (
                              <span className="status-badge invalid" title={envVar.error_message || ''}>
                                ❌ 无效
                              </span>
                            )}
                          </td>
                          <td className="var-actions">
                            {editingKey === envVar.key ? (
                              <>
                                <button
                                  className="action-btn save"
                                  onClick={() => handleSaveEdit(envVar.key)}
                                  title="保存"
                                >
                                  💾
                                </button>
                                <button
                                  className="action-btn cancel"
                                  onClick={handleCancelEdit}
                                  title="取消"
                                >
                                  ❌
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="action-btn edit"
                                  onClick={() => handleEdit(envVar)}
                                  title="编辑"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDelete(envVar.key)}
                                  title="删除"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 底部信息 */}
              <footer className="footer">
                <p>共 {envVars.length} 个环境变量 | 显示 {filteredVars.length} 个</p>
                <p className="hint">💡 修改的环境变量会保存到 shell 配置文件中</p>
              </footer>
            </>
          ) : (
            <JsonTool isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
