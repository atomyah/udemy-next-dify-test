'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function WorkflowBlocking() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    const callDifyApi = async () => {
      if (!input.trim()) return // 入力が空の場合は何もしない
      
      setOutput('') // 出力をクリア
      
      try {
        const response = await fetch('/api/workflow-block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: input 
          }),
        })

        const result = await response.json()
        console.log('■＠WorkflowBlockingコンポーネント：APIからのレスポンス', result)
        // 出力例：
        // ■＠WorkflowBlockingコンポーネント：APIからのレスポンス テストが正常に実行されています。何かお手伝いできることがあればお知らせください！

        setOutput(result) // APIからの出力を設定

      } catch (error) {
        console.error('API接続失敗', error)
        setOutput('エラーが発生しました')
      }
    }

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
        <Button className="w-full" onClick={callDifyApi}>送信</Button>
      </CardFooter>
    </Card>
  )
}
