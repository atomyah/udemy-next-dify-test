import { prisma } from '../../src/lib/prisma'
import * as bcrypt from 'bcryptjs'


export async function seedUsers() {
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

