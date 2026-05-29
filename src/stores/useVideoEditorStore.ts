import { create } from 'zustand';

export type ElementType = 'text' | 'image' | 'shape';

export interface EditorElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    startFrame: number;
    endFrame: number;
    content: string; // Text content or image URL
    style: {
        color?: string;
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string;
        opacity?: number;
        borderRadius?: number;
        shadow?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
}

interface VideoEditorState {
    elements: EditorElement[];
    activeElementId: string | null;
    currentTime: number;
    duration: number; // in frames (e.g. 30fps * 10s = 300)
    fps: number;
    isPlaying: boolean;
    
    // Actions
    addElement: (element: Omit<EditorElement, 'id'>) => void;
    updateElement: (id: string, updates: Partial<EditorElement>) => void;
    removeElement: (id: string) => void;
    setActiveElement: (id: string | null) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
}

export const useVideoEditorStore = create<VideoEditorState>((set) => ({
    elements: [],
    activeElementId: null,
    currentTime: 0,
    duration: 150, // 5 seconds at 30fps default
    fps: 30,
    isPlaying: false,

    addElement: (element) => set((state) => ({
        elements: [...state.elements, { ...element, id: crypto.randomUUID() }]
    })),

    updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    })),

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter(el => el.id !== id),
        activeElementId: state.activeElementId === id ? null : state.activeElementId
    })),

    setActiveElement: (id) => set({ activeElementId: id }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setIsPlaying: (isPlaying) => set({ isPlaying })
}));
