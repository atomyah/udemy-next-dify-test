import { prisma } from '../src/lib/prisma' // Node環境は@が認識できないので相対パス
import { seedUsers } from "./seeds/users";
import { seedSubscriptions } from "./seeds/subscriptions";


async function main() {
    await seedUsers();
    await seedSubscriptions();
    console.log('シード処理が完了しました');
}
main()
    .catch((e) => {
        console.error(e);
    process.exit(1);
})
    .finally(async () => {
        await prisma.$disconnect();
});