'use server';
 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
 
// ...
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // await signIn('credentials', formData); // 自動リダイレクトがかかる
    await signIn('credentials', {
      ...Object.fromEntries(formData), // 自動リダイレクトかからないようにするために、オブジェクトに変換して渡す
      redirect: false,
    });
    redirect('/dashboard'); // ログイン成功後にリダイレクト
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'メールアドレスまたはパスワードが正しくありません.';
        default:
          return 'エラーが発生しました.';
      }
    }
    throw error;
  }
}