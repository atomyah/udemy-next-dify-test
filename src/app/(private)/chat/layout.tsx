import "../../globals.css";
import ChatSidebar from "@/components/ChatSidebar";
import { auth } from "@/auth" // 現在の方法（App Router + NextAuth v5）で超簡単に！

export default async function PrivateLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

    // auth.tsのcallbacksのsession関数でidを付与しているセッションをここで取得。
    // 現在の方法（App Router + NextAuth v5）で超簡単に！
    // IDへのアクセス方法：session?user?.id as string
    const session = await auth();
    const userId = session?.user?.id as string;
    console.log('@(private)/chat/layout.tsxでのid付与後のセッション:', session); // 出力例：id付与後のセッション: { user: { name: 'Test User',  id: 'cmb0eilbi00012lqsn3lzcfu8', email: ... }

  return (
       <div className="bg-slate-50 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-heidden">
            <div className="w-full md:w-80 order-2 md:order-1 h-64 md:h-full border-t md:border-r md:border-t-0 bg-slate-100 overflow-y-auto">
                <ChatSidebar userId={userId} />
            </div>
            <div className="flex-1 p-4 order-1 md:order-2 overflow-y-auto">
                {children}
            </div>
        </div>
  )
}
