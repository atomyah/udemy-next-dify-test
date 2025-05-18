import { NextRequest, NextResponse } from 'next/server'

const endpoint = `${process.env.DIFY_API_URL}/workflows/run`
const DIFY_API_KEY = process.env.DIFY_API_WORKFLOW_KEY

export async function GET(request: NextRequest) {
    try {
        const serchParams = request.nextUrl.searchParams
        const query = serchParams.get('query') // URLクエリパラメータから取得

        // DifyワークフローAPI接続
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIFY_API_KEY}`,
            },
            body: JSON.stringify({
                inputs: {
                    // 入力フィールド変数名
                    query: query,
                },
                response_mode: 'streaming',
                user: 'user-123'
            }),
        })

        return new Response(response.body, { // 生のレスポンスのボディをそのまま返す
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache no-transform',
                'Connection': 'keep-alive',
            }
        })

    } catch (error) {
        console.error('routeハンドラーでAPIエラー', error)
        return NextResponse.json('routeハンドラーでエラーが発生しました')
    }

}