// File: src/auth/auth.service.ts

// This file has been temporarily changed to allow login for unverified users. Search for the sections with "TODO: Uncomment when..." to find all the sections that need to be uncommented.

import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';
import {
  AccessTokenPayload,
  AuthenticatedRequest,
  RefreshTokenPayload,
} from 'src/auth/types/auth.interface';
import { ChatService } from 'src/chat/chat.service';
import { MongoTransactionService } from 'src/common/database/mongo-transaction.service';
import { IConfiguration } from 'src/config/configuration';
import { ReferenceSystemService } from 'src/reference-system/services/reference-system.service';
import { User, UserDocument, UserNS } from 'src/users/schemas/user.schema';
import { IAppUserContext, SanitizedUser } from 'src/users/schemas/user.types';
import { UsersService } from '../users/users.service';
import { DebugLogger } from '../utils/debug-logger';
import { HashingUtils } from '../utils/hashing.utils';
import { EmailService } from 'src/email/email.service';
import { SignupDto } from './dto/signup.dto';
import { DiscoveryInfoDto } from 'src/reference-system/dto/discovery-info.dto';
import { BetterOmit } from 'src/utils/typescript.utils';


/**
 * Referral is REQUIRED: failure should abort signup and rollback user creation. The signupDto ensures that the discovery info is an invitation discovery.
 * Type guard to check if the discovery info is an invitation discovery
 * @param info - The discovery info
 * @returns True if the discovery info is an invitation discovery, false otherwise
 */
function isInvitationDiscovery(
  info?: DiscoveryInfoDto
): info is DiscoveryInfoDto & { discovery_mode: UserNS.DiscoveryMode.Invitation; invitation_code: string } {
  return (
    !!info &&
    info.discovery_mode === UserNS.DiscoveryMode.Invitation &&
    typeof info.invitation_code === 'string' &&
    info.invitation_code.length > 0
  );
}

// add test comment
@Injectable()
export class AuthService {
  private static requestCounter = 0;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private readonly referenceSystemService: ReferenceSystemService,
    private readonly mongoTransactionService: MongoTransactionService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService<IConfiguration>,
    private readonly emailService: EmailService,
  ) {
    DebugLogger.initialize();
  }

  /**
   * Verify the auth access token for the logged in user.
   * Used to authenticate the user in the websocket connections
   */
  async verifyAuthToken(token: unknown): Promise<AccessTokenPayload> {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('No token provided');
    }

    const decoded = this.jwtService.verify<AccessTokenPayload>(token, {
      secret: this.configService.get('jwt.loginSecret', { infer: true }),
    });
    // AccessTokenPayload uses string types for ObjectId-like fields.
    // Return decoded payload as-is; ObjectId conversion (if needed) is handled in strategies.
    return decoded;
  }

  /**
   * Validate user when signing in. Returns the sanitized user object (after removing sensitive information)
   */
  async validateUser(loginDto: LoginDto): Promise<SanitizedUser> {
    // Check if user exists
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    // Reject login for non-local users
    if (user.authProvider && user.authProvider !== UserNS.AuthProvider.Local) {
      throw new UnauthorizedException('Use social login for this account');
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(loginDto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Uncomment when it is decided to verify email after signup
    // // Check if email is verified
    // if (!user._verified) {
    //   throw new UnauthorizedException('Account verification pending');
    // }

    const sanitizedUser = await this.usersService.sanitizeUser(user);
    return sanitizedUser;
  }

  async validateGoogleUser(payload: {
    googleId: string;
    email?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }): Promise<SanitizedUser> {
    if (!payload.googleId) {
      throw new UnauthorizedException('Invalid Google profile');
    }

    // Prefer lookup by googleId; fallback to email linking rules later if needed
    const byGoogleId = await this.usersService.findByGoogleId(payload.googleId);
    if (byGoogleId) {
      return this.usersService.sanitizeUser(byGoogleId);
    }

    if (!payload.email) {
      throw new UnauthorizedException('Email is required from Google');
    }

    // If the google-email is already registered with a local account, throw an error; (Do not auto-link)
    const existingByEmail = await this.usersService.findByEmail(payload.email);
    if (existingByEmail) {
      throw new ConflictException(
        'Email already registered. Please login with your existing method.',
      );
    }

    // Create new OAuth user
    const newUser = await this.usersService.createOAuthUser({
      email: payload.email,
      fullName: payload.fullName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      profileImageUrl: payload.profileImageUrl,
      provider: UserNS.AuthProvider.Google,
      providerId: payload.googleId,
      userType: UserNS.UserType.Student,
    });

    // Create support conversation (and welcome message) for new student users
    const sanitizedNewUser = await this.usersService.sanitizeUser(newUser);
    await this.chatService.createSupportConversationForUser(sanitizedNewUser/* , { session } */)

    return sanitizedNewUser;
  }

  /**
   * Tokenize the received user object and create a JWT token based on JWT standard
   * The user object should already contain all necessary fields including computed ones
   * (is_primary_campus_admin, university_id) from getAppUserContext()
   */
  async generateAuthTokens(user: IAppUserContext) {
    const { campus_id, university_id, ...restUser } = user;
    const accessTokenPayload: AccessTokenPayload = {
      sub: user._id,
      userId: user._id,
      ...restUser,
      // If present, convert ObjectId-like fields to strings for JWT payload
      ...(campus_id && { campus_id: campus_id.toString() }),
      ...(university_id && { university_id: university_id.toString() }),
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user._id,
      sub: user._id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get('jwt.loginSecret', { infer: true }),
        expiresIn: `${this.configService.get('jwt.loginExpiration', { infer: true })}s`,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get('jwt.refreshSecret', { infer: true }),
        expiresIn: `${this.configService.get('jwt.refreshExpiration', { infer: true })}s`,
      }),
    ]);

    // Create JWT token
    return {
      accessToken,
      refreshToken,
      accessTokenPayload,
      refreshTokenPayload,
    };
  }

  async validateRefreshToken(
    userId: string,
    token: string,
  ): Promise<UserDocument> {
    AuthService.requestCounter++;
    const requestNumber = AuthService.requestCounter;

    console.log('🔐 AuthService.validateRefreshToken called:', {
      userId,
      hasToken: !!token,
      tokenLength: token?.length,
      timestamp: new Date().toISOString(),
    });

    DebugLogger.log(
      `🔐 REQUEST #${requestNumber} - AuthService.validateRefreshToken called`,
      {
        userId,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 50) + '...',
        tokenEnd: '...' + token?.substring(token.length - 20),
      },
    );

    const user = await this.usersService.findById(userId);
    console.log('👤 User lookup result:', {
      userFound: !!user,
      userId: user?._id,
      hasRefreshTokenHash: !!user?.refreshTokenHash,
      isVerified: user?._verified,
      storedHashStart: user?.refreshTokenHash?.substring(0, 20) + '...',
      storedHashEnd:
        '...' +
        user?.refreshTokenHash?.substring(user?.refreshTokenHash?.length - 20),
    });

    if (!user || !user.refreshTokenHash) {
      console.log('❌ User not found or no refresh token hash');
      throw new UnauthorizedException('Invalid refresh token');
    }

    // TODO: Uncomment when it is decided to verify email after signup
    //  // Check if email is verified
    //  if (!user._verified) {
    //   console.log('❌ User email not verified');
    //   throw new UnauthorizedException('Account verification pending');
    // }

    // Compare the hash of the refresh token
    console.log('🔍 Verifying refresh token hash...');

    // Log the incoming token hash for comparison
    const incomingTokenHash = HashingUtils.hashToken(token);
    console.log('🔍 Token hash comparison:', {
      incomingTokenHashStart: incomingTokenHash.substring(0, 20) + '...',
      incomingTokenHashEnd:
        '...' + incomingTokenHash.substring(incomingTokenHash.length - 20),
      storedHashStart: user.refreshTokenHash.substring(0, 20) + '...',
      storedHashEnd:
        '...' +
        user.refreshTokenHash.substring(user.refreshTokenHash.length - 20),
      hashesMatch: incomingTokenHash === user.refreshTokenHash,
    });

    DebugLogger.logTokenComparison(
      requestNumber,
      token,
      incomingTokenHash,
      user.refreshTokenHash,
    );

    const isRefreshTokenMatch = HashingUtils.verifyToken({
      token,
      hash: user.refreshTokenHash,
    });

    console.log('🔍 Token verification result:', {
      isMatch: isRefreshTokenMatch,
      timestamp: new Date().toISOString(),
    });

    if (!isRefreshTokenMatch) {
      console.log('❌ Refresh token hash mismatch');
      throw new UnauthorizedException('Invalid refresh token');
    }

    console.log('✅ Refresh token validation successful');
    return user;
  }

  /**
   * Receives the validated user and transforms it into a token
   */
  async login(user: SanitizedUser, requireAdminValidation: boolean = false) {
    // Check if admin validation is required and if this is an admin host
    if (requireAdminValidation) {
        const isAdminUserType =
          user.user_type === UserNS.UserType.Super_Admin ||
          user.user_type === UserNS.UserType.Campus_Admin;
        const hasValidCampusId = !!user.campus_id;

        const isValidAdminUser = user.user_type === UserNS.UserType.Super_Admin || (isAdminUserType && hasValidCampusId);

      // Validate that user is an admin type with a valid campus_id for admin portal access
      // Te user must be an admin (Super_Admin or Campus_Admin) AND have a valid campus_id
      // Super_Admin can access admin portal without campus_id requirement
      if (!isValidAdminUser) {
        console.log(
          '❌ Access denied! User must be an admin (Super_Admin or Campus_Admin) with a valid campus_id',
        );
        // Only admin users associated with a valid campus (or Super_Admin) can access the admin portal.
        throw new UnauthorizedException('Access denied!');
      }
    }

    const appUserContext = await this.usersService.getAppUserContext(user);

    // Tokenize user
    const { accessToken, refreshToken, } =
      await this.generateAuthTokens(appUserContext);

    // hash and save refresh token
    // const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTokenHash = await HashingUtils.hashToken(refreshToken); // REVIEW: Is it correct to send the actual token to user and store the hash in the database?

    console.log('💾 Updating refresh token hash in database (login):', {
      userId: user._id,
      newHashStart: refreshTokenHash.substring(0, 20) + '...',
      newHashEnd:
        '...' + refreshTokenHash.substring(refreshTokenHash.length - 20),
      timestamp: new Date().toISOString(),
    });

    DebugLogger.log('💾 LOGIN - Updating refresh token hash in database', {
      userId: user._id,
      newHashStart: refreshTokenHash.substring(0, 20) + '...',
      newHashEnd:
        '...' + refreshTokenHash.substring(refreshTokenHash.length - 20),
      fullToken: refreshToken,
    });

    await this.usersService.update(user._id.toString(), { refreshTokenHash });

    console.log('✅ Refresh token hash updated in database (login)');
    DebugLogger.log('✅ LOGIN - Refresh token hash updated in database');

    return {
      user: appUserContext,
      accessToken,
      refreshToken,
    };
  }

  async logout(user: AuthenticatedRequest['user']) {
    // Revoke the refresh token
    await this.usersService.update(user._id, { refreshTokenHash: null });
    return { message: 'Successfully signed out' };
  }

  async refreshAuthTokens(user: UserDocument) {
    const sanitizedUser = await this.usersService.sanitizeUser(user);
    const appUserContext = await this.usersService.getAppUserContext(sanitizedUser);

    const { accessToken, refreshToken } =
      await this.generateAuthTokens(appUserContext);

    // BUG: Using bcrypt was giving unexpected results
    const refreshTokenHash = HashingUtils.hashToken(refreshToken);

    console.log('💾 Updating refresh token hash in database:', {
      userId: sanitizedUser._id,
      newHashStart: refreshTokenHash.substring(0, 20) + '...',
      newHashEnd:
        '...' + refreshTokenHash.substring(refreshTokenHash.length - 20),
      timestamp: new Date().toISOString(),
    });

    DebugLogger.log('💾 REFRESH - Updating refresh token hash in database', {
      userId: sanitizedUser._id,
      newHashStart: refreshTokenHash.substring(0, 20) + '...',
      newHashEnd:
        '...' + refreshTokenHash.substring(refreshTokenHash.length - 20),
      fullToken: refreshToken,
    });

    await this.usersService.update(sanitizedUser._id, {
      refreshTokenHash,
    });

    console.log('✅ Refresh token hash updated in database');
    DebugLogger.log('✅ REFRESH - Refresh token hash updated in database');

    return {
      user: appUserContext,
      accessToken,
      refreshToken,
    };
  }

  /**
   * @deprecated Frontend should construct the reset password URL from the token itself
   * Generate a reset password URL for the user
   * @param token - The reset password token
   * @returns The reset password URL
   */
  private async generateResetPasswordUrl(token: string) {
    const resetUrl = `${this.configService.get('frontend.url', { infer: true })}/reset-password?token=${token}`;
    return resetUrl;
  }

  private async hashAndSaveResetPasswordToken({
    userId,
    resetPasswordTokenHash,
    resetPasswordExpiration,
  }: {
    userId: string;
    resetPasswordTokenHash: string;
    resetPasswordExpiration: Date;
  }) {
    await this.usersService.update(userId, {
      resetPasswordToken: resetPasswordTokenHash, // TODO: Rename to resetPasswordTokenHash
      resetPasswordExpiration,
    });
  }

  private async sendResetPasswordEmail(user: User, resetUrl: string) {
    try {
      await this.emailService.send({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
                      <h1>Password Reset</h1>
                      <p>You requested a password reset. Please click the link below to reset your password:</p>
                      <a href="${resetUrl}" target="_blank">Reset Password</a>
                      <p>This link will expire in ${this.configService.get('tokens.passwordResetExpirationMinutes', { infer: true })} minutes.</p>
                      <p>If you didn't request this, please ignore this email.</p>
                  `,
      });
    } catch (error) {
      throw new Error(`Failed to send reset password email: ${error?.message}`);
    }
  }

  /**
   * Handles the user signup process. 
   * 1. Prepare user data
   * 2. Ensure the user does not already exist
   * 3. Create the user
   * 4. Handle referral
   * 5. Create support conversation
   * 6. Send verification email
   */
  async handleUserSignup(signupDto: SignupDto) {

    // Core DB writes that must be atomic (rollback together) – now using MongoTransactionService
    const newUser = await this.mongoTransactionService.runInTransaction(
      async (session) => {
        const userData = await this.usersService.prepareUserCreationData(signupDto);

        // Ensure the user does not already exist
        const existingUser = await this.usersService.findByEmail(userData.email);

        if (existingUser) throw new ConflictException('User already exists.');

        // Referral validation now relies on the transactional flow inside handleReferralOnSignup.

        // Create the user inside the transaction
        const created = await this.usersService.create(userData, { session });


        if (isInvitationDiscovery(signupDto.discovery_info)) {
          await this.referenceSystemService.handleReferralOnSignup(
            created.user._id,
            signupDto.discovery_info.invitation_code,
            session,
          );
        }


        return created;
      }, {}, true
    );

    // Post-commit best-effort side effects (do not rollback signup)
    const [
      _supportConversation,
      _verificationEmail,
      { appUserContext, accessToken, refreshToken }
    ] = await Promise.all([
      this.chatService.createSupportConversationForUser(newUser.user).catch((error) => {
        console.error('Failed to create support conversation for user:', error);
      }),
      this.usersService.sendVerificationForCreatedUser(newUser.user._id).catch((error) => {
        console.error('Failed to send verification email for user:', error);
      }),
      // Issue tokens immediately so the caller is authenticated without a separate login step
      this.usersService.getAppUserContext(newUser.user).then(async (appUserContext) => {
        const { accessToken, refreshToken } = await this.generateAuthTokens(appUserContext);
        const refreshTokenHash = await HashingUtils.hashToken(refreshToken);
        await this.usersService.update(newUser.user._id.toString(), { refreshTokenHash });
        return { appUserContext, accessToken, refreshToken };
      }),
    ])

    return {
      message: newUser.message,
      user: appUserContext,
      accessToken,
      refreshToken,
    };
  }


  /**
   * Send a password reset email to the user
   * @param email - The user's email address
   * @returns Success response with appropriate message
   */
  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.authProvider && user.authProvider !== UserNS.AuthProvider.Local) {
      throw new BadRequestException(
        'Password reset is not available for social login accounts.',
      );
    }

    // Generate reset token and expiration
    const { token: resetPasswordToken, expiration: resetPasswordExpiration } =
      HashingUtils.generateRandomTokenWithExpiration({
        bytes: 32,
        expirationMinutes: this.configService.get(
          'tokens.passwordResetExpirationMinutes',
          { infer: true },
        ),
      });
    const resetPasswordTokenHash = HashingUtils.hashToken(resetPasswordToken);

    // Create reset password URL
    const resetPasswordUrl =
      await this.generateResetPasswordUrl(resetPasswordToken);

    // Send email
    await this.sendResetPasswordEmail(user, resetPasswordUrl);

    // Update user with reset token and expiration
    await this.hashAndSaveResetPasswordToken({
      userId: user._id.toString(),
      resetPasswordTokenHash,
      resetPasswordExpiration,
    });

    return { success: true, message: 'Password reset email sent successfully' };
  }

  /**
   * Supposed to be used in continuation of the forgot password flow.
   * The password is hashed and saved to the database. if the token matches the one sent by the forgot-password service.
   * ? Additionally, since user verifies the token in the email, the email verification can also be handled here if user is not verified.
   * @param resetPasswordToken 
   * @param newPassword 
   * @returns 
   */
  async resetPassword(resetPasswordToken: string, newPassword: string) {
    // Hash the token to compare with stored token
    const resetPasswordTokenHash = HashingUtils.hashToken(resetPasswordToken);

    // Find user with this token and valid expiration
    const user = await this.usersService.findByResetPasswordTokenHash(
      resetPasswordTokenHash,
      new Date(),
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Hash new password using BCrypt (secure for passwords)
    const { hash, salt } = await HashingUtils.hashPassword({
      password: newPassword,
    });

    // Update user with new password and clear reset token
    await this.usersService.update(user._id.toString(), {
      // Password fields
      hash,
      salt,
      resetPasswordToken: null,
      resetPasswordExpiration: null,
      // Additional fields to handle email verification
      _verified: true,
      verifyToken: '',
      verifyTokenExpiration: null,
    });

    return { success: true, message: 'Password reset successful' };
  }

  /**
   * Validate the reset password token
   * @param resetToken - The reset password token
   * @returns The validation result
   */
  async validateResetPasswordToken(resetToken: string) {
    // Hash the token to compare with stored token
    const resetTokenHash = HashingUtils.hashToken(resetToken);

    // Find user with this token and valid expiration
    const user = await this.usersService.findByResetPasswordTokenHash(
      resetTokenHash,
      new Date(),
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { success: true, message: 'Token is valid' };
  }

  /**
   * Verify the email of the user after signup when user clicks on the link in the email
   * @param signupVerificatinToken - The verification token
   * @returns The verification result
   */
  async verifyEmail(signupVerificatinToken: string) {
    // Hash the incoming token to compare with stored hash
    const signupVerificatinTokenHash = HashingUtils.hashToken(
      signupVerificatinToken,
    );
    try {

      const user = await this.usersService.findByEmailVerificationTokenHashOrFail(
        signupVerificatinTokenHash,
        new Date(),
      );


      // Update user as verified
      await this.usersService.update(user._id.toString(), {
        _verified: true,
        verifyToken: '',
        verifyTokenExpiration: null,
      });

      return { success: true, message: 'Email verified successfully. Please return to the application page and refresh the screen to continue.' };
    } catch (error) {
      console.error('Error verifying email:', error);
      // Preserve specific HTTP errors thrown by UsersService so the caller can
      // distinguish invalid vs expired vs already-verified vs server issues.
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Failed to verify email',
      );
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    // Disallow change password for non-local accounts
    if (user.authProvider && user.authProvider !== UserNS.AuthProvider.Local) {
      throw new BadRequestException(
        'Password change is not available for social login accounts.',
      );
    }

    // Verify current password using the schema method
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    // Hash new password using BCrypt (secure for passwords)
    const { hash, salt } = await HashingUtils.hashPassword({
      password: newPassword,
    });

    // Update user with new password
    await this.usersService.update(user._id.toString(), {
      hash,
      salt,
    });

    return { success: true, message: 'Password changed successfully' };
  }
}
