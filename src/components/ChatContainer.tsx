"use client";
import ChatInput from "./ChatInput";

export default function ChatContainer() {
  return (
    <div className="flex flex-col h-full">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-start justify-end">
          <div className="bg-white rounded-lg my-2 py-3 px-4">
            <p className="text-gray-800">ここに文章が入ります。</p>
          </div>
        </div>
      </div>
      {/* 入力エリア */}
      <div className="flex-shrink-0 border-t py-4">
        <ChatInput />
      </div>
    </div>
    
  )
}
