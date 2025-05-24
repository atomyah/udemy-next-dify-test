'use server'

import { registerSchema } from "@/validation/user"
import  { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"

type ActionState = {
    success: boolean,
    errors: Record<string, string[]>    
}

// バリデーションエラー処理関数
function handleValidationError(error: any): ActionState {
    const { fieldErrors, formErrors } = error.flatten();
    // zodの仕様でパスワード一致確認のエラーは formErrorsで渡ってくる
    // formErrorsがある場合は、confirmPasswordフィールドにエラーを追加
    if (formErrors.length > 0) {
    return { success: false, errors: { ...fieldErrors, confirmPassword: formErrors
    }}}
    // それ以外のエラーは、fieldErrorsに格納されているので、fieldErrorsをそのまま返す
    return { success: false, errors: fieldErrors };
}

// カスタムエラー処理
function handleError(customErrors: Record<string, string[]>): ActionState {
    return { success: false, errors: customErrors };
}


export async function createUser(
    prevState: ActionState, 
    formData: FormData
) : Promise<ActionState> {
    // フォームから渡ってきた情報を取得（Object.fromEntriesで一気にそれぞれの値をオブジェクト形式で取得する特別なやり方）
    const rawFormData = Object.fromEntries(
        ["name", "email", "password", "confirmPassword"].map((field) => [
            field,
            formData.get(field) as string
        ])
    ) as Record<string, string>

    // バリデーション
    const validationResult = registerSchema.safeParse(rawFormData)
    if (!validationResult.success) {
        return handleValidationError(validationResult.error)
    }

    // DBにメールアドレスが存在するか確認
    const existingUser = await prisma.user.findUnique({
        where: { email: rawFormData.email }
    })
    if (existingUser) {
        return handleError({
            email: ["このメールアドレスはすでに登録されています"]
        })
    }
    
    // DBに登録
    const hashedPassword = await bcryptjs.hash(rawFormData.password, 12)
    await prisma.user.create({
        data: {
            name: rawFormData.name,
            email: rawFormData.email,
            password: hashedPassword
        }
    })

    // dashboardにリダイレクト
    await signIn('credentials', {
      ...Object.fromEntries(formData), // 自動リダイレクトかからないようにするために、オブジェクトに変換して渡す
      redirect: false,                 // authenticate.ts参考
    });
    redirect('/dashboard'); // ログイン成功後にリダイレクト    
}