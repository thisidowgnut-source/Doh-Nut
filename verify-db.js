import { db } from "./src/lib/db";

async function main() {
  try {
    const donutCount = await db.donut.count();
    console.log(`✅ Donut count: ${donutCount}`);

    const featuredDonuts = await db.donut.count({ where: { featured: true } });
    console.log(`✅ Featured donuts: ${featuredDonuts}`);

    const orderCount = await db.order.count();
    console.log(`✅ Order count: ${orderCount}`);

    // Test a simple transaction
    const expensiveDonut = await db.donut.findFirst({
      orderBy: { price: "desc" },
    });
    console.log(`✅ Most expensive donut: ${expensiveDonut?.name} ($${expensiveDonut?.price})`);

    console.log("✅ Database connectivity and basic queries successful.");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
