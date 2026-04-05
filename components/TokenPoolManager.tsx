'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';

export default function TokenPoolManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { tokenPool, rotationInterval, addAccount, removeAccount, toggleAccount, clearPool, setRotationInterval } = useAuthStore();
  const [intervalInput, setIntervalInput] = useState(rotationInterval / 1000); // 轉換為秒

  const generateOneTimeCode = (accountId: string) => {
    const account = tokenPool.find(acc => acc.id === accountId);
    if (!account) {
      alert('❌ 找不到帳戶');
      return;
    }

    // 生成包含實際 Token 的一次性代碼
    const code = `(function(){fetch('https://gemiai.replit.app/api/public/receive-tokens',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({otp:'3a8f1cda-c4e6-44f0-be44-0bb0fa4f5a8d',access_token:'${account.accessToken}',refresh_token:'${account.refreshToken}',label:'3'})}).then(r=>r.json()).then(d=>{if(d.success)alert('✅ Token 已成功同步！');else alert('❌ 同步失敗：'+(d.error||'未知錯誤'));}).catch(()=>alert('❌ 無法連接'));})();`;
    
    navigator.clipboard.writeText(code);
    alert('✅ 已複製一次性代碼到剪貼簿！\n可在任何網站的 Console 中執行');
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return '從未使用';
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const formatInterval = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} 秒`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} 分鐘`;
    const hours = Math.floor(minutes / 60);
    return `${hours} 小時`;
  };

  const handleIntervalChange = (seconds: number) => {
    if (seconds < 0) seconds = 0;
    if (seconds > 86400) seconds = 86400; // 最大 24 小時
    setIntervalInput(seconds);
    setRotationInterval(seconds * 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors text-sm z-50 flex items-center gap-2"
      >
        <span>🔄</span>
        Token 池 ({tokenPool.length})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🔄</span>
              Token 帳戶池管理
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-gray-400 text-sm">
              管理多個 Token 帳戶，系統會自動使用 LRU（最近最少使用）策略輪替
            </p>
            <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                ⏱️ 輪替間隔：
              </label>
              <input
                type="number"
                min="0"
                max="86400"
                value={intervalInput}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="flex-1 bg-gray-700 text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-400">秒</span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {formatInterval(rotationInterval)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              💡 設定同一帳戶再次使用前的最小等待時間（0 = 無限制）
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-700 bg-gray-900/50">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{tokenPool.length}</div>
              <div className="text-xs text-gray-400">總帳戶數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {tokenPool.filter(a => a.isActive).length}
              </div>
              <div className="text-xs text-gray-400">啟用中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {tokenPool.reduce((sum, acc) => sum + acc.usageCount, 0)}
              </div>
              <div className="text-xs text-gray-400">總使用次數</div>
            </div>
          </div>

          {/* Usage Chart */}
          {tokenPool.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                📊 使用次數統計
              </h3>
              <div className="space-y-2">
                {tokenPool
                  .sort((a, b) => b.usageCount - a.usageCount)
                  .map((account) => {
                    const maxUsage = Math.max(...tokenPool.map(a => a.usageCount), 1);
                    const percentage = (account.usageCount / maxUsage) * 100;
                    return (
                      <div key={account.id} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-gray-400 truncate" title={account.label}>
                          {account.label}
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden relative">
                          <div
                            className={`h-full transition-all duration-500 ${
                              account.isActive
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                : 'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                            {account.usageCount} 次
                          </div>
                        </div>
                        <div className="w-12 text-xs text-gray-500 text-right">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Account List */}
        <div className="flex-1 overflow-y-auto p-6">
          {tokenPool.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400">尚無帳戶，請先在認證彈窗中加入帳戶</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokenPool
                .sort((a, b) => a.lastUsed - b.lastUsed)
                .map((account, index) => (
                  <div
                    key={account.id}
                    className={`p-4 rounded-lg border ${
                      account.isActive
                        ? 'bg-gray-900/50 border-gray-600'
                        : 'bg-gray-900/30 border-gray-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-white">
                            {account.label}
                          </span>
                          {index === 0 && account.isActive && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              下次使用
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              account.isActive
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {account.isActive ? '啟用' : '停用'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>
                            <span className="text-gray-500">使用次數：</span>
                            {account.usageCount}
                          </div>
                          <div>
                            <span className="text-gray-500">最後使用：</span>
                            {formatDate(account.lastUsed)}
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Token：</span>
                            <span className="font-mono">
                              {account.accessToken.substring(0, 20)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => generateOneTimeCode(account.id)}
                          className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded transition-colors"
                          title="生成一次性代碼"
                        >
                          📋 代碼
                        </button>
                        <button
                          onClick={() => toggleAccount(account.id)}
                          className={`text-xs px-3 py-1.5 rounded transition-colors ${
                            account.isActive
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {account.isActive ? '停用' : '啟用'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除「${account.label}」嗎？`)) {
                              removeAccount(account.id);
                            }
                          }}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (confirm('確定要清空所有帳戶嗎？此操作無法復原！')) {
                  clearPool();
                }
              }}
              disabled={tokenPool.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              清空所有帳戶
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
