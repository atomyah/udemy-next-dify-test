////////////////////////////////////////////////////////////////////////////////
//* プラン表示用のsubscriptionページ/app/(private)/subscription/page.tsx)から呼ばれるAPIです。
////////////////////////////////////////////////////////////////////////////////

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateStripeCustomer, createCheckoutSession } from "@/lib/stripe/session"

export async function POST() {
    try {
        const session = await auth()
        const userId = session?.user?.id as string

        const user = await prisma.user.findUnique({ where : { id: userId }})

        // lib/stripe/session.tsのgetOrCreateStripeCustomer(userId,user)よりstripeCustomerIdを取得。
        // getOrCreateStripeCustomer()関数の最後、return existingCustomer.stripeCustomerIdで取得。
        const stripeCustomerId = await getOrCreateStripeCustomer(userId, user)

        // 同じく、createCheckoutSession(userId: string, stripeCustomerId: string)よりcheckoutSessionオブジェクトを取得。
        // checkoutSessionの中身の値例はlib/stripe/session.tsのページ最後に記述。
        const checkoutSession = await createCheckoutSession(userId, stripeCustomerId)

        return NextResponse.json({ url: checkoutSession.url}) // checkoutSession.url ← 決済画面URL

    } catch(error){
        console.error('決済エラー', error)
        return NextResponse.json(
            { error: '決済処理中にエラー'},
            { status: 500 }
        )
    }
}