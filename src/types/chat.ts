import type { Message } from "@/store/chatStore"

export interface ChatContainerProps {
    isNewChat: boolean;
    initialMessages: Message[]; // Messageの型は/store/chatStore.tsで指定してある。下欄参照
    conversationId?: string | null;
    userId: string
}


export interface ChatProps {
    userId: string;
}


// src/store/chatStore.tsより
// // メッセージの型定義
// export type Message = {
//     id?: string; // メッセージID
//     role: 'user' | 'assistant'; // メッセージの送信者
//     content: string; // メッセージの内容
// }