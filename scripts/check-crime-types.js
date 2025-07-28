const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkCrimeTypes() {
  try {
    console.log('🔍 Checking crime types in database...\n');

    // Get all crime types
    const crimeTypes = await prisma.crimeTypes.findMany({
      orderBy: {
        crime_type_id: 'asc'
      }
    });

    console.log('📋 Available Crime Types:');
    console.log('ID | Heading | Type');
    console.log('---|---------|------');
    crimeTypes.forEach(ct => {
      console.log(`${ct.crime_type_id.toString().padStart(2)} | ${ct.heading.padEnd(20)} | ${ct.type}`);
    });

    console.log(`\n📊 Total crime types: ${crimeTypes.length}`);

    // Check crimes with invalid crime type IDs
    const crimes = await prisma.crimes.findMany({
      select: {
        crime_id: true,
        crime_type_ids: true,
        title: true
      }
    });

    console.log('\n🔍 Checking for crimes with invalid crime type IDs...\n');

    let invalidCount = 0;
    const validIds = crimeTypes.map(ct => ct.crime_type_id);

    crimes.forEach(crime => {
      try {
        const typeIds = JSON.parse(crime.crime_type_ids);
        const ids = Array.isArray(typeIds) ? typeIds : [typeIds];
        
        const invalidIds = ids.filter(id => !validIds.includes(id));
        if (invalidIds.length > 0) {
          console.log(`❌ Crime ID ${crime.crime_id} (${crime.title}) has invalid crime type IDs: ${invalidIds.join(', ')}`);
          invalidCount++;
        }
      } catch (e) {
        console.log(`❌ Crime ID ${crime.crime_id} (${crime.title}) has invalid JSON in crime_type_ids: ${crime.crime_type_ids}`);
        invalidCount++;
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`- Total crimes: ${crimes.length}`);
    console.log(`- Crimes with invalid crime type IDs: ${invalidCount}`);
    console.log(`- Valid crime type IDs: ${validIds.join(', ')}`);

    if (invalidCount > 0) {
      console.log('\n💡 To fix this, update the crime_type_ids in the database to use valid IDs from the list above.');
    } else {
      console.log('\n✅ All crimes have valid crime type IDs!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCrimeTypes(); 