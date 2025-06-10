///////////////////////////////////////////////////////////////////////
///// Stripeの使用量を管理するための関数群です。　　　////////////////////
///////////////////////////////////////////////////////////////////////

import { prisma } from "./prisma";

// プラン別の利用制限を定義
export const PLAN_LIMITS = { FREE: 5, PRO: 100 }

// 月初めの日付を取得
export function getFirstDayOfMonth(): Date {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)}


// ユーザーの使用状況を取得
export async function getUserUsage(userId: string) {
    const firstDayOfMonth = getFirstDayOfMonth();   // 例：2025-06-01
    
    // ユーザーのサブスクリプション情報を取得
    const subscription = await prisma.subscription.findUnique({
        where: { userId }, select: { plan: true } })    // subscriptionテーブルのplanカラムがFREEかPROかを取得。
                                                        // select: { plan: true }は、planカラムのみ取得せよ、という意味

    // 今月の使用量を取得。
    // usageには、指定した条件に一致するUsageStatレコード1件またはnullが入る。
    // 例：
    // const usage = {
    //     id: "clx1a2b3c4d5e6f7g8h9",
    //     userId: "user123",
    //     count: 3,              // 今月の使用回数
    //     tokensUsed: 1500,      // 今月の使用トークン数
    //     period: 2025-06-01T00:00:00.000Z,  // 対象期間（月初日）
    //     createdAt: 2025-06-01T10:30:00.000Z
    //   }
    const usage = await prisma.usageStat.findUnique({
        where: { userId_period: { userId, period: firstDayOfMonth }}}) // userId_period は、Prismaが複合キーに自動的に付ける名前.
                                                                       // WHERE userId = 'user123' AND period = '2025-06-01' と同じ意味。

    // プラン別の制限を取得（limitには5か100が入る）
    const limit = PLAN_LIMITS[subscription?.plan ?? 'FREE'] // subscription?.planは、subscriptionテーブルのplanカラムがFREEかPROかを取得。
                                                            // PLAN_LIMITS["PRO"]だとlimitは100、PLAN_LIMITS["FREE"]だとlimitは5。
                                                            // ?? 'FREE'は、subscription?.planがnullの場合はデフォルトに'FREE'（?? 'FREE' (Null合体演算子)）
    return {
        usage: usage?.count || 0,
        tokensUsed: usage?.tokensUsed || 0,
        limit,                                  // プラン別の制限を取得（limitには5か100が入る）
        plan: subscription?.plan,               // プラン別の制限を取得（planにはFREEかPROが入る）
        isLimited: (usage?.count || 0) >= limit // 使用回数がlimit以上だったらtrue。
    }
}

// 使用量チェックと制限の確認
export async function checkUsageLimit(userId: string) {
    const { plan, isLimited } = await getUserUsage(userId)  // getUserUsage()からplan(FREEかPRO)とisLimited(trueかfalse)を取得。

    if (isLimited) {
        return { allowed: false, message: plan === 'FREE'
                 ? "無料プランの上限に達しました。Proプランへのアップグレードをご検討ください。"
                 : "今月の会話上限に達しました。来月までお待ちください。" 
        }
    }

    return { allowed: true }    // 使用量が制限内の場合はtrueを返す。
}

// ユーザーが使うたびに使用量を増加させる
export async function incrementUsage(userId: string, tokenCount: number) {
    const firstDayOfMonth = getFirstDayOfMonth();

    return prisma.usageStat.upsert({    // upsertは、既存のデータがあればupdate、なければcreateを実行する。
        where: { userId_period: { userId, period: firstDayOfMonth }}, //  WHERE userId = 'user123' AND period = '2025-06-01' と同じ意味。
        update: { 
            count: { increment: 1 },    // countを1増やす。FREEプランの場合は5回までPROプランの場合は100回までの制限に使うための数字
            tokensUsed: { increment: tokenCount } 
        },
        create: {
            userId,
            period: firstDayOfMonth,
            count: 1,
            tokensUsed: tokenCount
        }
    })
}