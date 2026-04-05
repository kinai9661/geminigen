'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [accountLabel, setAccountLabel] = useState('');
  const { isAuthenticated, setTokens, clearTokens, addAccount, tokenPool } = useAuthStore();

  useEffect(() => {
    // 首次載入時，如果未認證則顯示彈窗
    if (!isAuthenticated) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // 自動提取 Token 功能
  const handleExtractTokens = () => {
    try {
      let tokens = null;
      
      // 方法 1: 尋找包含 access_token 和 refresh_token 的物件
      for (const key in localStorage) {
        try {
          const value = JSON.parse(localStorage.getItem(key) || '');
          if (value && value.access_token && value.refresh_token) {
            tokens = value;
            break;
          }
        } catch (e) {
          // 忽略解析錯誤
        }
      }

      // 方法 2: 直接從 localStorage 取得
      if (!tokens) {
        const at = localStorage.getItem('access_token');
        const rt = localStorage.getItem('refresh_token');
        if (at && rt) {
          tokens = { access_token: at, refresh_token: rt };
        }
      }

      if (!tokens) {
        alert('❌ 找不到 Token，請先登入 geminigen.ai');
        return;
      }

      // 自動填入表單
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      alert('✅ 已自動提取 Token！請檢查後點擊「連接」按鈕');
    } catch (error) {
      console.error('提取錯誤:', error);
      alert('❌ 提取失敗，請手動輸入');
    }
  };

  // 一鍵同步 Token 功能
  const handleAutoSync = async () => {
    setIsSyncing(true);
    try {
      // 從 localStorage 中尋找 Token
      let tokens = null;
      
      // 方法 1: 尋找包含 access_token 和 refresh_token 的物件
      for (const key in localStorage) {
        try {
          const value = JSON.parse(localStorage.getItem(key) || '');
          if (value && value.access_token && value.refresh_token) {
            tokens = value;
            break;
          }
        } catch (e) {
          // 忽略解析錯誤
        }
      }

      // 方法 2: 直接從 localStorage 取得
      if (!tokens) {
        const at = localStorage.getItem('access_token');
        const rt = localStorage.getItem('refresh_token');
        if (at && rt) {
          tokens = { access_token: at, refresh_token: rt };
        }
      }

      if (!tokens) {
        alert('❌ 找不到 Token，請先登入 geminigen.ai');
        setIsSyncing(false);
        return;
      }

      // 同步 Token 到星光工坊
      const response = await fetch('https://gemiai.replit.app/api/public/receive-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: '3a8f1cda-c4e6-44f0-be44-0bb0fa4f5a8d',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          label: '3'
        })
      });

      const data = await response.json();

      if (data.success) {
        // 同步成功，儲存到本地
        setTokens(tokens.access_token, tokens.refresh_token);
        setIsOpen(false);
        alert('✅ Token 已成功同步！');
      } else {
        alert('❌ 同步失敗：' + (data.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('同步錯誤:', error);
      alert('❌ 無法連接星光工坊');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken.trim() && refreshToken.trim()) {
      setTokens(accessToken.trim(), refreshToken.trim());
      setIsOpen(false);
      setAccessToken('');
      setRefreshToken('');
      setAccountLabel('');
    }
  };

  const handleAddToPool = () => {
    if (!accessToken.trim() || !refreshToken.trim()) {
      alert('❌ 請先輸入 Token');
      return;
    }

    const label = accountLabel.trim() || `帳戶 ${tokenPool.length + 1}`;
    addAccount(accessToken.trim(), refreshToken.trim(), label);
    
    alert(`✅ 已加入「${label}」到帳戶池！`);
    setAccessToken('');
    setRefreshToken('');
    setAccountLabel('');
  };

  const handleLogout = () => {
    if (confirm('確定要登出嗎？')) {
      clearTokens();
      setIsOpen(true);
    }
  };

  if (!isOpen && isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors text-sm z-50"
      >
        登出
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🔐</span>
            連接 GeminiGen.ai
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            請按照以下步驟取得 Token 並連接到 GeminiGen.ai
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="font-semibold text-white mb-3">📋 認證方式：</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong>方式 1（推薦）：</strong>點擊下方「⚡ 一鍵同步 Token」按鈕</p>
              <p><strong>方式 2：</strong>在本站按 <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">F12</kbd> → Console → 貼上下方代碼</p>
              <p><strong>方式 3：</strong>點擊「🔍 自動提取」按鈕，然後手動點擊「連接」</p>
              <p className="text-xs text-gray-400 mt-2">💡 提示：請先在 <a href="https://geminigen.ai" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">geminigen.ai</a> 登入並完成認證</p>
            </div>
          </div>

          {/* 一鍵同步按鈕 */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg p-6 text-center">
            <h3 className="text-white font-semibold text-lg mb-2">🚀 快速同步</h3>
            <p className="text-primary-100 text-sm mb-4">
              如果你已經在 geminigen.ai 登入，點擊下方按鈕自動同步 Token
            </p>
            <button
              onClick={handleAutoSync}
              disabled={isSyncing}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-primary-600 font-semibold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  同步中...
                </>
              ) : (
                <>
                  <span className="text-xl">⚡</span>
                  一鍵同步 Token
                </>
              )}
            </button>
          </div>

          {/* Code Block */}
          <div className="bg-gray-900 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">方式 2：在本站 Console 執行（從本站 localStorage 提取）</span>
              <button
                onClick={() => {
                  const code = `(function(){var s=JSON.parse(localStorage.getItem('auth-storage')||'{}').state;if(!s||!s.accessToken||!s.refreshToken){alert('❌ 請先在網站上完成認證');return;}fetch('https://gemiai.replit.app/api/public/receive-tokens',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({otp:'3a8f1cda-c4e6-44f0-be44-0bb0fa4f5a8d',access_token:s.accessToken,refresh_token:s.refreshToken,label:'3'})}).then(function(r){return r.json()}).then(function(d){if(d.success){alert('✅ Token 已成功同步到星光工坊！');console.log('Access Token:',s.accessToken);console.log('Refresh Token:',s.refreshToken);}else alert('❌ 同步失敗：'+(d.error||'未知錯誤'));}).catch(function(){alert('❌ 無法連接星光工坊');});})();`;
                  navigator.clipboard.writeText(code);
                  alert('已複製到剪貼簿！');
                }}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded transition-colors"
              >
                複製代碼
              </button>
            </div>
            <pre className="text-xs text-gray-300 overflow-x-auto max-h-32">
              <code>{`(function(){var s=JSON.parse(localStorage.getItem('auth-storage')||'{}').state;if(!s||!s.accessToken||!s.refreshToken){alert('❌ 請先在網站上完成認證');return;}fetch('https://gemiai.replit.app/api/public/receive-tokens',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({otp:'3a8f1cda-c4e6-44f0-be44-0bb0fa4f5a8d',access_token:s.accessToken,refresh_token:s.refreshToken,label:'3'})}).then(function(r){return r.json()}).then(function(d){if(d.success){alert('✅ Token 已成功同步到星光工坊！');console.log('Access Token:',s.accessToken);console.log('Refresh Token:',s.refreshToken);}else alert('❌ 同步失敗：'+(d.error||'未知錯誤'));}).catch(function(){alert('❌ 無法連接星光工坊');});})();`}</code>
            </pre>
          </div>

          {/* Manual Input Form */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">或手動輸入 Token：</h3>
              <button
                type="button"
                onClick={handleExtractTokens}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1"
              >
                <span>🔍</span>
                自動提取
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="accessToken" className="block text-sm text-gray-300 mb-2">
                  Access Token
                </label>
                <textarea
                  id="accessToken"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="輸入 access_token"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none font-mono"
                />
              </div>
              <div>
                <label htmlFor="refreshToken" className="block text-sm text-gray-300 mb-2">
                  Refresh Token
                </label>
                <textarea
                  id="refreshToken"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  placeholder="輸入 refresh_token"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none font-mono"
                />
              </div>
              <div>
                <label htmlFor="accountLabel" className="block text-sm text-gray-300 mb-2">
                  帳戶標籤（選填，用於帳戶池管理）
                </label>
                <input
                  id="accountLabel"
                  type="text"
                  value={accountLabel}
                  onChange={(e) => setAccountLabel(e.target.value)}
                  placeholder={`例如：主帳號、備用帳號 1（預設：帳戶 ${tokenPool.length + 1}）`}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToPool}
                  disabled={!accessToken.trim() || !refreshToken.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  加入帳戶池
                </button>
                <button
                  type="submit"
                  disabled={!accessToken.trim() || !refreshToken.trim()}
                  className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  直接連接
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                💡 提示：「加入帳戶池」可管理多個帳戶並自動輪替，「直接連接」僅使用單一帳戶
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
