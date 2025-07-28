const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Deleting old stations...");
  await prisma.stations.deleteMany(); // Make sure no users still reference these

  console.log("⏳ Seeding new stations...");

  const stationData = [
    { name: "Alandi Police Station" },
    { name: "Dighi Police Station" },
    { name: "Manpa Police Station" },
    { name: "Yerwada Police Station" },
    { name: "Moshi Police Station" },
    { name: "Dehu Police Station" },
  ];

  for (const data of stationData) {
    await prisma.stations.create({ data });
  }

  console.log("✅ Stations seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding stations:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
