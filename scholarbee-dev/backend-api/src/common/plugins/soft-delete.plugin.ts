import { Aggregate, Query, Schema as MongooseSchema } from 'mongoose';

/**
 * ## SOFT DELETE PLUGIN
 * This plugin implements "Logical Deletion" rather than "Physical Deletion".
 *
 * ### Functionality:
 * 1. Automatically filters out documents where `_deleted: true` in `find`, `findOne`, etc.
 * 2. Injects a `$match: { _deleted: false }` at the start of every Aggregation Pipeline.
 * 3. Provides `.softDelete()` and `.restore()` methods on the document instance.
 *
 * ### How to bypass (Opt-in to see deleted data):
 * To fetch deleted documents, pass `includeDeleted: true` in your query or aggregate options:
 * @example
 * this.model.find({ includeDeleted: true });
 * this.model.aggregate(pipeline, { includeDeleted: true });
 */
export const SoftDeletePlugin = (schema: MongooseSchema) => {
  schema.add({
    _deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  });

  schema.pre(/^find/, function (this: Query<any, any>, next) {
    const filter = this.getQuery();
    if (filter['includeDeleted'] === true) {
      delete filter['includeDeleted'];
      return next();
    }
    // Include documents where _deleted is false OR the field doesn't exist
    this.where({ _deleted: { $ne: true } }); // Handles null/undefined
    next();
  });

  schema.pre('aggregate', function (this: Aggregate<any>, next) {
    const options = this.options as any;
    if (options.includeDeleted === true) return next();
    this.pipeline().unshift({ $match: { _deleted: { $ne: true } } }); // Handles null/undefined
    next();
  });

  schema.methods.softDelete = async function () {
    this._deleted = true;
    this.deletedAt = new Date();
    // Logic Note: We append a timestamp to unique fields if necessary here (see "Known Limitations")
    return this.save();
  };

  schema.methods.restore = async function () {
    this._deleted = false;
    this.deletedAt = null;
    return this.save();
  };
};

export type DocumentWithDeleted<T> = T & {
  _deleted?: boolean;
  deletedAt?: Date | null;
  softDelete?: () => Promise<T>;
  restore?: () => Promise<T>;
};
