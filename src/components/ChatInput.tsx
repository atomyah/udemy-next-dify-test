///////////////////////////////////////////////////////////////////////
// src/app/(private)/chat/layout.tsxに埋め込まれるコンポーネントです。 ///
///////////////////////////////////////////////////////////////////////

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ChatProps } from "@/types/chat";
import React, { useState } from 'react'
import { useChatStore } from "@/store/chatStore"; // Zustandストアをインポート
import { useRouter } from "next/navigation"; // useRouterをインポート. リダイレクト用
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"


export default function ChatInput({ userId }: ChatProps) {
  const [input, setInput ] = useState('')
  // console.log('@ChatInputに渡ったprops userId:', userId);
  const router = useRouter() // リダイレクト用

  const {
    conversationId,
    setConversationId,
    addMessage,
    setLoading,
  } = useChatStore() // Zustandストアから必要な状態やアクションを取得


  const callDifyApi = async (e: React.FormEvent) => {
    e.preventDefault()

    if(!input.trim()) return

    try {
          setLoading(true)

          addMessage({
            role: 'user',
            content: input,
          })

          // app/api/chat/route.tsが/api/chat APIとなる
          const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                  'Content-Type' : 'application/json'
              },
              body: JSON.stringify({
                  query: input,
                  userId: userId, // ユーザーIDをリクエストボディに追加
                  conversationId: conversationId
              })
          })
          const result = await response.json()  // app/api/chat/route.tsからのリスポンス
          // console.log('@ChatInputにてAPIからのレスポンスresult:', result)
          // 出力例：
          // result:
          //   { event: 'message', 
          //     task_id: '49a90f1d-980d-4f2a-8ed4-59aa41801c42', 
          //     id: 'da0092f8-bbb6-4a76-89c2-24b9fcea3173', 
          //     message_id: 'da0092f8-bbb6-4a76-89c2-24b9fcea3173', 
          //     conversation_id: '6cec9cdf-d8ec-46d2-a8cd-3d35e3043648', …}
          //           answer : "こんばんは！何かお話ししたいことや質問があれば、どうぞお気軽にお知らせください。"
          //           conversation_id: "6cec9cdf-d8ec-46d2-a8cd-3d35e3043648"
          //           created_at: 1748674546
          //           event: "message"
          //           id: "da0092f8-bbb6-4a76-89c2-24b9fcea3173"
          //           message_id: "da0092f8-bbb6-4a76-89c2-24b9fcea3173"
          //           metadata: 
          //             {usage: 
          //               total_price: "0.0000323"
          //               total_tokens: 140
          //               ...等等
          //             }

          // * app/api/chat/route.tsからのリスポンスエラーを受けての処理(Stripe用) */
          // from api/chat/route.tsの * Dify通信前に使用量をチェック(Stripe用) * で作られるresponseエラー //
          //////////////////////////////////////////////////////////////////////////////////////////////
          if(!response.ok){     // app/api/chat/route.tsからのリスポンス
            // 403エラーの場合(status:403は「認証されているが、権限がない・制限されている」場合に使う)
            if(response.status === 403) {
              toast('利用制限に達しました', {
                description: "月間の利用度回数制限に達しました。プランをアップグレードしてください"
              })
            // その他のエラーの場合
            } else {
              toast('エラーが発生しました。', {
                description: "リクエストの処理中にエラーが発生しました"
              })
            }
          }
          // * app/api/chat/route.tsからのリスポンスエラーを受けての処理(Stripe用) */
          // from api/chat/route.tsの * Dify通信前に使用量をチェック(Stripe用) * で作られるresponseエラー //
          /////////////////////////////////　～ここまで～ ///////////////////////////////////////////////




          // 会話IDがセットされていなければ設定（初回の会話）
          if(!conversationId) {
            setConversationId(result.conversation_id)
            router.push(`/chat/${result.conversation_id}`) // 会話ページにリダイレクト
          }

          // Dify APIの応答をストアに追加
          addMessage({
            id: result.message_id, // Dify APIからのメッセージIDを追加
            role: 'assistant',
            content: result.answer,
          })

          setInput('')

    } catch(error) {
      console.error('@ChatInputにてAPI接続に失敗', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div>
      <form className="flex flex-col gap-2 px-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Textarea
            className="flex-1 min-h-[60px] max-h-[200px] text-sm md:text-base bg-white resize-none"
            placeholder="メッセージを入力してください"
            value={input}
            onChange={(e)=> setInput(e.target.value)}
          >
          </Textarea>
          <Button
            type="submit"
            onClick={callDifyApi}
            className="h-10 px-4 shrink-0">送信
          </Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}

// console.log('@ChatInputにてAPIからのレスポンスresult:', result)の出力例：
// @ChatInputにてAPIからのレスポンスresult: 
