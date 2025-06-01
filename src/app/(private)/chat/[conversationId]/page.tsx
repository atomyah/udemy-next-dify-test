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


export default async function ChatPage({params}: Params) {
  const session = await auth();
  const userId = session?.user?.id as string;

  const { conversationId } = await params

  return (
   <ChatContainer 
    isNewChat={false}
    initialMessages={[]}
    conversationId={conversationId}
    userId={userId} />
  )
}
