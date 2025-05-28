// middleware.tsではauth.config.tsのみを使用

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

// matcherの役割
// matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// この設定により、以下を除外してミドルウェアを実行：

// /api/* - API routes
// /_next/static/* - 静的ファイル
// /_next/image/* - 画像最適化
// *.png - PNG画像

// つまり、通常のページアクセス時のみ認証チェック