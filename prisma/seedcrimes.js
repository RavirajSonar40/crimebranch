const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config({ path: '../.env' });

async function main() {
  console.log("⏳ Seeding 100 crimes...");

  const stationAssignments = [
    { station_id: 444, user_id: 444 },
    { station_id: 555, user_id: 555 },
    { station_id: 666, user_id: 666 },
    { station_id: 777, user_id: 777 },
    { station_id: 888, user_id: 888 },
    { station_id: 999, user_id: 999 },
  ];

  const categories = ['MINOR', 'MAJOR', 'MINOR_MAJOR'];
  const statuses = ['Pending', 'Resolved', 'Overdue'];
  const reminderTypes = ['First', 'Second', 'Third'];
  const crimeTypeIdsList = [[1], [2], [3], [4], [5], [1, 2], [3, 4], [5, 6]];
  const escalationReasons = [
    "No response from officer",
    "Pending for long",
    "Victim follow-up",
    "Station busy",
    "Lack of updates",
    "Suspect missing",
    "Victim unsatisfied"
  ];

  const pis = [
    { user_id: 444 }, { user_id: 555 }, { user_id: 666 }
  ];
  const acps = [
    { user_id: 222 }, { user_id: 333 }, { user_id: 999 }
  ];

  // Seed 100 crimes
  for (let i = 0; i < 100; i++) {
    const { station_id, user_id } = stationAssignments[i % stationAssignments.length];

    const crime = await prisma.crimes.create({
      data: {
        title: `Crime Case #${i + 1}`,
        description: `Auto-generated case description for crime ${i + 1}.`,
        category: categories[i % categories.length],
        status: statuses[i % statuses.length],
        station_id,
        assigned_to_id: user_id,
        crime_type_ids: crimeTypeIdsList[i % crimeTypeIdsList.length],
      },
    });

    await prisma.reminders.create({
      data: {
        crime_id: crime.crime_id,
        reminder_type: reminderTypes[i % reminderTypes.length],
        reminder_date: new Date(),
      },
    });

    const raised_by = pis[i % pis.length].user_id;
    const raised_to = acps[i % acps.length].user_id;
    await prisma.escalations.create({
      data: {
        crime_id: crime.crime_id,
        reason: escalationReasons[i % escalationReasons.length],
        status: statuses[i % statuses.length],
        raised_by_id: raised_by,
        raised_to_id: raised_to,
        raised_at: new Date(),
      },
    });
  }

  console.log("✅ 100 Crimes seeded.");

  // Seed 30 crimes with past monthly dates
  console.log("⏳ Seeding 30 backdated crimes (one per past month)...");

  for (let i = 0; i < 30; i++) {
    const { station_id, user_id } = stationAssignments[i % stationAssignments.length];

    const createdAt = new Date();
    createdAt.setMonth(createdAt.getMonth() - i); // backdate month-wise

    const backdatedCrime = await prisma.crimes.create({
      data: {
        title: `Backdated Crime #${i + 1}`,
        description: "Reported in past months for testing analytics.",
        category: categories[i % categories.length],
        status: statuses[i % statuses.length],
        station_id,
        assigned_to_id: user_id,
        crime_type_ids: crimeTypeIdsList[i % crimeTypeIdsList.length],
        created_at: createdAt,
      },
    });

    await prisma.reminders.create({
      data: {
        crime_id: backdatedCrime.crime_id,
        reminder_type: reminderTypes[i % reminderTypes.length],
        reminder_date: new Date(createdAt.getTime() + 3 * 86400000), // 3 days later
      },
    });

    const raised_by = pis[i % pis.length].user_id;
    const raised_to = acps[i % acps.length].user_id;
    await prisma.escalations.create({
      data: {
        crime_id: backdatedCrime.crime_id,
        reason: escalationReasons[i % escalationReasons.length],
        status: statuses[i % statuses.length],
        raised_by_id: raised_by,
        raised_to_id: raised_to,
        raised_at: new Date(createdAt.getTime() + 5 * 86400000), // 5 days later
      },
    });
  }

  console.log("✅ 30 Backdated crimes seeded.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding crimes:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
