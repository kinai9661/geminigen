'use client';

import { useState } from 'react';
import { useHistoryStore } from '@/lib/historyStore';

export default function ImageHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const { images, removeImage, clearHistory } = useHistoryStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `geminigen-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('下載失敗:', error);
      alert('下載失敗，請稍後再試');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors text-sm z-50 flex items-center gap-2"
      >
        <span>📜</span>
        歷史記錄 ({images.length})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">📜</span>
              圖片歷史記錄
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
          <div className="flex items-center justify-between mt-3">
            <p className="text-gray-400 text-sm">
              共 {images.length} 張圖片（最多保存 100 張）
            </p>
            {images.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('確定要清空所有歷史記錄嗎？此操作無法復原！')) {
                    clearHistory();
                  }
                }}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
              >
                清空歷史
              </button>
            )}
          </div>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-gray-400">尚無歷史記錄</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-900">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-gray-300 line-clamp-2" title={image.prompt}>
                      {image.prompt}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(image.createdAt || Date.now())}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(image.url, image.id)}
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
                      >
                        下載
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(image.url);
                          alert('✅ 圖片連結已複製');
                        }}
                        className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
                      >
                        複製連結
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('確定要刪除這張圖片嗎？')) {
                            removeImage(image.id);
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
