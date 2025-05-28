import { metadata } from './../app/(public)/layout';
import  { prisma } from "@/lib/prisma"

// Difyから渡ってくるデータ（data）の型定義
export interface ChatFlowType {
    conversation_id: string; // Dify側の会話ID
    metadata: {
        usage: {
            total_tokens: number; // トークンの合計
            total_price: string; // コストの合計
            [key: string]: unknown; // 他のプロパティも含まれる可能性があるため、インデックスシグネチャを使用
        },
    [key: string]: unknown; // 他のプロパティも含まれる可能性があるため、インデックスシグネチャを使用
    }
}

export async function createConversation(data: ChatFlowType, userId:string, query:string){
    await prisma.conversation.create({
        data: {
            difyConversationId: data.conversation_id, // Dify側の会話ID
            userId: userId, // ユーザーID
            title: query.substring(0, 30) + "...", // クエリの最初の30文字をタイトルに設定
            totalTokens: data.metadata.usage.total_tokens, // トークンの合計
            totalCost: parseFloat(data.metadata.usage.total_price), // コストの合計を数値に変換(schema.prismaではFloat型でモデル設定されているのでparseFloatを使用)
        }
    })
}


export async function updateConversation(data: ChatFlowType, userId:string){
    await prisma.conversation.update({
        where: {
            difyConversationId_userId: { // shema.prismaで設定した複合ユニークキーを使用(@@unique([difyConversationId, userId]) // 複合ユニーク制約)
                difyConversationId: data.conversation_id, 
                userId: userId
            }
        },
        data: {
            totalTokens: data.metadata?.usage?.total_tokens, 
            totalCost: parseFloat(data.metadata?.usage?.total_price),
        }
    })
}