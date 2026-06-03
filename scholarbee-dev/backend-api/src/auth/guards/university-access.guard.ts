import {
    CanActivate,
    ExecutionContext,
    Injectable,
    BadRequestException,
    ForbiddenException,
    mixin,
    Type,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { stringToObjectId } from 'src/utils/db.utils';

export enum UniversityIdentifier {
    ID = 'id',
    SLUG = 'slug',
}

/**
 * Guard to check if the user has access to the university
 * @param paramName - The name of the parameter to check in the request params
 * @param identifierCallback - The callback to get the identifier type
 * @example
 * Example 1:
 * ```typescript
 * UseGuards(ResourceProtectionGuard, UniversityAccessGuard('some-id-name', (ids) => ids.ID)) // 'some-id-name' should be the same as the parameter name in the request params
 * Get(':some-id-name') // request param
 * async findOne(@Param('some-id-name', ParseObjectIdPipe) id: Types.ObjectId) {
 *   return this.universitiesService.findOne(id);
 * }
 * ```
 * Example 2:
 * ```typescript
 * UseGuards(ResourceProtectionGuard, UniversityAccessGuard('some-slug-param-name', (ids) => ids.SLUG))
 * Get(':some-slug-param-name')
 * async findOneBySlug(@Param('some-slug-param-name', ParseStringPipe) slug: string) {
 *   return this.universitiesService.findOneBySlug(slug);
 * }
 * ```
 * @returns The guard
 */
export const UniversityAccessGuard = (
    paramName: string,
    identifierCallback: (ids: typeof UniversityIdentifier) => UniversityIdentifier,
): Type<CanActivate> => {
    // Execute the callback to get the chosen type (ID or SLUG)
    const identifierType = identifierCallback(UniversityIdentifier);

    @Injectable()
    class UniversityAccessGuardMixin implements CanActivate {
        constructor(
            @InjectModel(User.name)
            private userModel: Model<UserDocument>,
        ) { }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            const targetValue = request.params[paramName];

            if (!user) {
                throw new BadRequestException('User authentication required.');
            }

            if (!targetValue) {
                throw new BadRequestException(`Route parameter "${paramName}" is missing.`);
            }

            //* ----- MINIMAL ADDITION START -----
            // 1. Check if the University actually exists first
            const universityExists = await this.userModel.db.collection(DB_COLLECTIONS.UNIVERSITIES).findOne({
                [identifierType === UniversityIdentifier.ID ? '_id' : 'slug']:
                    identifierType === UniversityIdentifier.ID ? stringToObjectId(targetValue) : targetValue
            }, { projection: { _id: 1 } });

            if (!universityExists) {
                throw new NotFoundException(`University with ${identifierType} "${targetValue}" not found.`);
            }
            //* ----- MINIMAL ADDITION END -----

            // Using aggregation for a deep lookup through the relations
            const result = await this.userModel.aggregate([
                { $match: { _id: stringToObjectId(user._id || user.sub) } },
                {
                    $lookup: {
                        from: DB_COLLECTIONS.CAMPUSES,
                        localField: 'campus_id',
                        foreignField: '_id',
                        as: 'campus',
                    },
                },
                { $unwind: '$campus' },
                {
                    $lookup: {
                        from: DB_COLLECTIONS.UNIVERSITIES,
                        localField: 'campus.university_id',
                        foreignField: '_id',
                        as: 'university',
                    },
                },
                { $unwind: '$university' },
                {
                    $project: {
                        isMatch: {
                            $eq: [
                                identifierType === UniversityIdentifier.ID
                                    ? '$university._id'
                                    : '$university.slug',
                                identifierType === UniversityIdentifier.ID
                                    ? stringToObjectId(targetValue)
                                    : targetValue,
                            ],
                        },
                    },
                },
            ]);

            const isAuthorized = result[0]?.isMatch === true;

            if (!isAuthorized) {
                throw new ForbiddenException(
                    `Access Denied: You are not authorized for university ${targetValue}.`
                );
            }

            return true;
        }
    }

    return mixin(UniversityAccessGuardMixin);
};