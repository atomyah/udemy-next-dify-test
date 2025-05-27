import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
// callbacksのauthorized関数の役割
// この関数はページアクセス時の認証チェックを行う。
// ユーザーがページにアクセスしようとするたびに実行されアクセス許可の判定を行う。
  callbacks: {
    authorized({ auth, request: { nextUrl } }) { // nextUrlはリクエストされたURL情報
      // isLoggedIn: ユーザーのログイン状態
      // isOnDashboard: アクセス先が保護されたページかどうか
      const isLoggedIn = !!auth?.user; // auth?.userにはユーザー情報かundefinedが入る。
      // ユーザー情報の場合!!auth?.userはtrue、undefinedの場合はfalse。
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') 
      || nextUrl.pathname.startsWith('/manage')
      || nextUrl.pathname.startsWith('/chat')
      if (isOnDashboard) {
        if (isLoggedIn) return true; // もしログインしてればここで関数を終了してtrueを返す。
        return Response.redirect(new URL('/login', nextUrl)); // もしログインしてなければ上記はスキップし/loginにリダイレクトする。Early Return（早期リターン）という記法
      } else if (isLoggedIn && nextUrl.pathname === '/login') { // もしログインしていて/loginにアクセスした場合は/dashboardにリダイレクトする。
        return Response.redirect(new URL('/dashboard', nextUrl)); // new URL関数を使う理由： 絶対URLを生成するため。相対パスResponse.redirect('/dashboard')だと問題が起きる可能性があるため。
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;