import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface Migration {
  id: string;
  filename: string;
}

class RollbackRunner {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async getExecutedMigrations(): Promise<Migration[]> {
    try {
      const result = await this.pool.query(
        'SELECT id, filename FROM migrations ORDER BY executed_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.log('No migrations table found or no migrations executed.');
      return [];
    }
  }

  async loadRollbackSql(migrationId: string): Promise<string | null> {
    const rollbacksDir = join(__dirname, '../rollbacks');
    const rollbackFile = join(rollbacksDir, `${migrationId}.sql`);
    
    try {
      return readFileSync(rollbackFile, 'utf-8');
    } catch (error) {
      console.warn(`No rollback file found for migration: ${migrationId}`);
      return null;
    }
  }

  async rollbackLastMigration(): Promise<void> {
    console.log('Starting rollback...');
    
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    const lastMigration = executedMigrations[0];
    console.log(`Rolling back migration: ${lastMigration.filename}`);

    const rollbackSql = await this.loadRollbackSql(lastMigration.id);
    
    if (!rollbackSql) {
      console.error(`Cannot rollback ${lastMigration.filename}: No rollback script found.`);
      console.log('You may need to manually rollback this migration.');
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(rollbackSql);
      await client.query(
        'DELETE FROM migrations WHERE id = $1',
        [lastMigration.id]
      );
      await client.query('COMMIT');
      console.log(`✓ Migration ${lastMigration.filename} rolled back successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`✗ Rollback of ${lastMigration.filename} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async rollbackToMigration(targetMigrationId: string): Promise<void> {
    console.log(`Rolling back to migration: ${targetMigrationId}`);
    
    const executedMigrations = await this.getExecutedMigrations();
    const targetIndex = executedMigrations.findIndex(m => m.id === targetMigrationId);
    
    if (targetIndex === -1) {
      console.error(`Migration ${targetMigrationId} not found in executed migrations.`);
      return;
    }

    const migrationsToRollback = executedMigrations.slice(0, targetIndex);
    
    for (const migration of migrationsToRollback) {
      console.log(`Rolling back migration: ${migration.filename}`);
      
      const rollbackSql = await this.loadRollbackSql(migration.id);
      
      if (!rollbackSql) {
        console.error(`Cannot rollback ${migration.filename}: No rollback script found.`);
        console.log('Stopping rollback process.');
        return;
      }

      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(rollbackSql);
        await client.query(
          'DELETE FROM migrations WHERE id = $1',
          [migration.id]
        );
        await client.query('COMMIT');
        console.log(`✓ Migration ${migration.filename} rolled back`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Rollback of ${migration.filename} failed:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('Rollback completed successfully!');
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

  const runner = new RollbackRunner(connectionString);
  const targetMigration = process.argv[2];
  
  const rollbackPromise = targetMigration 
    ? runner.rollbackToMigration(targetMigration)
    : runner.rollbackLastMigration();
  
  rollbackPromise
    .then(() => runner.close())
    .catch(error => {
      console.error('Rollback failed:', error);
      runner.close();
      process.exit(1);
    });
}

export { RollbackRunner };
