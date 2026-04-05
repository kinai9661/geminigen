'use client';

import { useState } from 'react';
import PromptInput from '@/components/PromptInput';
import ImageGrid from '@/components/ImageGrid';
import AuthModal from '@/components/AuthModal';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const [images, setImages] = useState<Array<{ id: string; url: string; prompt: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleGenerate = async (prompt: string) => {
    if (!isAuthenticated) {
      alert('請先登入 GeminiGen.ai 帳號');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        const newImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt,
        };
        setImages(prev => [newImage, ...prev]);
      } else {
        alert(data.error || '生成失敗');
      }
    } catch (error) {
      console.error('生成錯誤:', error);
      alert('生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AuthModal />
      
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
                <span className="text-green-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  已連接
                </span>
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
