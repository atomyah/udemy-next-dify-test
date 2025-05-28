import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ChatProps } from "@/types/chat";
import React, { useState } from 'react'
import { useChatStore } from "@/store/chatStore"; // Zustandストアをインポート
import { useRouter } from "next/navigation"; // useRouterをインポート


export default function ChatInput({ userId }: ChatProps) {
  const [input, setInput ] = useState('')
  // console.log('@ChatInputに渡ったprops userId:', userId);
  const router = useRouter()

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
          const result = await response.json()
          // console.log('@ChatInputにてAPIからのレスポンスresult:', result)

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
    </div>
  )
}
