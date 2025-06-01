import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'; // バリデーション
import { prisma } from './lib/prisma'; 
import bcryptjs from 'bcryptjs';


async function getUser(email: string) { // ユーザー取得関数
    return await prisma.user.findUnique({
        where: { email: email }})}

// auth - セッション取得関数
//  const session = await auth();
// signIn - ログイン関数
//  await signIn('credentials', formData);
// signOut - ログアウト関数
//  await signOut();
// handlers - API Route用ハンドラー
//  import { handlers } from "@/auth";
//  export const { GET, POST } = handlers;
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 以下、認証ロジック
        const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(8) }) // バリデーション
            .safeParse(credentials);

        if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await getUser(email); // ユーザー取得
            if (!user) return null;
            const passwordsMatch = await bcryptjs.compare(password, user.password); // パスワード比較
            if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // console.log('session:', session) // 出力例：session: { user: { name: 'Test User', email: test@example.com'
      // console.log('トークン:', token) // 出力例：トークン: { sub: "cmb0eilbi00012lqsn3lzcfu8", name: 'Test User',...' subの値はsqliteのユーザーID
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    }
  }
  
});