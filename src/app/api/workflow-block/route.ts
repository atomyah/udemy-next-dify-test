import { NextRequest, NextResponse } from "next/server"

const endpoint = `${process.env.DIFY_API_URL}/workflows/run`
const DIFY_API_KEY = process.env.DIFY_API_WORKFLOW_KEY

export async function POST(request: NextRequest){
    
    try{
        const body = await request.json()
        const { query } = body

        // DifyワークフローAPI接続
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIFY_API_KEY}`
            },
            body: JSON.stringify({
                inputs: {
                    // 入力フィールドの変数名
                    query: query
                },
                response_mode: 'blocking',
                user: 'user-123'
            })
        })

        const data = await response.json()
        console.log(data)

        const outputText = data.data.outputs.result // 終了ブロックで設定した変数名

        return NextResponse.json(outputText)


    } catch(error){
        console.error('APIエラー', error)
        return NextResponse.json('Dify側でエラーが発生しました')
    }

}

    // console.log('■ @routeハンドラー：APIからのレスポンス', data)の出力例：
    // ■ @routeハンドラー：APIからのレスポンス {
    // task_id: 'da1adc9b-a683-4341-8d03-104cd7acf2c6',
    // workflow_run_id: '6e32bcd0-b883-4389-a100-baf698e574fa',
    // data: {
    //     id: '6e32bcd0-b883-4389-a100-baf698e574fa',
    //     workflow_id: 'fc2f0d09-37bf-4b4d-a7a0-1b359db866ae',
    //     status: 'succeeded',
    //     outputs: { result: 'テストが正常に実行されています。何かお手伝いできることがあればお知らせください！' },
    //     error: null,
    //     elapsed_time: 1.1892959660003726,
    //     total_tokens: 34,
    //     total_steps: 3,
    //     created_at: 1747469346,
    //     finished_at: 1747469348
    // }