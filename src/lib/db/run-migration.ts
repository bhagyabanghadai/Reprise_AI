import addStrengthColumns from './migrations/add-strength-columns';

/**
 * Runs all database migrations in the correct order
 */
async function runMigrations() {
  try {
    console.log('Starting all migrations...');
    
    // Add strength limits to user profiles
    await addStrengthColumns();
    
    // Add more migrations here as needed
    // await otherMigration();
    
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  }
}

// Run migrations when this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('All migrations completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default runMigrations;