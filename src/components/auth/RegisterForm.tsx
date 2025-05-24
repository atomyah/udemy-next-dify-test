'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState } from 'react'; // useActionStateを使うので'use client'
import { createUser } from '@/lib/actions/createUser'; // lib/actions/createUser.tsからインポートしてるfunction

export default function RegisterForm() {
    // useActionStateはServer Actions専用の状態管理フック. useActionStateとuseStateの違い → ページ最下部に例示。
    // formActionはフォームに設定（<form action={formAction}>）。
    const [state, formAction] = useActionState(createUser,{
        success: false, 
        errors: {} // 初期値(sucessはfalse, errorsは空)
    })
  return (
    <Card className="w-full max-w-md mx-auto">
        <CardHeader>
            <CardTitle>
                ユーザー新規登録
            </CardTitle>
        </CardHeader>
        <CardContent>
            <form action={formAction} className='space-y-4'>
                <div className="space-y-2">
                    <Label htmlFor='name'>名前</Label>
                    <Input id='name' name='name' type='text' required />
                    {state.errors.name && (
                        <p className='text-red-500 text-sm mt-1'>{state.errors.name.join(',')}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor='email'>メールアドレス</Label>
                    <Input id='email' name='email' type='text' required />
                    {state.errors.email && (
                        <p className='text-red-500 text-sm mt-1'>{state.errors.email.join(',')}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor='password'>パスワード</Label>
                    <Input id='password' name='password' type='password' required />
                    {state.errors.password && (
                        <p className='text-red-500 text-sm mt-1'>{state.errors.password.join(',')}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor='confirmPassword'>パスワード確認</Label>
                    <Input id='confirmPassword' name='confirmPassword' type='password' required />
                    {state.errors.confirmPassword && (
                        <p className='text-red-500 text-sm mt-1'>{state.errors.confirmPassword.join(',')}</p>
                    )}
                </div>
                <Button type='submit' className="w-full">登録</Button>
            </form>
        </CardContent>
    </Card>
  )
}


// useActionStateとuseStateの違い

// ========== useState の場合 ==========
// const [errors, setErrors] = useState({});
// const [loading, setLoading] = useState(false);

// const handleSubmit = async (formData: FormData) => {
//   setLoading(true);
//   try {
//     const result = await createUser(formData);
//     if (result.errors) {
//       setErrors(result.errors); // 手動でstateを更新
//     }
//   } catch (error) {
//     setErrors({ general: ['エラーが発生しました'] });
//   }
//   setLoading(false);
// };

// // フォームで使用
// <form onSubmit={handleSubmit}>
//   {/* フォームの内容 */}
// </form>


// ========== useActionState の場合 ==========
// const [state, formAction] = useActionState(createUser, {
//   success: false, 
//   errors: {} 
// });

// // フォームで使用（自動的にstateが更新される）
// <form action={formAction}>
//   {/* フォームの内容 */}
// </form>