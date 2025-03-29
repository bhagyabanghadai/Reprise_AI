import { db } from '../index';
import { sql } from 'drizzle-orm';

/**
 * Migration to ensure the strength_limits column exists in the user_profiles table
 */
async function addStrengthColumns() {
  try {
    console.log('Starting migration: Adding strength_limits column if it does not exist');
    
    // Simply add the column if it doesn't exist (using IF NOT EXISTS)
    await db.execute(sql`
      ALTER TABLE IF EXISTS user_profiles 
      ADD COLUMN IF NOT EXISTS strength_limits JSONB DEFAULT '[]'::JSONB;
    `);
    
    console.log('Successfully added strength_limits column (if it didn\'t exist)');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Execute the migration when this file is run directly
if (require.main === module) {
  addStrengthColumns()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default addStrengthColumns;