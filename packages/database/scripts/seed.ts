import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

class SeedRunner {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async loadSeedFiles(): Promise<{ filename: string; sql: string }[]> {
    const seedsDir = join(__dirname, '../seeds');
    const files = readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const sql = readFileSync(join(seedsDir, filename), 'utf-8');
      return { filename, sql };
    });
  }

  async runSeeds(): Promise<void> {
    console.log('Starting database seeding...');
    
    const seedFiles = await this.loadSeedFiles();
    
    if (seedFiles.length === 0) {
      console.log('No seed files found.');
      return;
    }

    for (const seedFile of seedFiles) {
      console.log(`Running seed: ${seedFile.filename}`);
      
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(seedFile.sql);
        await client.query('COMMIT');
        console.log(`✓ Seed ${seedFile.filename} completed`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Seed ${seedFile.filename} failed:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('All seeds completed successfully!');
  }

  async clearData(): Promise<void> {
    console.log('Clearing existing data...');
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete in order to respect foreign key constraints
      await client.query('DELETE FROM order_items');
      await client.query('DELETE FROM orders');
      await client.query('DELETE FROM cart_items');
      await client.query('DELETE FROM carts');
      await client.query('DELETE FROM products');
      await client.query('DELETE FROM categories');
      await client.query('DELETE FROM users WHERE email LIKE \'%@example.com\'');
      
      await client.query('COMMIT');
      console.log('✓ Data cleared successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('✗ Failed to clear data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// CLI execution
if (require.main === module) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const runner = new SeedRunner(connectionString);
  const shouldClear = process.argv.includes('--clear');
  
  const seedPromise = shouldClear 
    ? runner.clearData().then(() => runner.runSeeds())
    : runner.runSeeds();
  
  seedPromise
    .then(() => runner.close())
    .catch(error => {
      console.error('Seeding failed:', error);
      runner.close();
      process.exit(1);
    });
}

export { SeedRunner };
