import { RDSDataService } from '@aws-sdk/client-rds-data';
import { logger } from '@ecommerce/shared';

export class DatabaseService {
  private rdsData: RDSDataService;
  private clusterArn: string;
  private secretArn: string;
  private databaseName: string;

  constructor() {
    this.rdsData = new RDSDataService({});
    this.clusterArn = process.env.DB_CLUSTER_ARN!;
    this.secretArn = process.env.DB_SECRET_ARN!;
    this.databaseName = process.env.DB_NAME || 'ecommerce';
  }

  async query(sql: string, parameters: any[] = []): Promise<any> {
    try {
      const params = {
        resourceArn: this.clusterArn,
        secretArn: this.secretArn,
        database: this.databaseName,
        sql,
        parameters: parameters.map(param => ({
          value: { stringValue: param?.toString() || null }
        }))
      };

      logger.debug('Executing database query', { sql, paramCount: parameters.length });

      const result = await this.rdsData.executeStatement(params);
      
      return {
        rows: this.formatRows(result.records || [], result.columnMetadata || [])
      };

    } catch (error) {
      logger.error('Database query error', { error, sql });
      throw error;
    }
  }

  private formatRows(records: any[], columnMetadata: any[]): any[] {
    return records.map(record => {
      const row: any = {};
      record.forEach((field: any, index: number) => {
        const columnName = columnMetadata[index]?.name || `column_${index}`;
        row[columnName] = this.extractValue(field);
      });
      return row;
    });
  }

  private extractValue(field: any): any {
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.longValue !== undefined) return field.longValue;
    if (field.doubleValue !== undefined) return field.doubleValue;
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.isNull) return null;
    return field;
  }
}
