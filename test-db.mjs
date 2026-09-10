import { db } from "./src/lib/db";

async function main() {
  try {
    const count = await db.donut.count();
    console.log("Donut count:", count);
    
    const donuts = await db.donut.findMany({
      take: 3,
      orderBy: { price: "desc" }
    });
    console.log("Top 3 most expensive donuts:");
    donuts.forEach(d => console.log(`- ${d.name}: $${d.price}`));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

main();