////////////////////////////////////////////////////////////////////////
// ChatSidebarコンポーネントのfetchConversations関数で呼ばれるルートハンドラーです //
///////////////////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from "next/server"

// 注意！：現在、DIFY_API_URL=http://localhost/v1 になってる。
const endpoint = `${process.env.DIFY_API_URL}/conversations` // Difyから会話を取得するエンドポイント"/conversations"
const DIFY_API_KEY = process.env.DIFY_API_KEY

export async function GET(request: NextRequest){
    
    try{
        const serchParams = request.nextUrl.searchParams
        const userId = serchParams.get('userId') // userIdをクライアント側から受け取る

        // DifyワークフローAPI接続
        const response = await fetch(`${endpoint}?user=${userId}&limit=50`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIFY_API_KEY}`
            }})

        const data = await response.json()
        console.log('@api/conversations/route.tsでのdata:', data)
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


        return NextResponse.json(data)


    } catch(error){
        console.error('APIエラー', error)
        return NextResponse.json('Dify側でエラーが発生しました')
    }

}