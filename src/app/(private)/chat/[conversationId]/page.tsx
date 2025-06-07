//////////////////////////////////////////////////////////////////////////////
// 会話履歴取得しChatContainerコンポーネントに渡す。
// RSCになるのでapi(ルートハンドラ)を作らず直接Difyから会話履歴を取得する。
// api/conversations/route.tsのコードとほぼ同じ
//////////////////////////////////////////////////////////////////////////////

import ChatContainer from "@/components/ChatContainer"
import { auth } from "@/auth"

type Params = {
  params: Promise<{         // Next.jsバージョン15からparamsとsearchParamsが非同期になったためPromiseが必要
    conversationId: string  // Promise使わずに以下のバージョン14までの書き方をすると、
                            // const { conversationId } = await paramsで"このawaitに意味がありません"の警告
  }>
}
// Promiseのないバージョン14までの書き方
// type Params = {
//   params: {
//     conversationId: string
//   }
// }

// messages[]の型を定義
type DifyMessage = {
  id?: string;
  query: string;
  answer: string;
}

// messageの型定義(store/chatStore.tsで定義したMessage型をコピー)
export type Message = {
  id?: string; // メッセージID
  role: 'user' | 'assistant'; // メッセージの送信者
  content: string; // メッセージの内容
}


// 注意！：現在、DIFY_API_URL=http://localhost/v1 になってる。
const endpoint = `${process.env.DIFY_API_URL}/messages` // Difyから会話履歴メッセージを取得するエンドポイント"/messages"。スクロールロード形式で履歴チャット記録を{limit}件返します。{limit}のデフォルトは20件。
const DIFY_API_KEY = process.env.DIFY_API_KEY

// localhost/chat/[conversationId] のスラグ[conversationId]の部分をparamsとして取ってこれる
export default async function ChatPage({params}: Params) {
  const session = await auth();
  const userId = session?.user?.id as string;

  const { conversationId } = await params
  const messages: Message[] = []

  try {
        // DifyワークフローAPI接続
        const response = await fetch(`${endpoint}?user=${userId}&conversation_id=${conversationId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DIFY_API_KEY}`
          },
          cache: 'no-store' // キャッシュを無効にする
        })
  
        const data = await response.json() // メッセージ履歴を取得

        if(data.data) {
          data.data.forEach((message: DifyMessage)=>{
            if(message.query) {
              messages.push({
                id: `${message.id}-user`, // AIの回答メッセージmessage.idと被らないように"-user"を付ける
                role: 'user',
                content: message.query,
              })
            }
            if(message.answer) {
              messages.push({
                id: `${message.id}-assistant`,
                role: 'assistant',
                content: message.answer,
              })
            }
          })
        }
        console.log('@[conversationId]/page.tsxにてメッセージ履歴取得→messages', messages)

  } catch(error){
    console.error('@[conversationId]/page.tsxにてメッセージ取得不可', error)
  }

  return (
   <ChatContainer 
    isNewChat={false}
    initialMessages={messages}
    conversationId={conversationId}
    userId={userId} />
  )
}
