/////////////////////////////////////////////////////////////////////
// * Stripeの情報がセッションとしてこのファイルに渡り、
// * getOrCreateStripeCustomerでStripe顧客オブジェクトのIDを取得または顧客を作成。
// * createCheckoutSessionで決済画面表示に必要な情報を取得
////////////////////////////////////////////////////////////////////
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getOrCreateStripeCustomer(
  userId: string,
  user: User | null // schema.prismaに設定されたUserモデル
): Promise<string> {

  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }

  /////////////////////////////////////////////////////
  // 既存のStripe顧客IDを検索してあればそれを返す
  // 参考：https://docs.stripe.com/api/customers/object
  /////////////////////////////////////////////////////
  // * StripeCustomerモデル
  // model StripeCustomer {
  //   id String @id @default(cuid())
  //   userId String @unique
  //   user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  //   stripeCustomerId String @unique
  //   createdAt DateTime @default(now())
  //   updatedAt DateTime @updatedAt
  //   @@map("stripe_customers")
  // }
  const existingCustomer = await prisma.stripeCustomer.findUnique({ // schema.prismaに設定されたstripeCustomerモデル
    where: { userId },
  });
  // 既存のカスタマーIDがあればそれを返す
  if (existingCustomer?.stripeCustomerId) {
    return existingCustomer.stripeCustomerId; // ←ここで関数が終了(早期リターン)
  }
  ///////////////////////////////////////////////////////
  // 既存のStripe顧客IDを検索してあればそれを返す~ここまで
  ///////////////////////////////////////////////////////


  //////////////////////////////////////////////////////////////////////
  //*  新しいStripe顧客を作成 ///////////////////////////////////////////
  // この行に到達する = 既存顧客がいない
  // （上のifでreturnされなかった場合のみ実行される(早期リターン)）
  const customer = await stripe.customers.create({  // stripe.customerメソッドはStripeが用意してくれているもの
    email: user.email,          
    name: user.name || undefined,
    metadata: { userId: user.id }, 
    // "metadata"は、WebhookでStripeからの通知を受けた時に「このStripe顧客はアプリのどのユーザーか」を特定するための連携キーとして使用.
  });

  // データベースに保存
  await prisma.stripeCustomer.create({
    data: {
      userId: user.id,                  // アプリのユーザーID: "user_123"
      stripeCustomerId: customer.id,    // StripeのカスタマーID: "cus_NffrFeUfNV2Hib"
    },
  });
  return customer.id;                   // StripeのカスタマーIDを返す。例："cus_NffrFeUfNV2Hib"
    //*  新しいStripe顧客を作成 ～ここまで ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
}





///////////////////////////////////////////////////////////////////////////////
// * 決済画面を表示するために必要な情報の準備
// チェックアウトセッションを作成する
export async function createCheckoutSession(userId: string, stripeCustomerId: string) {
  const PRO_PLAN_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID

  if (!PRO_PLAN_PRICE_ID) {
    throw new Error('STRIPE_PRO_PRICE_ID is not defined');
  }

  // チェックアウトセッション作成
  // 参考：https://docs.stripe.com/api/checkout/sessions/object?api-version=2025-05-28.basil
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    line_items: [{                  // 購入する物情報
      price: PRO_PLAN_PRICE_ID,     // 購入するもの（サブスクリプション）の価格（プライスID）
      quantity: 1                   // いくつ購入するか
    }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
    metadata: { userId }, // CheckoutSessionオブジェクトのmetadata.セッション関連のWebhook（checkout.session.completedなど）でuserIdを取得
    subscription_data: {  // Subscriptionオブジェクトのmetadata. サブスクリプション関連のWebhook（customer.subscription.updatedなど）でuserIdを取得
      metadata: { 
        userId 
      } 
    }
    // なぜ両方にuserIdを設定するのか
    // ------
    // CheckoutSessionのmetadata:
    // 決済完了時（checkout.session.completed）に必要
    // セッション単位での処理
    // ------
    // Subscriptionのmetadata:
    // サブスクリプションの状態変化（更新、キャンセルなど）で必要
    // 長期間にわたるサブスクリプション管理（subscription_dataというのはチェックアウトセッション作成時のパラメータ。subscriptionではダメ）
  })

  return checkoutSession;

  }
  // * 決済画面を表示するために必要な情報の準備～ここまで
  ///////////////////////////////////////////////////////////////////////////////


  ///////////////////////////////////////////////////////////////////////////////
  // checkoutSessionの値例：
  // checkoutSession = {
  //   id: "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  //   object: "checkout.session",
    
  //   // 決済情報
  //   amount_subtotal: 999,
  //   amount_total: 999,
  //   currency: "jpy",
    
  //   // 顧客情報
  //   customer: "cus_NffrFeUfNV2Hib",  // 渡したstripeCustomerId
    
  //   // 商品情報
  //   line_items: {
  //     data: [{
  //       price: {
  //         id: "price_1234567890",  // PRO_PLAN_PRICE_ID
  //         product: "prod_abcdefg"
  //       },
  //       quantity: 1
  //     }]
  //   },
    
  //   // 設定した値
  //   mode: "subscription",
  //   payment_method_types: ["card"],
    
  //   // URL
  //   success_url: "https://yourapp.com/subscription?success=true",
  //   cancel_url: "https://yourapp.com/subscription?canceled=true", 
  //   url: "https://checkout.stripe.com/c/pay/cs_test_a1b2…",  ← 決済画面URL
    
  //   // メタデータ
  //   metadata: { userId: "user_123" },
    
  //   // ステータス
  //   status: "open",  // まだ決済されていない状態
  //   payment_status: "unpaid",
    
  //   // その他
  //   created: 1685123456,
  //   expires_at: 1685127056,
  //   livemode: false
  // }