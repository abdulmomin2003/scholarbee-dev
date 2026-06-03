import { Schema as MongooseSchema } from 'mongoose';

export function timestampsPlugin(schema: MongooseSchema) {
    schema.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at' });
}