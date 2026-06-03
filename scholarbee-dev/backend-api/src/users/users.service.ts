import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, Model, Types, UpdateQuery } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { CampusDocument } from 'src/campuses/schemas/campus.schema';
import { ChatService } from 'src/chat/chat.service';
import { CampusAdminCacheService } from 'src/common/services/campus-admin-cache.service';
import { localDateRangeToUtc } from 'src/common/transformers/timezone-date.transformer';
import { IConfiguration } from 'src/config/configuration';
import { CreateEducationalBackgroundDto } from 'src/users/dto/create-educational-bg.dto';
import { CreateNationalIdCardDto } from 'src/users/dto/create-nic.dto';
import { UpdateEducationalBackgroundDto } from 'src/users/dto/update-educational-bg.dto';
import { UpdateNationalIdCardDto } from 'src/users/dto/update-nic.dto';
import { HashingUtils } from 'src/utils/hashing.utils';
import { LegalDocumentRequirementsService } from '../legal-document-requirements/legal-document-requirements.service';
import { LegalActionType } from '../legal-document-requirements/schemas/legal-document-requirement.schema';
import { LegalDocumentsService } from '../legal-documents/legal-documents.service';
import { LegalDocumentStatus } from '../legal-documents/schemas/legal-document.schema';
import { EmailService } from 'src/email/email.service';
import { GoogleOAuthSignupUserDocPayload, User, UserDocument, UserNS } from './schemas/user.schema';
import { IAppUserContext, SanitizedUser } from './schemas/user.types';
import { BetterOmit } from 'src/utils/typescript.utils';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // Ref to auth service (forward ref)
    // @Inject(forwardRef(() => AuthService))
    private readonly campusAdminCacheService: CampusAdminCacheService,
    private readonly legalDocumentRequirementsService: LegalDocumentRequirementsService,
    private readonly legalDocumentsService: LegalDocumentsService,
    private readonly configService: ConfigService<IConfiguration>,
    private readonly chatService: ChatService,
    private readonly emailService: EmailService,
  ) { }

  async sanitizeUser(
    user: UserDocument /* | Document<Types.ObjectId, {}, UserDocument> */,
  ): Promise<SanitizedUser> {
    const plainUser = user instanceof Document ? user.toObject() : user;

    // copy the user into a sanitized user variable
    const sanitizedUser = Object.assign({}, plainUser, {
      _id: user._id.toString(),
    });
    // delete the password and salt from the sanitized user
    delete sanitizedUser?.password;
    delete sanitizedUser?.salt;
    delete sanitizedUser?.hash;

    return sanitizedUser;

  }

  /**
   * Generate the next student_id for a new student.
   *
   * This loads the latest 10 student users by created_at and chooses the
   * highest valid student_id from that set. The next ID is the maximum
   * sequence found plus one.
   *
   * Format: SB_000001, SB_000002, ...
   */
  async getNextStudentId(): Promise<string> {
    const recentStudents = await this.userModel
      .find({ user_type: UserNS.UserType.Student })
      .sort({ created_at: -1 })
      .limit(10)
      .select('student_id')
      .lean<{ student_id?: string }[]>()
      .exec();

    let currentMaxStudentIdNumber = 0;
    const studentIdPattern = /^SB_(\d+)$/;

    // Loop through all student ids, parse all ids to numbers and find the highest number (student id number)
    // TODO: Add a utils class/methods to parse student ids to numbers, formatted numbers and vice versa
    for (const student of recentStudents) {
      if (!student?.student_id) {
        continue;
      }

      const regexResult = student.student_id.match(studentIdPattern);
      if (!regexResult) {
        continue;
      }
      const matchStudentId = regexResult.at(1);
      if (!matchStudentId) {
        continue;
      }
      const studentIdNumber = parseInt(matchStudentId);

      if (!Number.isNaN(studentIdNumber) && studentIdNumber > currentMaxStudentIdNumber) {
        currentMaxStudentIdNumber = studentIdNumber;
      }
    }

    // Get the max allowed digits for the student id
    const maxAllowedDigitsForStudentId = this.configService.get('application.user.maxAllowedDigitsForUserStudentId', { infer: true });

    // Get the next student id number
    const nextStudentIdNumber = currentMaxStudentIdNumber + 1;
    // Format the next student id number to the max allowed digits
    const nextStudentIdNumberFormatted = nextStudentIdNumber.toString().padStart(maxAllowedDigitsForStudentId, '0');
    // Create the next student id
    const nextStudentId = `SB_${nextStudentIdNumberFormatted}`;

    return nextStudentId;
  }

  /**
   * Picks only the fields that are needed for the app user context from a sanitized user
   * This is used to create the access token payload
   * @param user - The sanitized user
   * @returns The app user context
   */
  async getAppUserContext(user: SanitizedUser): Promise<IAppUserContext> {

    const {
      full_name,
      first_name,
      last_name,
      email,
      _id,
      user_type,
      campus_id,
      profile_image_url,
      special_person,
      current_stage,
      nationality,
      user_profile_id,
      phone_number,
      created_at,
      _verified,
    } = user;

    let appSpecificUserInfo: IAppUserContext = {
      full_name,
      first_name,
      last_name,
      email,
      _id,
      user_type,
      created_at,
      _verified,

      // required fields
      campus_id,
      profile_image_url,
      special_person,
      current_stage,
      nationality,
      user_profile_id,
      phone_number,
    }

    if (user.user_type === UserNS.UserType.Campus_Admin) {
      const { isPrimaryCampusAdmin, universityId } = await this.getUserCampusInfo(user._id);
      appSpecificUserInfo.is_primary_campus_admin = isPrimaryCampusAdmin;
      appSpecificUserInfo.university_id = universityId;
    }

    return appSpecificUserInfo;
  }


  /**
   * Validates that the user is a campus admin and belongs to a valid campus with a university
   * Get the user, campus and university for a given user ID
   * @param userId - The user ID
   * @returns The user, campus and university
   * @throws BadRequestException if the user is not found
   * @throws ForbiddenException if the user is not a campus admin
   * @throws BadRequestException if the campus admin does not belong to a valid campus
   * @throws BadRequestException if the campus admin does not belong to a valid campus with a university
   */
  async getUserCampusInfo(userId: string) {
    const user = await this.userModel.findById(userId).populate<{ campus_id: CampusDocument }>('campus_id').exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.user_type !== UserNS.UserType.Campus_Admin) {
      throw new ForbiddenException('Only campus admins can access this endpoint');
    }

    if (!user.campus_id) {
      throw new BadRequestException('Campus admin must belong to a valid campus');
    }

    if (!user.campus_id.university_id) {
      throw new BadRequestException('Campus admin must belong to a valid campus with a university');
    }

    return {
      isPrimaryCampusAdmin: user.campus_id.is_primary,
      campus: user.campus_id,
      universityId: user.campus_id.university_id,
      campusId: user.campus_id._id,
    };
  }


  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId }).exec();
  }

  async createOAuthUser(params: {
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    provider: UserNS.AuthProvider;
    providerId?: string;
    userType?: UserNS.UserType;
  }) {
    const {
      email,
      fullName,
      firstName,
      lastName,
      profileImageUrl,
      provider,
      providerId,
      userType,
    } = params;

    // Resolve full_name: prefer explicit full_name, fall back to first_name + last_name for backward compatibility (This is just a defensive fallback mechanism which is mostly not needed as the full_name is available in the Google OAuth profile as displayName field)
    const resolvedFullName = fullName?.trim() ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      email.split('@')[0]?.trim() ||
      'Unknown';

    const resolvedUserType = userType ?? UserNS.UserType.Student;

    let student_id: string | undefined;
    if (resolvedUserType === UserNS.UserType.Student) {
      student_id = await this.getNextStudentId();
    }

    const createDoc: GoogleOAuthSignupUserDocPayload = {
      email,
      full_name: resolvedFullName,
      first_name: firstName || '',
      last_name: lastName || '',
      profile_image_url: profileImageUrl,
      user_type: resolvedUserType,
      student_id,
      authProvider: provider,
      _verified: true,
      created_at: new Date(),
      verifyToken: '',
      // TODO: Handle the providerId dynamically based on the provider
      googleId: providerId,
    };

    const newUser = await this.userModel.create(createDoc);
    return newUser;
  }

  /**
   * Get user registration associated legal documents
   * This method checks the legal document requirements for user registration
   * and returns the actual legal documents required for the user registration
   */
  async getUserRegistrationLegalDocuments() {
    // Get the requirements for student program application action type
    const legalDocumentRequirementDoc =
      await this.legalDocumentRequirementsService.findByActionType(
        LegalActionType.USER_REGISTRATION,
      );

    if (!legalDocumentRequirementDoc) return [];

    const allRequiredDocumentTypes =
      legalDocumentRequirementDoc.required_document_types;

    // Find all the legal documents against the required document types that are active
    const associatedLegalDocuments = await this.legalDocumentsService.findAll({
      document_types: allRequiredDocumentTypes,
      status: LegalDocumentStatus.ACTIVE,
    });

    if (!associatedLegalDocuments.length) {
      return [];
    }

    return associatedLegalDocuments;
  }

  /**
   * @deprecated This method is no longer used in favor of easier signup flow for the student. The reason for keeping the code is to use it in the future if needed.
   * @todo if this is to be used in the future, then it should be employed in the Guard/DTO level validation instead of in the service methods.
   * Validates that the user has accepted all required legal documents for registration and returns the filtered list
   * of accepted documents that match the requirements.
   *
   * @param acceptedLegalDocuments Array of accepted legal document IDs
   * @returns Filtered array of accepted legal document IDs that match requirements
   * @throws BadRequestException if any required document is not accepted
   */
  async validateAndFilterAcceptedLegalDocumentsForRegistration(
    acceptedLegalDocuments: Types.ObjectId[] = [],
  ): Promise<Types.ObjectId[]> {
    // Get required documents
    const requiredDocuments = await this.getUserRegistrationLegalDocuments();

    if (!requiredDocuments.length) return [];

    // If no accepted legal documents, then throw error (no documents accepted)
    if (!acceptedLegalDocuments?.length) {
      throw new BadRequestException('No legal documents accepted');
    }

    const requiredLegalDocumentIds = requiredDocuments.map((doc) =>
      doc._id.toString(),
    );

    // Create Sets for O(1) lookups
    const requiredDocSet = new Set(requiredLegalDocumentIds);
    const acceptedDocSet = new Set(
      acceptedLegalDocuments.map((doc) => doc.toString()),
    );

    // Find any missing required documents
    const isMissingReqDocs = requiredLegalDocumentIds.some((reqDocId) => {
      const isAccepted = acceptedDocSet.has(reqDocId);
      return !isAccepted;
    });

    if (isMissingReqDocs) {
      throw new BadRequestException(
        `Missing acceptance for required legal documents`,
      );
    }

    // Filter accepted documents to only include required ones (Ignore the accepted documents that are not required)
    return acceptedLegalDocuments.filter((acceptedDocId) =>
      requiredDocSet.has(acceptedDocId.toString()),
    );
  }

  async createSupportConversationForStudentUser(
    user: SanitizedUser,
    session?: ClientSession,
  ) {
    if (user.user_type !== UserNS.UserType.Student || !user?._id) {
      return;
    }


    await this.chatService.createSupportConversationForUser(user, { session });

  }

  async prepareUserCreationData(createUserDto: SignupDto) {
    // TODO: If a user is unverified, then update the signup_info and resend the verification email (basically dismiss the existing user and create a new one)
    const {
      email,
      password,
      full_name,
      first_name,
      last_name,
      phone_number,
      user_type,
      discovery_info,
    } = createUserDto;

    // Resolve full_name: prefer explicit full_name, fall back to first_name + last_name for backward compatibility
    const resolvedFullName = full_name?.trim() || [first_name, last_name].filter(Boolean).join(' ').trim();
    if (!resolvedFullName) {
      throw new BadRequestException('full_name (or first_name / last_name) is required.');
    }

    let student_id: string | undefined;
    if (user_type === UserNS.UserType.Student) {
      student_id = await this.getNextStudentId();
    }

    // TODO: Start Transaction

    // If no existing user, create a new user
    // Hash the password using bcrypt (same as PayloadCMS)
    const { hash, salt } = await HashingUtils.hashPassword({ password });

    // Prepare user data
    // TODO: Create a reusable SignupUserPayload interface for the user data that is used to create a new user;
    // TODO: Also Create a reusable GoogleOAuthSignupUserPayload interface for the user data that is used to create a new user from Google OAuth;
    const userData: BetterOmit<
      User,
      'refreshTokenHash' | 'isProfileCompleted' | 'comparePassword'
    > = {
      email,
      hash, // Store the bcrypt hash
      salt, // TODO: Optonally remove it. PayloadCMS doesn't use a separate salt field with bcrypt
      full_name: resolvedFullName,
      phone_number,
      user_type,
      student_id,
      verifyToken: '', // Will be set by generateAndSendVerificationEmail
      verifyTokenExpiration: undefined, // Will be set by generateAndSendVerificationEmail
      _verified: false,
      created_at: new Date(),
      discovery_mode: discovery_info?.discovery_mode,
    };

    return userData;

  }

  /**
   * Creates a new user in the database.
   * @param userData - The user data to create (expected to be a NEW USER DOCUMENT)
   * @param options - The options for the create operation
   * @returns The created user
   * @throws ConflictException if a user with this email already exists
   * @throws Error if the user creation fails
   */
  async create(
    userData: Partial<User>,
    options?: { session?: ClientSession },
  ) {
    // Create new user with the hashed password
    const createdUser = await (async () => {
      // NOTE: `Model.create(doc)` doesn't accept session reliably across mongoose versions;
      // use the array-form when we need a session.
      if (options?.session) {
        const [doc] = await this.userModel.create([userData], {
          session: options.session,
        });
        return doc;
      }

      return this.userModel.create(userData);
    })().catch((error) => {
      // Check for MongoDB duplicate key error code
      if (error.code === 11000) {
        throw new ConflictException('User already exists.');
      }

      // Throw standard error if it is something else
      throw error;
    });

    // Sanitize the created user
    const sanitizedUser = await this.sanitizeUser(createdUser);

    return {
      message: 'User created successfully.',
      user: sanitizedUser,
    };
  }


  async sendVerificationForCreatedUser(userId: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found for verification');
    }

    if (user._verified) {
      return;
    }

    await this.generateAndSendVerificationEmail(user);
  }

  async findAll(query: any = {}): Promise<{
    docs: User[];
    totalDocs: number;
    page: number;
    totalPages: number;
  }> {
    const take = query.limit || 10;
    const skip = (query.page - 1) * take || 0;
    const page = query.page || 1;

    // Build filter conditions
    let filter: any = {};

    if (query.user_type) {
      filter.user_type = query.user_type;
    }

    if (query.search) {
      filter.$or = [
        { first_name: { $regex: query.search, $options: 'i' } },
        { last_name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const totalDocs = await this.userModel.countDocuments(filter);
    const docs = await this.userModel
      .find(filter)
      .select('-password -salt')
      .skip(skip)
      .limit(take)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalDocs / take);

    return {
      docs,
      totalDocs,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updated_user_doc: UpdateQuery<User>,
  ): Promise<User> {
    // Fetch current user to compare changes and persist updates via document save.
    // This avoids nested single-subdocument update inconsistencies seen with findByIdAndUpdate.
    const oldUser = await this.userModel.findById(id);
    if (!oldUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatePayload: Record<string, any> = { ...(updated_user_doc ?? {}) };
    const incomingOnboardingPreferences = updatePayload.onboarding_preferences;

    if (incomingOnboardingPreferences !== undefined) {
      const normalizedOnboardingPreferences =
        this.normalizeOnboardingPreferences({
          existing: oldUser?.onboarding_preferences,
          incoming: incomingOnboardingPreferences,
        });

      updatePayload.onboarding_preferences = normalizedOnboardingPreferences;
    }

    const updatedUser = await (async () => {
      try {
        oldUser.set(updatePayload);
        const savedUser = await oldUser.save();
        return savedUser;
      } catch (error) {
        if (error?.name === 'ValidationError') {
          throw new BadRequestException(error.message);
        }
        throw error;
      }
    })();

    // Campus admin cache invalidation logic
    const oldCampusId = oldUser?.campus_id?.toString();
    const newCampusId = updatedUser?.campus_id?.toString();

    // if the campus_id changed, it means either admin status changed or campus_id changed
    // so we need to invalidate the cache for both old and new campus_id, but only if the campus_id is valid and non-empty
    if (oldCampusId !== newCampusId) {
      if (oldCampusId)
        this.campusAdminCacheService.invalidateCampusAdminsCache(oldCampusId);
      if (newCampusId)
        this.campusAdminCacheService.invalidateCampusAdminsCache(newCampusId);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    // Fetch the user before deletion
    const user = await this.userModel.findById(id);
    const result = await this.userModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Invalidate campus admin cache if the deleted user was a campus admin
    if (user?.user_type === UserNS.UserType.Campus_Admin && user?.campus_id) {
      this.campusAdminCacheService.invalidateCampusAdminsCache(
        user.campus_id.toString(),
      );
    }
  }

  async addEducationalBackground(
    userId: string,
    payload: CreateEducationalBackgroundDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (
      !payload.marks_gpa.total_marks_gpa ||
      !payload.marks_gpa.obtained_marks_gpa
    ) {
      throw new BadRequestException(
        'total_marks_gpa and obtained_marks_gpa are required in marks_gpa',
      );
    }

    if (!user.educational_backgrounds) {
      user.educational_backgrounds = [];
    }

    const educationalBackgroundDoc = {
      _id: new Types.ObjectId(),
      ...payload,
    };

    user.educational_backgrounds.push(educationalBackgroundDoc);
    const savedUser = await user.save();
    const savedEducationBackgroundDocument =
      savedUser.educational_backgrounds?.[
      savedUser.educational_backgrounds?.length - 1
      ];

    return savedEducationBackgroundDocument;
  }

  async addNationalIdCard(
    userId: string,
    payload: CreateNationalIdCardDto,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { national_id_card, isProfileCompleted } = payload;

    // TODO: Check if validation for both these properties is in-place
    user.national_id_card = national_id_card;
    user.isProfileCompleted = isProfileCompleted;

    return user.save();
  }

  async updateEducationalBackground(
    userId: string,
    backgroundId: string,
    payload: UpdateEducationalBackgroundDto,
  ) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.educational_backgrounds) {
        throw new NotFoundException('No educational backgrounds found');
      }

      const edu_bg_index = user.educational_backgrounds.findIndex(
        (bg) => bg._id?.toString() === backgroundId,
      );

      if (edu_bg_index === -1) {
        throw new NotFoundException(
          `Educational background with ID ${backgroundId} not found`,
        );
      }

      // Schema validation will handle marks_gpa validation automatically

      // Build dynamic update query for nested document fields
      const updateQuery: any = {};

      Object.keys(payload).forEach((key) => {
        if (key === 'marks_gpa' && payload.marks_gpa) {
          // Update each key in the marks_gpa object separately ONLY IF the matching key is present in the payload
          Object.keys(payload.marks_gpa).forEach((gpaKey) => {
            updateQuery[
              `educational_backgrounds.${edu_bg_index}.marks_gpa.${gpaKey}`
            ] = payload?.marks_gpa?.[gpaKey];
          });
        } else {
          updateQuery[`educational_backgrounds.${edu_bg_index}.${key}`] =
            payload[key];
        }
      });

      const result = await this.userModel.updateOne(
        { _id: userId },
        { $set: updateQuery },
        { runValidators: true },
      );

      if (result.modifiedCount === 0) {
        throw new NotFoundException('Failed to update educational background');
      }

      return result;
    } catch (error) {
      console.error('Error updating educational background:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeEducationalBackground(
    userId: string,
    backgroundId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.educational_backgrounds) {
      throw new NotFoundException('No educational backgrounds found');
    }

    const initialLength = user.educational_backgrounds.length;
    user.educational_backgrounds = user.educational_backgrounds.filter(
      (bg) => bg._id?.toString() !== backgroundId,
    );

    if (user.educational_backgrounds.length === initialLength) {
      throw new NotFoundException(
        `Educational background with ID ${backgroundId} not found`,
      );
    }

    return user.save();
  }

  async updateNationalIdCard(
    userId: string,
    payload: UpdateNationalIdCardDto,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.national_id_card = payload;
    return user.save();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).orFail().exec();
  }

  async findByResetPasswordTokenHash(
    resetPasswordTokenHash: string,
    date: Date,
  ): Promise<UserDocument> {
    return this.userModel
      .findOne({
        resetPasswordToken: resetPasswordTokenHash,
        resetPasswordExpiration: { $gt: date },
      })
      .orFail().exec();
  }

  async findByEmailVerificationTokenHashOrFail(
    emailVerificationTokenHash: string,
    date: Date,
  ) {
    // Stepwise validation so callers can distinguish failure causes.
    // We intentionally do NOT combine these checks into a single query, because
    // that would collapse invalid/expired/already-verified/data-integrity cases
    // into the same "not found" outcome.

    // 1) Find by token hash first (this is the only identifier we have here).
    const user = await this.userModel
      .findOne({
        verifyToken: emailVerificationTokenHash, // stored as a hash
      })
      .exec();

    // log the verification query + coarse result (avoid logging sensitive user data)
    // Temporarily added to debug the verification token issue
    console.debug('🔍 Verification query:', {
      tokenHashPrefix: emailVerificationTokenHash?.slice(0, 8),
      now: date?.toISOString?.() ?? String(date),
      userFound: !!user,
      isVerified: user?._verified,
      hasExpiration: !!user?.verifyTokenExpiration,
      expiration: user?.verifyTokenExpiration?.toISOString?.(),
    });

    if (!user) {
      throw new NotFoundException('Verification token is invalid');
    }

    // 2) Verified accounts should not be able to verify again.
    if (user._verified) {
      throw new BadRequestException('Account is already verified');
    }

    // 3) Expiration must exist and be a valid date.
    if (
      !user.verifyTokenExpiration ||
      Number.isNaN(user.verifyTokenExpiration.getTime())
    ) {
      throw new InternalServerErrorException(
        'Verification token expiration is missing or invalid',
      );
    }

    // 4) Expiration must be in the future.
    if (user.verifyTokenExpiration <= date) {
      throw new BadRequestException('Verification token has expired');
    }

    return user;
  }

  /**
   * @deprecated Frontend should construct the account verification URL from the token itself
   * Generate a account verification URL for the user
   * @param token - The account verification token
   * @returns The account verification URL
   */
  private async generateAccountVerificationUrl(token: string) {
    const verificationUrl = `${this.configService.get('frontend.url', { infer: true })}/verification/${token}`;
    return verificationUrl;
  }

  /**
   * Only sends verification email if the user is unverified
   * Generate and send verification email for a user
   * @param user - The user to send verification email to
   * @returns The generated verification token
   */
  async generateAndSendVerificationEmail(user: UserDocument): Promise<string> {
    // Prevent sending verification emails to already verified users
    if (user._verified) {
      throw new BadRequestException('User is already verified. No verification email needed.');
    }

    // Generate verification token with expiration
    const { token: verifyToken, expiration: verifyTokenExpiration } =
      HashingUtils.generateRandomTokenWithExpiration({
        bytes: 20,
        expirationMinutes: this.configService.get(
          'tokens.emailVerificationExpirationMinutes',
          { infer: true },
        ),
      });

    // Hash the token
    const verifyTokenHash = HashingUtils.hashToken(verifyToken);

    // Update user with new verification token
    await this.userModel
      .findByIdAndUpdate(
        user._id.toString(),
        {
          verifyToken: verifyTokenHash, // Store the hash, not the raw token
          verifyTokenExpiration: verifyTokenExpiration, // Store the expiration
          _verified: false, // Set the user as unverified
        },
        { new: true },
      )
      .select('-password -salt');

    // Send verification email
    const verificationUrl =
      await this.generateAccountVerificationUrl(verifyToken);

    await this.emailService.send({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">Verification Link</a></p><p><strong>Note:</strong> This verification link will expire in ${this.configService.get('tokens.emailVerificationExpirationMinutes', { infer: true })} minutes.</p>`,
    });

    return verifyToken;
  }

  /**
   * Resend verification email for an unverified user
   * @param email - The email of the user to resend verification to
   * @returns Success message
   */
  async resendVerificationEmail(
    email: string,
  ): Promise<{ message: string; user: any }> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._verified) {
      throw new BadRequestException('User is already verified');
    }

    await this.generateAndSendVerificationEmail(user);

    return {
      message: 'Verification email has been resent successfully.',
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  /**
   * Get student signup statistics (total, this month, this week)
   * @returns Statistics object with total, thisMonth, and thisWeek counts
   */
  async getStudentSignupStatistics(): Promise<{
    total: number;
    thisMonth: number;
    thisWeek: number;
  }> {
    const baseFilter = { user_type: UserNS.UserType.Student };

    // Get total count
    const total = await this.userModel.countDocuments(baseFilter);

    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get this month count
    const thisMonth = await this.userModel.countDocuments({
      ...baseFilter,
      created_at: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // Get current week boundaries (Monday to Sunday)
    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);

    // Get this week count
    const thisWeek = await this.userModel.countDocuments({
      ...baseFilter,
      created_at: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });

    return {
      total,
      thisMonth,
      thisWeek,
    };
  }

  /**
 * Get student signups filtered by date range with pagination.
 *
 * Timezone handling: `startDate` and `endDate` are plain `YYYY-MM-DD` strings
 * representing days in the **caller's local timezone** (supplied via the
 * `timezone` request header, e.g. `"Asia/Karachi"`).
 * The transformer converts them to UTC boundaries so that the MongoDB
 * `created_at` comparison is always correct regardless of where the server runs.
 *
 * @param query    - DTO with startDate, endDate, page, limit.
 * @param timezone - IANA timezone string from the `timezone` request header.
 *                   Falls back to `Asia/Karachi` when absent or unrecognised.
 */
  async getStudentSignupsByDateRange(
    query: {
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    timezone?: string,
  ): Promise<{
    docs: any[];
    totalDocs: number;
    page: number;
    totalPages: number;
  }> {
    const take = query.limit || 10;
    const skip = ((query.page || 1) - 1) * take;
    const page = query.page || 1;

    // Build filter conditions
    const filter: any = {
      user_type: UserNS.UserType.Student,
      onboarding_preferences: { $ne: null },
    };

    // Add timezone-aware date range filter when at least one date boundary is provided.
    // localDateRangeToUtc converts the caller's local YYYY-MM-DD into the correct
    // UTC timestamps so documents stored at e.g. 19:00 UTC (= midnight PKT) are
    // correctly included when the user queries for "today" in their timezone.
    if (query.startDate || query.endDate) {
      const { startUtc, endUtc } = localDateRangeToUtc({
        startDate: query.startDate,
        endDate: query.endDate,
        timezone,
      });

      filter.created_at = {};
      if (startUtc) filter.created_at.$gte = startUtc;
      if (endUtc) filter.created_at.$lte = endUtc;
    }

    if (query.search) {
      const escapedSearch = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: escapedSearch, $options: 'i' };

      filter.$or = [
        { full_name: searchRegex },
        { first_name: searchRegex },
        { last_name: searchRegex },
        { student_id: searchRegex },
      ];
    }

    // Get total count
    const totalDocs = await this.userModel.countDocuments(filter);

    // Get paginated documents
    const docs = await this.userModel
      .find(filter)
      .select('student_id full_name first_name last_name email phone_number created_at nationality onboarding_preferences')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(take)
      .lean();

    const totalPages = Math.ceil(totalDocs / take);

    return {
      docs,
      totalDocs,
      page,
      totalPages,
    };
  }

  private normalizeOnboardingPreferences(params: {
    existing?: UserNS.IOnboardingPreferences;
    incoming: Partial<UserNS.IOnboardingPreferences>;
  }): UserNS.IOnboardingPreferences {
    const { existing, incoming } = params;
    const merged: UserNS.IOnboardingPreferences = { ...(existing ?? {}) };

    if (incoming.degree_goal !== undefined) {
      merged.degree_goal = this.normalizeOnboardingDegreeGoal(
        incoming.degree_goal as string | null | undefined,
      );
    }

    if (incoming.preferred_cities !== undefined) {
      merged.preferred_cities = (incoming.preferred_cities ?? []).map((city) =>
        city?.trim?.(),
      ).filter(Boolean);
    }

    if (incoming.preferred_fields_of_study !== undefined) {
      merged.preferred_fields_of_study = [
        ...new Set(
          (incoming.preferred_fields_of_study ?? [])
            .map((v) => v?.trim?.())
            .filter(Boolean),
        ),
      ];
    }

    if (incoming.semester_fee_range !== undefined) {
      // Treat `null` as "clear bounds" rather than removing the object.
      if (incoming.semester_fee_range === null) {
        merged.semester_fee_range = { min: null, max: null };
      } else {
        merged.semester_fee_range = {
          min: incoming.semester_fee_range?.min ?? null,
          max: incoming.semester_fee_range?.max ?? null,
        };
      }
    }

    if (incoming.previous_marks_range !== undefined) {
      // Treat `null` as "clear bounds" rather than nullifying the whole object.
      const incomingMarksRange =
        incoming.previous_marks_range === null
          ? { min_percent: null, max_percent: null }
          : incoming.previous_marks_range;

      // Replace (not merge) previous_marks_range.
      // Any omitted bound is intentionally normalized to null.
      merged.previous_marks_range = {
        min_percent: incomingMarksRange?.min_percent ?? null,
        max_percent: incomingMarksRange?.max_percent ?? null,
      };
    }

    if (incoming.start_timeline !== undefined) {
      const incomingStartTimeline = incoming.start_timeline;

      if (!incomingStartTimeline || incomingStartTimeline.type === null) {
        merged.start_timeline = { type: null };
      } else {
        const existingStartTimeline = existing?.start_timeline ?? {
          type: incomingStartTimeline.type,
        };
        const typeChanged = incomingStartTimeline.type !== undefined
          && incomingStartTimeline.type !== existingStartTimeline.type;

        const resolvedSelectedAt = incomingStartTimeline.selected_at
          ?? (typeChanged ? new Date() : existingStartTimeline.selected_at)
          ?? new Date();

        merged.start_timeline = {
          ...existingStartTimeline,
          ...incomingStartTimeline,
          selected_at: resolvedSelectedAt,
        };
      }
    }

    if (incoming.version !== undefined && incoming.version !== null) {
      merged.version = incoming.version;
    }

    merged.updated_at = new Date();

    return merged;
  }

  private normalizeOnboardingDegreeGoal(
    degreeGoal?: string | null,
  ): UserNS.OnboardingDegreeGoal | null {
    if (!degreeGoal?.trim()) {
      return null;
    }

    const canonical = Object.values(UserNS.OnboardingDegreeGoal).find(
      (v) => v === degreeGoal.trim(),
    );

    if (!canonical) {
      throw new BadRequestException(`Invalid degree_goal: ${degreeGoal}`);
    }

    return canonical;
  }

  /**
   * Get the start of the week (Monday) for a given date
   * @param date - The date to get the week start for
   * @returns Date object representing the start of the week (Monday 00:00:00)
   */
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startOfWeek = new Date(d);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  /**
   * Get the end of the week (Sunday) for a given date
   * @param date - The date to get the week end for
   * @returns Date object representing the end of the week (Sunday 23:59:59.999)
   */
  private getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }
}
