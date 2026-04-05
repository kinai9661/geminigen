'use client';

import { useState } from 'react';
import PromptInput from '@/components/PromptInput';
import ImageGrid from '@/components/ImageGrid';
import AuthModal from '@/components/AuthModal';
import TokenPoolManager from '@/components/TokenPoolManager';
import ImageHistory from '@/components/ImageHistory';
import { useAuthStore } from '@/lib/store';
import { useHistoryStore } from '@/lib/historyStore';

export default function Home() {
  const [images, setImages] = useState<Array<{ id: string; url: string; prompt: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const { isAuthenticated, accessToken, tokenPool, rotationInterval, getLRUAccount, updateAccountUsage } = useAuthStore();
  const { addImage } = useHistoryStore();

  const handleGenerate = async (prompt: string, count: number = 1) => {
    if (!isAuthenticated) {
      alert('請先登入 GeminiGen.ai 帳號');
      return;
    }

    setIsGenerating(true);
    setBatchProgress({ current: 0, total: count });

    try {
      const successfulImages: Array<{ id: string; url: string; prompt: string; createdAt: number }> = [];
      const failedCount = { value: 0 };

      // 批量生成循環
      for (let i = 0; i < count; i++) {
        setBatchProgress({ current: i + 1, total: count });

        try {
          // 優先使用 Token 池中的 LRU 帳戶
          let selectedToken = accessToken;
          let selectedAccountId: string | null = null;

          if (tokenPool.length > 0) {
            const lruAccount = getLRUAccount();
            if (lruAccount) {
              selectedToken = lruAccount.accessToken;
              selectedAccountId = lruAccount.id;
              
              // 檢查是否在冷卻期
              const timeSinceLastUse = Date.now() - lruAccount.lastUsed;
              const isInCooldown = timeSinceLastUse < rotationInterval;
              
              console.log(`🔄 [${i + 1}/${count}] 使用 LRU 帳戶: ${lruAccount.label}`);
              console.log(`   使用次數: ${lruAccount.usageCount}`);
              console.log(`   距離上次使用: ${Math.floor(timeSinceLastUse / 1000)}秒`);
              console.log(`   冷卻期: ${isInCooldown ? '是' : '否'}`);
            }
          }

          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              accessToken: selectedToken,
            }),
          });

          const data = await response.json();
          
          if (data.success && data.imageUrl) {
            // 更新帳戶使用記錄
            if (selectedAccountId) {
              updateAccountUsage(selectedAccountId);
            }

            const newImage = {
              id: `${Date.now()}-${i}`,
              url: data.imageUrl,
              prompt,
              createdAt: Date.now(),
            };
            
            successfulImages.push(newImage);
            
            // 即時更新畫面
            setImages(prev => [newImage, ...prev]);
            
            // 加入歷史記錄
            addImage(newImage);
          } else {
            failedCount.value++;
            console.error(`❌ [${i + 1}/${count}] 生成失敗:`, data.error);
          }

          // 批量生成時，在每次生成之間加入短暫延遲（避免過快請求）
          if (i < count - 1 && count > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          failedCount.value++;
          console.error(`❌ [${i + 1}/${count}] 生成錯誤:`, error);
        }
      }

      // 顯示批量生成結果
      if (count > 1) {
        const successCount = successfulImages.length;
        if (successCount === count) {
          alert(`✅ 批量生成完成！成功生成 ${successCount} 張圖片`);
        } else if (successCount > 0) {
          alert(`⚠️ 批量生成部分完成\n成功: ${successCount} 張\n失敗: ${failedCount.value} 張`);
        } else {
          alert(`❌ 批量生成失敗\n所有 ${count} 張圖片都生成失敗`);
        }
      } else if (failedCount.value > 0) {
        alert('生成失敗，請稍後再試');
      }
    } catch (error) {
      console.error('批量生成錯誤:', error);
      alert('批量生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AuthModal />
      <TokenPoolManager />
      <ImageHistory />
      
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">🎨</span>
              GeminiGen AI 圖片工作室
            </h1>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {tokenPool.length > 0 && (
                    <span className="text-blue-400 text-sm">
                      🔄 {tokenPool.filter(a => a.isActive).length} 個帳戶
                    </span>
                  )}
                  <span className="text-green-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    已連接
                  </span>
                </div>
              ) : (
                <span className="text-yellow-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  未連接
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-12">
          <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          
          {/* 批量生成進度條 */}
          {isGenerating && batchProgress.total > 1 && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">
                  批量生成進度
                </span>
                <span className="text-sm font-medium text-blue-400">
                  {batchProgress.current} / {batchProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Gallery */}
        <div className="max-w-7xl mx-auto">
          {images.length > 0 ? (
            <ImageGrid images={images} />
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-gray-400 text-lg">
                輸入提示詞開始生成你的第一張 AI 圖片
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-20 py-8 bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Powered by GeminiGen AI | 使用 Next.js 14 建構</p>
        </div>
      </footer>
    </main>
  );
}
