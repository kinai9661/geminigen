import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TokenAccount } from '@/types';

interface AuthState {
  // 單一帳戶模式（向後兼容）
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Token 帳戶池
  tokenPool: TokenAccount[];
  
  // 輪替設定
  rotationInterval: number; // 最小輪替間隔（毫秒），預設 60000ms (1分鐘)
  
  // 方法
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  
  // Token 池管理
  addAccount: (accessToken: string, refreshToken: string, label?: string) => void;
  removeAccount: (id: string) => void;
  toggleAccount: (id: string) => void;
  getLRUAccount: () => TokenAccount | null;
  updateAccountUsage: (id: string) => void;
  clearPool: () => void;
  
  // 輪替設定管理
  setRotationInterval: (interval: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 單一帳戶狀態
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      // Token 池
      tokenPool: [],
      
      // 輪替設定（預設 1 分鐘）
      rotationInterval: 60000,
      
      // 設定單一 Token（向後兼容）
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      
      // 清除單一 Token
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, isAuthenticated: false }),
      
      // 新增帳戶到池中
      addAccount: (accessToken, refreshToken, label) => {
        const newAccount: TokenAccount = {
          id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accessToken,
          refreshToken,
          label: label || `帳戶 ${get().tokenPool.length + 1}`,
          lastUsed: 0,
          usageCount: 0,
          isActive: true,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          tokenPool: [...state.tokenPool, newAccount],
          // 如果是第一個帳戶，也設為主帳戶
          accessToken: state.tokenPool.length === 0 ? accessToken : state.accessToken,
          refreshToken: state.tokenPool.length === 0 ? refreshToken : state.refreshToken,
          isAuthenticated: true,
        }));
      },
      
      // 移除帳戶
      removeAccount: (id) => {
        set((state) => {
          const newPool = state.tokenPool.filter((acc) => acc.id !== id);
          const removedAccount = state.tokenPool.find((acc) => acc.id === id);
          
          // 如果刪除的是當前使用的帳戶，切換到下一個
          let newAccessToken = state.accessToken;
          let newRefreshToken = state.refreshToken;
          let newIsAuthenticated = state.isAuthenticated;
          
          if (removedAccount && 
              removedAccount.accessToken === state.accessToken) {
            if (newPool.length > 0) {
              const nextAccount = newPool[0];
              newAccessToken = nextAccount.accessToken;
              newRefreshToken = nextAccount.refreshToken;
            } else {
              newAccessToken = null;
              newRefreshToken = null;
              newIsAuthenticated = false;
            }
          }
          
          return {
            tokenPool: newPool,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isAuthenticated: newIsAuthenticated,
          };
        });
      },
      
      // 切換帳戶啟用狀態
      toggleAccount: (id) => {
        set((state) => ({
          tokenPool: state.tokenPool.map((acc) =>
            acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
          ),
        }));
      },
      
      // 獲取 LRU（最近最少使用）帳戶
      getLRUAccount: () => {
        const { tokenPool, rotationInterval } = get();
        const now = Date.now();
        
        // 過濾出啟用的帳戶
        const activeAccounts = tokenPool.filter((acc) => acc.isActive);
        
        if (activeAccounts.length === 0) {
          return null;
        }
        
        // 過濾出可用的帳戶（距離上次使用超過輪替間隔）
        const availableAccounts = activeAccounts.filter(
          (acc) => now - acc.lastUsed >= rotationInterval
        );
        
        // 如果有可用帳戶，選擇最久未使用的
        if (availableAccounts.length > 0) {
          const sortedAccounts = [...availableAccounts].sort(
            (a, b) => a.lastUsed - b.lastUsed
          );
          return sortedAccounts[0];
        }
        
        // 如果所有帳戶都在冷卻期，返回最久未使用的（即使還在冷卻期）
        const sortedAccounts = [...activeAccounts].sort(
          (a, b) => a.lastUsed - b.lastUsed
        );
        return sortedAccounts[0];
      },
      
      // 更新帳戶使用記錄
      updateAccountUsage: (id) => {
        set((state) => ({
          tokenPool: state.tokenPool.map((acc) =>
            acc.id === id
              ? {
                  ...acc,
                  lastUsed: Date.now(),
                  usageCount: acc.usageCount + 1,
                }
              : acc
          ),
        }));
      },
      
      // 清空整個池
      clearPool: () => {
        set({
          tokenPool: [],
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      
      // 設定輪替間隔
      setRotationInterval: (interval) => {
        set({ rotationInterval: interval });
      },
    }),
    {
      name: 'geminigen-auth',
    }
  )
);
