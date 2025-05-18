'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWorkflowStream } from '@/hooks/useWorkflowStream' // カスタムフックをインポート

export default function WorkflowStreaming() {

  const {
    input,
    setInput,
    output,
    callDifyApy,
  } = useWorkflowStream() // カスタムフックを使用

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dify Workflow API</CardTitle>
        <CardDescription>シンプルなワークフロー</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 入力エリア */}
            <Textarea
                placeholder="ここに質問を入力してください"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className="w-full text-base md:text-base mb-8"
            />
        {/* 出力エリア */}
            { output && (
                <div className="p-4 bg-gray-100 rounded-md">
                    <h3 className="text-sm font-medium mb-2">回答</h3>
                    <p className="whitespace-pre-wrap text-base md:text-base">{output}</p>
                </div>
            )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={callDifyApy}>送信</Button>
      </CardFooter>
    </Card>
  )
}
