'use client';

import { useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string, count?: number) => void;
  isGenerating: boolean;
}

export default function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [batchCount, setBatchCount] = useState(1);
  const [showBatchOptions, setShowBatchOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim(), batchCount);
    }
  };

  const examplePrompts = [
    '一隻可愛的貓咪在花園裡玩耍',
    '未來城市的夜景，霓虹燈閃爍',
    '夢幻般的森林，陽光透過樹葉',
    '宇宙中的星雲，色彩繽紛',
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            輸入你的創意提示詞
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要生成的圖片..."
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        {/* Batch Options */}
        <div className="border-t border-gray-700 pt-4">
          <button
            type="button"
            onClick={() => setShowBatchOptions(!showBatchOptions)}
            className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2 transition-colors"
          >
            <span>{showBatchOptions ? '▼' : '▶'}</span>
            批量生成選項
          </button>
          
          {showBatchOptions && (
            <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <label className="block text-sm text-gray-300 mb-2">
                生成數量：{batchCount} 張
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchCount(num)}
                      disabled={isGenerating}
                      className={`text-xs px-3 py-1.5 rounded transition-colors ${
                        batchCount === num
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 批量生成會自動使用 Token 池中的多個帳戶輪替
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中...
              </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                {batchCount > 1 ? `批量生成 ${batchCount} 張` : '生成圖片'}
              </>
            )}
          </button>
        </div>

        {/* Example Prompts */}
        <div className="pt-2">
          <p className="text-xs text-gray-400 mb-2">快速範例：</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                disabled={isGenerating}
                className="text-xs px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
