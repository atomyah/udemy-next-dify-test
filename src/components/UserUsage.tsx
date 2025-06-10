///////////////////////////////////////////////////////////////////////
///// (private)/dashboard/page.tsxで呼ばれるコンポーネントです。 //////
///////////////////////////////////////////////////////////////////////

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getUserUsage } from "@/lib/usage"
import { ChatProps } from "@/types/chat"

export default async function UserUsage({userId}: ChatProps) {
    
    const { usage, limit, plan, tokensUsed } = await getUserUsage(userId) // lib/usage.tsのgetUserUsage()が返している値５つのうち４つ
    // 以下はlib/usage.tsのgetUserUsage()が返している内容。
    // return {
    //     usage: usage?.count || 0,
    //     tokensUsed: usage?.tokensUsed || 0,
    //     limit,                                  // プラン別の制限を取得（limitには5か100が入る）
    //     plan: subscription?.plan,               // プラン別の制限を取得（planにはFREEかPROが入る）
    //     isLimited: (usage?.count || 0) >= limit // 使用回数がlimit以上だったらtrue。
    // }

    const percentage = Math.min(100, Math.round((usage / limit) * 100)) // 使用量のパーセンテージを計算。Math.min()で100%を超えないようにする


  return (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center">使用状況</CardTitle>
            <CardDescription>今月の利用状況</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">使用回数</span>
                <span className="text-sm text-gray-500">{usage} / {limit}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>現在のプラン</span>
                    <span className="font-medium">{plan === 'FREE' ? '無料プラン' : 'Proプラン'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                    <span>使用トークン数</span>
                    <span className="font-medium">{tokensUsed.toLocaleString()}</span>
                </div>
            </div>

            {plan === 'FREE' && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                        {usage >= limit
                        ? '無料プランの上限に達しました'
                        : `実行可能数 残り${limit - usage}回。`}
                    </p>
                    <Link href="/subscription">
                        <Button className="w-full">
                            Proプランへアップグレード
                        </Button>
                    </Link>
                </div>
            )}
                    <Link href="/chat">
                        <div className="my-4 text-sm text-indigo-700">チャット画面に移動する</div>
                    </Link>
        </CardContent>

    </Card>
  )
}

