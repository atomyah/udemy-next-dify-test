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
import { authenticate } from '@/lib/actions/authenticate'; 

 
export default function LoginForm() {
    // formActionはフォームに設定（<form action={formAction}>）。useActionStateとuseStateの違い → ページ最下部に例示。
    // // useActionStateはServer Actions専用の状態管理フック.
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )

  return (
    <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
            <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
            <form action={formAction} className='space-y-4'>
                <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id='email' name='email' type='email' required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input id='password' name='password' type='password' required />
                </div>
                <Button type='submit' disabled={isPending} className="w-full">ログイン</Button>
                <div className="flex h-8 items-end space-x-1">
                {errorMessage && (
                    <div className="text-red-500">
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>
                )}
                </div>
            </form>
        </CardContent>
    </Card>
  )
}


// ========== useActionState版（現在のコード） ==========
// 'use client';

// export default function LoginFormWithActionState() {
//   const [errorMessage, formAction, isPending] = useActionState(
//     authenticate, // Server Action
//     undefined
//   );

//   return (
//     <form action={formAction}>
//       <input name="email" type="email" required />
//       <input name="password" type="password" required />
//       <button type="submit" disabled={isPending}>
//         {isPending ? 'ログイン中...' : 'ログイン'}
//       </button>
//       {errorMessage && <p className="text-red-500">{errorMessage}</p>}
//     </form>
//   );
// }

// Server Action（別ファイル）
// 'use server';
// export async function authenticate(prevState: string | undefined, formData: FormData) {
//   try {
//     await signIn('credentials', {
//       email: formData.get('email'),
//       password: formData.get('password'),
//       redirect: false,
//     });
//     redirect('/dashboard');
//   } catch (error) {
//     return 'ログインに失敗しました';
//   }
// }

// ========== useState版（従来の方法）この場合はサーバーアクションコード必要ない ==========
// 'use client';
// import { signIn } from 'next-auth/react';

// export default function LoginFormWithState() {
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault(); // デフォルトの送信を防ぐ
//     setIsLoading(true);
//     setErrorMessage(null);

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;

//     try {
//       const result = await signIn('credentials', {
//         email,
//         password,
//         redirect: false, // 手動でリダイレクト制御
//       });

//       if (result?.error) {
//         setErrorMessage('ログインに失敗しました');
//       } else {
//         router.push('/dashboard'); // 手動でリダイレクト
//       }
//     } catch (error) {
//       setErrorMessage('エラーが発生しました');
//     } finally {
//       setIsLoading(false); // 手動でローディング状態を解除
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input name="email" type="email" required />
//       <input name="password" type="password" required />
//       <button type="submit" disabled={isLoading}>
//         {isLoading ? 'ログイン中...' : 'ログイン'}
//       </button>
//       {errorMessage && <p className="text-red-500">{errorMessage}</p>}
//     </form>
//   );
// }