////////////////////////////////////////////////////////////////////////
// ChatInputコンポーネントのcallDifyApi関数で呼ばれるルートハンドラーです //
///////////////////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from "next/server"
import { createConversation, updateConversation } from "@/lib/conversation" // 会話テーブルの新規作成と更新を行う関数

// 注意！：現在、DIFY_API_URL=http://localhost/v1 になってる。
const endpoint = `${process.env.DIFY_API_URL}/chat-messages` // チャットフローの場合のエンドポイント（ワークフローの場合は `/workflows/run`）
const DIFY_API_KEY = process.env.DIFY_API_KEY

export async function POST(request: NextRequest){
    
    try{
        const body = await request.json()
        const { query, userId, conversationId } = body  // ChatInputコンポーネントから渡ってくるデータ

        // DifyワークフローAPI接続
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIFY_API_KEY}`
            },
            body: JSON.stringify({
                inputs: {}, // Difyの「開始」ブロックで何か自作の変数を設定している場合はここに入力
                // 例：inputs: { password: password } など
                query: query,
                response_mode: 'blocking',
                user: userId,
                conversation_id: conversationId || '', // conversation_idがDify側の表記。conversationIdはChatInputコンポーネントから渡ってくる表記
            })
        })

        const data = await response.json()
        console.log('@api/chat/route.tsでのdata:', data)
        // 出力例：
        //  {
        //     event: 'message',
        //     task_id: 'c116844d-b599-4f4b-a79e-d2d6a57c4308',
        //     id: '685cc516-6a29-4aff-97d8-964612ddcfd7',
        //     message_id: '685cc516-6a29-4aff-97d8-964612ddcfd7',
        //     conversation_id: '1b7e2423-cb4f-45b0-b683-bdc6ea900f7c',
        //     mode: 'advanced-chat',
        //     answer: 'テストですね！何かお手伝いできることがあれば教えてください。',
        //     metadata: {
        //         usage: {
        //         prompt_tokens: 11,
        //         prompt_unit_price: '0.15',
        //         prompt_price_unit: '0.000001',
        //         prompt_price: '0.0000017',
        //         completion_tokens: 20,
        //         completion_unit_price: '0.6',
        //         completion_price_unit: '0.000001',
        //         completion_price: '0.000012',
        //         total_tokens: 31,
        //         total_price: '0.0000137',
        //         currency: 'USD',
        //         latency: 1.4813909909998983
        //         }
        //     },
        //     created_at: 1748412117,

        // lib/conversation.tsで定義したcreateConversationとupdateConversationを使用して会話テーブルを更新
        if(!conversationId){    // 初回は会話IDがないのでconversationIdはカラなので会話テーブルを新規作成
            createConversation(data, userId, query) // dataはconst data = await response.json()によってDify APIから来るもの。
                                                    // userId, queryはconst { query, userId, conversationId } = bodyでChatInputから来るもの
        } else {
            updateConversation(data, userId)   // ２回目以降はconversationIdがあるので更新作業
        }


        return NextResponse.json(data)


    } catch(error){
        console.error('APIエラー', error)
        return NextResponse.json('Dify側でエラーが発生しました')
    }

}