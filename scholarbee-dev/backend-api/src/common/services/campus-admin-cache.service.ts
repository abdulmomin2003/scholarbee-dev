import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserNS } from 'src/users/schemas/user.schema';
import { InMemHybridCache } from './in-mem-hybrid-cache';

/**
 * CampusAdminCacheService
 * 
 * A high-performance caching service designed to efficiently retrieve and manage
 * campus administrator user IDs for multi-campus applications. This service
 * significantly reduces database load by caching frequently accessed campus admin data
 * in memory with intelligent expiration strategies.
 * 
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private campusAdminCacheService: CampusAdminCacheService) {}
 * 
 * // Get campus admins (with caching)
 * const adminIds = await this.campusAdminCacheService.getCampusAdminIdsForCampus(campusId);
 * 
 * // Invalidate cache when admins change
 * this.campusAdminCacheService.invalidateCampusAdminsCache(campusId.toString());
 * ```
 * 
 * @see {@link InMemHybridCache} - The underlying cache implementation
 * @see {@link UserNS.UserType} - User types supported by this service
 */
@Injectable()
export class CampusAdminCacheService {
  /**
   * Maximum number of campus entries to keep in cache.
   * When exceeded, the oldest entry is evicted (LRU behavior).
   * 
   * @default 100
   * @description Supports up to 100 campuses simultaneously
   */
  private readonly campusAdminsCacheMaxEntries = 100;

  /**
   * Sliding expiration time in milliseconds.
   * Cache entries are evicted if not accessed within this time.
   * Timer is refreshed on each access (sliding window).
   * 
   * @default 10 minutes (600,000 ms)
   * @description Balances performance with data freshness
   */
  private readonly campusAdminsCacheSlidingTTL = 10 * 60 * 1000;

  /**
   * Absolute maximum staleness in milliseconds.
   * Cache entries are evicted after this time regardless of access patterns.
   * This prevents indefinitely stale data.
   * 
   * @default 4 hours (14,400,000 ms)
   * @description Ensures data is refreshed at least every 4 hours
   */
  private readonly campusAdminsCacheAbsoluteTTL = 4 * 60 * 60 * 1000;

  /**
   * In-memory cache for campus admin user IDs.
   * 
   * Cache Configuration:
   * - **Key**: Campus ID as string
   * - **Value**: Array of admin user IDs as strings
   * - **Max Entries**: 100 campuses
   * - **Sliding TTL**: 10 minutes (refreshed on access)
   * - **Absolute TTL**: 4 hours (maximum staleness)
   * 
   * @private
   * @readonly
   */
  private readonly campusAdminsCache = new InMemHybridCache<string, string[]>(
    this.campusAdminsCacheMaxEntries,
    this.campusAdminsCacheSlidingTTL,
    this.campusAdminsCacheAbsoluteTTL,
  );

  /**
   * Creates an instance of CampusAdminCacheService.
   * 
   * @param userModel - Mongoose model for User collection
   */
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  /**
   * Retrieves the user IDs of campus administrators for a given campus.
   * 
   * This method implements a cache-first strategy:
   * 1. **Cache Hit**: Returns cached admin IDs immediately (fastest)
   * 2. **Cache Miss**: Queries database, caches result, then returns
   * 3. **Cache Bypass**: When `useCache=false`, always queries database
   * 
   * **Supported User Types:**
   * - `Campus_Admin`: Regular campus administrators
   * - `Super_Admin`: Super administrators (can access any campus)
   * 
   * **Performance Characteristics:**
   * - Cache hit: ~0.1ms (in-memory access)
   * - Cache miss: ~10-50ms (database query + cache update)
   * - Memory usage: ~1KB per campus (estimated)
   * 
   * @param campusId - The ObjectId of the campus whose admin user IDs are to be retrieved
   * @param useCache - Whether to use the cache (default: true). Set to false for real-time data
   * @returns Promise<string[]> - Array of campus admin user IDs as strings
   * 
   * @example
   * ```typescript
   * // Get campus admins with caching (recommended)
   * const adminIds = await campusAdminCacheService.getCampusAdminIdsForCampus(campusId);
   * 
   * // Get campus admins without caching (real-time data)
   * const adminIds = await campusAdminCacheService.getCampusAdminIdsForCampus(campusId, false);
   * 
   * // Use in authorization check
   * const adminIds = await campusAdminCacheService.getCampusAdminIdsForCampus(campusId);
   * const isAuthorized = adminIds.includes(currentUserId);
   * ```
   * 
   * @throws {Error} When database query fails
   * @since 1.0.0
   */
  async getCampusAdminIdsForCampus(
    campusId: Types.ObjectId,
    useCache: boolean = true,
  ): Promise<string[]> {
    const campusIdString = campusId.toString();
    if (useCache) {
      const cached = this.campusAdminsCache.get(campusIdString);
      if (cached) return cached;
    }
    // Fetch from DB
    const campusAdmins = await this.userModel
      .find({
        campus_id: campusId,
        // user type of either the Campus_Admin and Super_Admin
        user_type: {
          $in: [UserNS.UserType.Campus_Admin, UserNS.UserType.Super_Admin],
        },
      })
      .select('_id');
    const campusAdminIds = campusAdmins.map((a) => a._id.toString());
    if (useCache) {
      this.campusAdminsCache.set(campusIdString, campusAdminIds);
    }
    return campusAdminIds;
  }

  /**
   * Invalidates the campus admin cache for a specific campus.
   * 
   * This method should be called whenever campus administrator data changes to ensure
   * cache consistency. After invalidation, the next request for this campus will
   * fetch fresh data from the database.
   * 
   * **When to call this method:**
   * - A new campus admin is added to a campus
   * - A campus admin is removed from a campus
   * - A user's campus assignment changes
   * - A user's role changes to/from Campus_Admin or Super_Admin
   * - Campus admin permissions are modified
   * 
   * **Performance Impact:**
   * - Operation: ~0.01ms (in-memory deletion)
   * - Next request: Will be a cache miss (database query)
   * - Memory: Immediately frees cached data for the campus
   * 
   * @param campusId - The campus ID as string whose cache should be invalidated
   * 
   * @example
   * ```typescript
   * // After adding a new campus admin
   * await userService.assignCampusAdmin(userId, campusId);
   * campusAdminCacheService.invalidateCampusAdminsCache(campusId.toString());
   * 
   * // After removing a campus admin
   * await userService.removeCampusAdmin(userId, campusId);
   * campusAdminCacheService.invalidateCampusAdminsCache(campusId.toString());
   * 
   * // After role change
   * await userService.updateUserRole(userId, UserType.Campus_Admin);
   * campusAdminCacheService.invalidateCampusAdminsCache(campusId.toString());
   * ```
   * 
   * @since 1.0.0
   */
  public invalidateCampusAdminsCache(campusId: string): void {
    this.campusAdminsCache.delete(campusId);
  }
}
