const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  console.log("🔁 Updating ACP assignments...");

  const updates = [
    { station_id: 226, acp_id: 25 }, // Yerwada
    { station_id: 227, acp_id: 25 }, // Dehu
    { station_id: 228, acp_id: 25 }, // Moshi
  ];

  for (const update of updates) {
    await prisma.stations.update({
      where: { station_id: update.station_id },
      data: { acp_id: update.acp_id },
    });
    console.log(`✅ Updated station_id ${update.station_id} to acp_id ${update.acp_id}`);
  }

  console.log("✅ ACP reassignment complete.");
}

main()
  .catch((e) => {
    console.error("❌ Error updating ACPs:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
