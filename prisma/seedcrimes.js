const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();
const statuses = ['Pending', 'Resolved', 'Overdue'];

async function main() {
  await prisma.escalations.deleteMany();

  const crimes = await prisma.crimes.findMany();
  const users = await prisma.users.findMany();

  if (users.length < 2 || crimes.length === 0) {
    throw new Error("Need at least 2 users and some crimes.");
  }

  for (let i = 0; i < 100; i++) {
    const crime = faker.helpers.arrayElement(crimes);
    let raisedBy = faker.helpers.arrayElement(users);
    let raisedTo = faker.helpers.arrayElement(users);

    while (raisedTo.user_id === raisedBy.user_id) {
      raisedTo = faker.helpers.arrayElement(users);
    }

    await prisma.escalations.create({
      data: {
        crime_id: crime.crime_id,
        raised_by_id: raisedBy.user_id,
        raised_to_id: raisedTo.user_id,
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(statuses),
        raised_at: faker.date.between({ from: crime.created_at, to: new Date() })
      }
    });
  }

  console.log("✅ 100 escalations seeded.");
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(() => prisma.$disconnect());
