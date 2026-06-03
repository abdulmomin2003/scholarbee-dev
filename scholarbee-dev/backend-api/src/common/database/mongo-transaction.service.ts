import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { TransactionOptions } from 'mongodb';
import { ClientSession, Connection } from 'mongoose';
import { IConfiguration } from 'src/config/configuration';


@Injectable()
export class MongoTransactionService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly configService: ConfigService<IConfiguration>,
  ) { }

  /**
   * Runs the provided unit of work inside a MongoDB transaction.
   *
   * NOTE: This implementation has known issues when used against a non–replica set
   * MongoDB instance in local development. The `skipTransactRollbackForLocalDevelopment`
   * flag is a temporary workaround that bypasses transaction handling in non‑production
   * environments so work can proceed without a replica set.
   *
   * This method should be revisited and properly debugged against a local replica set
   * configuration to ensure transaction behavior is correct and reliable.
   *
   * Any error thrown from the callback will abort the transaction.
   */
  async runInTransaction<T>(
    work: (session: ClientSession) => Promise<T>,
    options?: TransactionOptions,
    /**
     * Allow skipping actual transaction handling in non-production environments
     * so that local development can work without a Mongo replica set.
     */
    skipTransactRollbackForLocalDevelopment?: boolean,
  ): Promise<T> {
    const session = await this.connection.startSession();

    // Allow skipping actual transaction handling in non-production environments
    // so that local development can work without a Mongo replica set.
    const nodeEnv = this.configService.get('app.nodeEnv', { infer: true });
    if (skipTransactRollbackForLocalDevelopment && nodeEnv !== 'production') {
      try {
        return await work(session);
      } finally {
        await session.endSession();
      }
    }

    try {
      let result!: T;

      await session.withTransaction(async () => {
        result = await work(session);
        // @ts-ignore
      }, options as unknown as TransactionOptions);

      return result;
    } finally {
      await session.endSession();
    }
  }
}
