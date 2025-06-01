import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface Migration {
  id: string;
  filename: string;
  sql: string;
}

class MigrationRunner {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.pool.query(sql);
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query('SELECT id FROM migrations ORDER BY id');
    return result.rows.map(row => row.id);
  }

  async loadMigrations(): Promise<Migration[]> {
    const migrationsDir = join(__dirname, '../migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const id = filename.replace('.sql', '');
      const sql = readFileSync(join(migrationsDir, filename), 'utf-8');
      return { id, filename, sql };
    });
  }

  async runMigrations(): Promise<void> {
    console.log('Starting database migrations...');
    
    await this.createMigrationsTable();
    
    const allMigrations = await this.loadMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations found.');
      return;
    }

    for (const migration of pendingMigrations) {
      console.log(`Running migration: ${migration.filename}`);
      
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO migrations (id, filename) VALUES ($1, $2)',
          [migration.id, migration.filename]
        );
        await client.query('COMMIT');
        console.log(`✓ Migration ${migration.filename} completed`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Migration ${migration.filename} failed:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('All migrations completed successfully!');
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

  const runner = new MigrationRunner(connectionString);
  
  runner.runMigrations()
    .then(() => runner.close())
    .catch(error => {
      console.error('Migration failed:', error);
      runner.close();
      process.exit(1);
    });
}

export { MigrationRunner };
