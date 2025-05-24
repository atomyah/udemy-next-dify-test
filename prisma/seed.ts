// primsa.対象テーブル名.メソッド のように記述
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient() // ダミーデータ作成のときだけPrismaクライアントを生成して使用

async function main() {
    // userテーブルクリーンアップ
    await prisma.user.deleteMany()
        const hashedPassword = await bcrypt.hash('password123', 12) // 暗号化。最後の12は暗号化の複雑さを指定（デフォルトは10-12）

    // ユーザー作成
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN'
    }})
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            role: 'USER'
        }})
    console.log('●@prisma/seed.tsでadminUserとuser：', { adminUser, user })

    // ユーザーの取得
    const allUsers = await prisma.user.findMany();
    console.log('●@prisma/seed.tsで全てのユーザー：', allUsers);
}

main()
    .catch((e) => {
        console.error(e) 
        process.exit(1) 
    })
    .finally(async () => { 
        await prisma.$disconnect() 
    })

