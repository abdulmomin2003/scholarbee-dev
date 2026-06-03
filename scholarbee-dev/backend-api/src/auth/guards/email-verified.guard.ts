import {
    CanActivate,
    ExecutionContext,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

/**
 * This guard ensures that the authenticated user has a verified email address.
 * It should be used after ResourceProtectionGuard to ensure the user is authenticated.
 * 
 * Checks the _verified field from the database in real-time to ensure the user's
 * verification status is current, even if they verified their email after login.
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new BadRequestException(
                'User not authenticated. Please ensure ResourceProtectionGuard is applied before EmailVerifiedGuard.',
            );
        }

        // Fetch real-time verification status from database
        const dbUser = await this.userModel
            .findById(user._id || user.sub)
            .select('_verified')
            .lean()
            .exec();

        if (!dbUser) {
            throw new BadRequestException('User not found');
        }

        if (dbUser._verified !== true) {
            throw new BadRequestException(
                'Please verify your email address before proceeding. Check your inbox for the verification link.',
            );
        }

        return true;
    }
}
