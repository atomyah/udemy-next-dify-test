import "../../globals.css";
import ChatSidebar from "@/components/ChatSidebar";

export default function PrivateLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html>
      <body>
        <div className="bg-slate-50 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-heidden">
            <div className="w-full md:w-80 order-2 md:order-1 h-20 md:h-full border-t md:border-r md:border-t-0 bg-slate-100 overflow-y-auto">
                <ChatSidebar />
            </div>
            <div className="flex-1 p-4 order-1 md:order-2 overflow-y-auto">
                {children}
            </div>
        </div>
      </body>
    </html>
  )
}
