const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixCrimeTypeIds() {
  try {
    console.log('🔧 Fixing crime_type_ids format in database...\n');

    // Get all crimes with malformed crime_type_ids
    const crimes = await prisma.crimes.findMany({
      select: {
        crime_id: true,
        crime_type_ids: true,
        title: true
      }
    });

    let fixedCount = 0;
    let errors = 0;

    for (const crime of crimes) {
      try {
        let typeIds;
        
        // Check if it's already valid JSON
        try {
          typeIds = JSON.parse(crime.crime_type_ids);
        } catch (e) {
          // If it's not valid JSON, it might be comma-separated
          if (typeof crime.crime_type_ids === 'string' && crime.crime_type_ids.includes(',')) {
            // Convert comma-separated string to JSON array
            const ids = crime.crime_type_ids.split(',').map(id => parseInt(id.trim()));
            typeIds = ids;
            console.log(`🔄 Converting crime ${crime.crime_id}: "${crime.crime_type_ids}" -> ${JSON.stringify(typeIds)}`);
          } else {
            // Single ID case
            const id = parseInt(crime.crime_type_ids);
            typeIds = [id];
            console.log(`🔄 Converting crime ${crime.crime_id}: "${crime.crime_type_ids}" -> ${JSON.stringify(typeIds)}`);
          }
        }

        // Validate that all IDs exist in crimeTypes table
        const validIds = await prisma.crimeTypes.findMany({
          select: { crime_type_id: true }
        });
        const validIdSet = new Set(validIds.map(ct => ct.crime_type_id));
        
        const validTypeIds = typeIds.filter(id => validIdSet.has(id));
        
        if (validTypeIds.length === 0) {
          console.log(`⚠️ Crime ${crime.crime_id} has no valid crime type IDs, skipping...`);
          continue;
        }

        // Update the crime with properly formatted JSON
        await prisma.crimes.update({
          where: { crime_id: crime.crime_id },
          data: {
            crime_type_ids: JSON.stringify(validTypeIds)
          }
        });

        fixedCount++;
        console.log(`✅ Fixed crime ${crime.crime_id}: ${JSON.stringify(validTypeIds)}`);

      } catch (error) {
        console.error(`❌ Error fixing crime ${crime.crime_id}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Total crimes processed: ${crimes.length}`);
    console.log(`- Successfully fixed: ${fixedCount}`);
    console.log(`- Errors: ${errors}`);

    if (fixedCount > 0) {
      console.log('\n✅ Crime type IDs have been fixed! The "Unknown" category should now disappear from the charts.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCrimeTypeIds(); 