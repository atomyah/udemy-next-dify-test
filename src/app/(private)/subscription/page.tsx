///////////////////////////////////////////////////////////////////////
///// プラン表示用のsubscriptionページ。 /api/stripe/checkout/route.ts API 
///// を叩いてStripeの決済画面を表示します。
///////////////////////////////////////////////////////////////////////
'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import Loading from "../chat/[conversationId]/loading"


export default function SubscriptionPage() {
    const [ loading, setLoading ] = useState(false)
    const router = useRouter()

    // useSearchParamsはURLのクエリパラメータ（検索パラメータ）を読み取るために使用。
    // 例：https://example.com/subscription?success=true&canceled=false ← success=trueとcanceled=falseがクエリパラメータ
    const searchParams = useSearchParams()
    // 以下で、Stripe決済後のリダイレクト時に送られてくるパラメータを取得している。
    // 決済成功時: /subscription?success=true
    // 決済キャンセル時: /subscription?canceled=true
    const success = searchParams.get('success')     // trueかfalse
    const canceled = searchParams.get('canceled')   // trueかfalse

    // 通知表示
    useEffect(() => {
        if(success){
            toast('サブスクリプション成功', {
                description: 'Proプランへのサブスクリプションが成功しました'
            })
            router.replace('/subscription')
        }
        if(canceled){
            toast('サブスクリプションキャンセル', {
                description: 'Proプランへのサブスクリプションがキャンセルされました'
            })
            router.replace('/subscription')
        }
    }, [success, canceled, router]) // ESLintルール遵守のためrouterも監視対象に。無くても動く



    // 支払いプロセス
    const handleSubscribe = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            // dataに入る値例：
            // { "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6..." }あるいは
            // { "error": "決済処理中にエラー" }
            const data = await response.json()
            // /api/stripe/checkout/router.tsから返ってくるものは決済画面URLである。以下のコードにより。
            // return NextResponse.json({ url: checkoutSession.url})

            if(data.url) {
                router.push(data.url)
            }

        } catch(error) {
            console.error('サブスクリプションエラー', error)
            toast('エラー', {
                description: 'サブスクリプション処理中にエラーが発生しました'
            })
        } finally {
            setLoading(false)
        }
    }
    

  return (
    <div className="max-w-md mx-auto my-10">
      <Card>
        <CardHeader>
            <CardTitle className="text-center text-2xl">
                プランをアップグレード
            </CardTitle>
            <CardDescription className="text-center">
                Proプラン
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-2">Proプラン</h2>
                <p className="text-gray-600 mb-4">より多くの会話と高度な機能を利用できます</p>
                <div className="text-3xl font-bold mb-4">$5<span className="text-lg text-gray-500">月</span></div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleSubscribe} disabled={loading} className="w-full py-2">
                { loading ? "処理中…" : "Proプランにアップグレード" }
            </Button>
            <p className="text-xs text-gray-500 text-center">
                サブスクリプションはいつでもキャンセルできます。
                クレジットカードで安全に決済されます。
            </p>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}
