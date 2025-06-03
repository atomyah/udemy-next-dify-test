import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// メッセージの型定義
export type Message = {
    id?: string; // メッセージID
    role: 'user' | 'assistant'; // メッセージの送信者
    content: string; // メッセージの内容
}

// 会話リストの型定義
export type Conversation = {
    id?: string; // 会話ID
    name: string; // 会話タイトル
    updated_at: number;
}


// ストアの状態の型定義
interface ChatStore {
    // 状態の型
    conversationId: string | null; // 現在の会話ID
    isLoading: boolean; // ローディング状態
    messages: Message[];
    conversations: Conversation[]; // 会話リスト
    // アクションの型
    setConversationId: (id: string) => void; // 会話IDを設定
    setMessages: (message: Message[]) => void; // メッセージを設定
    addMessage: (message: Message) => void; // メッセージを追加
    clearMessage: () => void; // メッセージをクリア
    setConversations: (conversation: Conversation[]) => void; // 会話リストを設定
    setLoading: (loading: boolean) => void; // ローディング状態を設定
    resetStore: () => void // ストアをリセット
}



// Zustandストアを作成
export const useChatStore = create<ChatStore>()(
    persist((set)=>({
        // 初期状態
        conversationId: null,
        messages: [],
        conversations: [],
        isLoading: false,

        // アクション
        setConversationId: (id: string) => set({ conversationId: id }),
        setMessages: (messages: Message[]) => set({ messages }),
        addMessage: (message: Message) => set((state)=>{
            return { messages: [...state.messages, message]}
        }),
        clearMessage:() => set({messages: []}),
        setConversations: (conversations: Conversation[]) => set({ conversations }),
        
        setLoading: (loading) => set({ isLoading: loading}),
        resetStore:() => set({
            conversationId: null,
            messages: [],
            // conversations: [],　// ChatSidebarでresetStore()を使うためにコメントアウトした。会話リストだけ残すために
            isLoading: false
        })
    }), {
        // persist()の第2引数↓
        name: 'dify-chat--storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
            conversationId: state.conversationId,
            messages: state.messages,
            conversations: state.conversations,
        })
    })
)