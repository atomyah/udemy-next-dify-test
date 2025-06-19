////////////////////////////////////////////////////////////////////////////////
//* Stripeで決済イベントが起きた時通知してくれるためのエンドポイント（API）
//* Stripe CLIのstripe listen --forward-to localhost:3000/api/stripe/webhookで登録した
////////////////////////////////////////////////////////////////////////////////

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"                   // クライアント
import Stripe from "stripe"                             // 型指定で必要
import { saveSubscription } from "@/lib/stripe/subscription";   // DB保存関数があるファイル

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
    try {
        const body = await req.text() // 生データ
        const headersList = await headers()
        const signature = headersList.get('Stripe-Signature')

        if(!signature || !webhookSecret) {
            return NextResponse.json(
                { error: '署名またはwebhookシークレットがありません'},
                { status: 400 }
            )
        }

        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        console.log('＠api/stripe/webhook/route.tsにてeventを表示', event)

        if(event.type === 'checkout.session.completed'){
            await handleCheckoutCompleted(event)
        }

        return NextResponse.json({ received: true }, { status: 200 })

    } catch(error) {
        console.error('Webhookエラー', error)

        const statusCode = error instanceof Stripe.errors.StripeSignatureVerificationError ? 400 : 500
        // 400はクライアントエラー、Stripeの署名検証失敗など
        // 500は内部サーバーエラー、データベース接続失敗など
        return NextResponse.json(
            { error: '決済失敗' },
            { status: statusCode }
        )
    }
}



async function handleCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId as string
    const subscriptionId = session.subscription as string

    // 追加情報の取得
    // // stripe.subscriptions.retrieve() はStripe APIを使用してサブスクリプションの詳細情報を取得するメソッド
    // 参考：subscriptionオブジェクトhttps://docs.stripe.com/api/subscriptions/object?api-version=2025-05-28.preview
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    console.log('@api/strip/webhook/route.tsにてsubscriptionを表示', subscription)

    const priceId = subscription.items.data[0]?.price.id
    const customer = subscription.customer as string
    const startDate = new Date(subscription.items.data[0]?.current_period_start * 1000)
    const endDate = new Date(subscription.items.data[0].current_period_end * 1000)
    const cancelAtPeriodEnd = subscription.cancel_at_period_end
    
    await saveSubscription(
        userId, customer, priceId, subscriptionId, startDate, endDate, cancelAtPeriodEnd
    )
}

// console.log('＠api/stripe/webhook/route.tsにてeventを表示', event)の表示結果：
// 今回は'checkout.session.completed'タイプだけ追いかけるが、他タイプもpayment_intent.succeededとかinvoice.payment_succeededとか色々入ってる
// ＠api/stripe/webhook/route.tsにてeventを表示 {
//     id: 'evt_1RasO5POKdZrtNGzxwzhoaYP',
//     object: 'event',
//     api_version: '2025-05-28.basil',
//     created: 1750139329,
//     data: {
//       object: {
//         id: 'cs_test_a1P6jETnLFDHZ0u9wFGv1qSxmWofoswmagRc9u0dgCb5TcM3nov5SAh4mq',
//         object: 'checkout.session',
//         adaptive_pricing: null,
//         after_expiration: null,
//         allow_promotion_codes: null,
//         amount_subtotal: 500,
//         amount_total: 500,
//         automatic_tax: [Object],
//         billing_address_collection: null,
//         cancel_url: 'http://localhost:3000/subscription?canceled=true',
//         client_reference_id: null,
//         client_secret: null,
//         collected_information: [Object],
//         consent: null,
//         consent_collection: null,
//         created: 1750139286,
//         currency: 'usd',
//         currency_conversion: null,
//         custom_fields: [],
//         custom_text: [Object],
//         customer: 'cus_SUmdzGEpY4jFmf',
//         customer_creation: null,
//         customer_details: [Object],
//         customer_email: null,
//         discounts: [],
//         expires_at: 1750225685,
//         invoice: 'in_1RasO4POKdZrtNGzzKT4jAiJ',
//         invoice_creation: null,
//         livemode: false,
//         locale: null,
//         metadata: [Object],
//         mode: 'subscription',
//         payment_intent: null,
//         payment_link: null,
//         payment_method_collection: 'always',
//         payment_method_configuration_details: null,
//         payment_method_options: [Object],
//         payment_method_types: [Array],
//         payment_status: 'paid',
//         permissions: null,
//         phone_number_collection: [Object],
//         recovered_from: null,
//         saved_payment_method_options: [Object],
//         setup_intent: null,
//         shipping_address_collection: null,
//         shipping_cost: null,
//         shipping_options: [],
//         status: 'complete',
//         submit_type: null,
//         subscription: 'sub_1RasO4POKdZrtNGza070G8fj',
//         success_url: 'http://localhost:3000/subscription?success=true',
//         total_details: [Object],
//         ui_mode: 'hosted',
//         url: null,
//         wallet_options: null
//       }
//     },
//     livemode: false,
//     pending_webhooks: 2,
//     request: { id: null, idempotency_key: null },
//     type: 'checkout.session.completed'
//   }


// console.log('@api/strip/webhook/route.tsにてsubscriptionを表示', subscription)の表示結果：
// @api/strip/webhook/route.tsにてsubscriptionを表示 {
//     id: 'sub_1RauIIPOKdZrtNGzIE1lX779',
//     object: 'subscription',
//     application: null,
//     application_fee_percent: null,
//     automatic_tax: { disabled_reason: null, enabled: false, liability: null },
//     billing_cycle_anchor: 1750146657,
//     billing_cycle_anchor_config: null,
//     billing_thresholds: null,
//     cancel_at: null,
//     cancel_at_period_end: false,     ← ************************************* subscription.cancel_at_period_end ***********
//     canceled_at: null,
//     cancellation_details: { comment: null, feedback: null, reason: null },
//     collection_method: 'charge_automatically',
//     created: 1750146657,
//     currency: 'usd',
//     customer: 'cus_SUmdzGEpY4jFmf',  ← ********************************************* customerのID ********************
//     days_until_due: null,
//     default_payment_method: 'pm_1RauIGPOKdZrtNGzKRB2l5Q5',
//     default_source: null,
//     default_tax_rates: [],
//     description: null,
//     discounts: [],
//     ended_at: null,
//     invoice_settings: { account_tax_ids: null, issuer: { type: 'self' } },
//     items: {
//       object: 'list',
//       data: [ [Object] ], ← ********************************************* この中に subscription.items.data[0]?.price.id がある。++++++++++++
//       has_more: false,
//       total_count: 1,
//       url: '/v1/subscription_items?subscription=sub_1RauIIPOKdZrtNGzIE1lX779'
//     },
//     latest_invoice: 'in_1RauIIPOKdZrtNGzwrgxnMQV',
//     livemode: false,
//     metadata: { userId: 'cmbq954dy00012l4ttsase3zo' },
//     next_pending_invoice_item_invoice: null,
//     on_behalf_of: null,
//     pause_collection: null,
//     payment_settings: {
//       payment_method_options: {
//         acss_debit: null,
//         bancontact: null,
//         card: [Object],
//         customer_balance: null,
//         konbini: null,
//         sepa_debit: null,
//         us_bank_account: null
//       },
//       payment_method_types: [ 'card' ],
//       save_default_payment_method: 'off'
//     },
//     pending_invoice_item_interval: null,
//     pending_setup_intent: null,
//     pending_update: null,
//     plan: {
//       id: 'price_1RYi8NPOKdZrtNGzcuzzgRDl',
//       object: 'plan',
//       active: true,
//       amount: 500,
//       amount_decimal: '500',
//       billing_scheme: 'per_unit',
//       created: 1749623259,
//       currency: 'usd',
//       interval: 'month',
//       interval_count: 1,
//       livemode: false,
//       metadata: {},
//       meter: null,
//       nickname: null,
//       product: 'prod_STfThZCMWloYw8',
//       tiers_mode: null,
//       transform_usage: null,
//       trial_period_days: null,
//       usage_type: 'licensed'
//     },
//     quantity: 1,
//     schedule: null,
//     start_date: 1750146657,
//     status: 'active',
//     test_clock: null,
//     transfer_data: null,
//     trial_end: null,
//     trial_settings: { end_behavior: { missing_payment_method: 'create_invoice' } },
//     trial_start: null
//   }