import type { NextAuthConfig } from 'next-auth';

const PROTECTED_PATH = ['/dashboard', '/manage', '/chat', '/subscription']
 
// 認証の基本設定（プロバイダーなし）
export const authConfig = {
  pages: {
    signIn: '/login',
  },
// callbacksのauthorized関数の役割
// この関数はページアクセス時の認証チェックを行う。
// ユーザーがページにアクセスしようとするたびに実行されアクセス許可の判定を行う。
  callbacks: {
    authorized({ auth, request: { nextUrl } }) { 
      // request: { nextUrl }の中身例：
      // request = {
      //   nextUrl: {
      //     pathname: "/subscription",      // アクセスしようとしているパス
      //     search: "?param=value",      // クエリパラメータ
      //     origin: "https://example.com" // ドメイン情報
      //   },
      //   // その他のリクエスト情報...
      // }
      const isLoggedIn = !!auth?.user; // auth?.userにはユーザー情報か,あるいはundefinedが入る。
      // ユーザー情報の場合!!auth?.userはtrue、undefinedの場合はfalse。
      const isProtectedRoute = PROTECTED_PATH.some(prefix =>  // prefixには.someメソッドによってPROTECTED_PATH配列のそれぞれの要素が入る
        nextUrl.pathname.startsWith(prefix)   // nextUrl.pathname.startsWith('/chat/123')だとしたら,'/chat'とprefixを比較してtrueかfalseを返す
      )
      if (isProtectedRoute) {
        if (isLoggedIn) return true; // もしログインしてればここで関数を終了してtrueを返す。Early Return（早期リターン）という記法
          return Response.redirect(new URL('/login', nextUrl)); // もしログインしてなければ上記はスキップし/loginにリダイレクトする。
      } else if (isLoggedIn && nextUrl.pathname === '/login') { // もしログインしていて/loginにアクセスした場合は/dashboardにリダイレクトする。
          return Response.redirect(new URL('/dashboard', nextUrl)); // new URL関数を使う理由： 絶対URLを生成するため。相対パスResponse.redirect('/dashboard')だと問題が起きる可能性があるため。
      }
      return true;
    },
  },
  providers: [], // // 空配列.プロバイダーなしの状態で認証を行うための設定
} satisfies NextAuthConfig;