import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageItem } from '@/types';

interface HistoryState {
  images: ImageItem[];
  addImage: (image: ImageItem) => void;
  removeImage: (id: string) => void;
  clearHistory: () => void;
  getImageById: (id: string) => ImageItem | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      images: [],
      
      addImage: (image) => {
        set((state) => ({
          images: [image, ...state.images].slice(0, 100), // 最多保存 100 張
        }));
      },
      
      removeImage: (id) => {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },
      
      clearHistory: () => {
        set({ images: [] });
      },
      
      getImageById: (id) => {
        return get().images.find((img) => img.id === id);
      },
    }),
    {
      name: 'geminigen-history',
    }
  )
);
