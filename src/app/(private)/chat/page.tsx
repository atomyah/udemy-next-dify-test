import ChatContainer from "@/components/ChatContainer"
import { auth } from "@/auth"


export default async function ChatPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  return (
    // localhost/chatページは初回表示ページなのでpropsは全部カラ。
    // chat/[conversationId]ページは2回目以降ページなのでchat/[conversationId]/page.tsxにはconversationIdなどの値をPropsに渡す
   <ChatContainer 
      isNewChat={true}
      initialMessages={[]}
      conversationId={null}
      userId={userId} />
  )
}
