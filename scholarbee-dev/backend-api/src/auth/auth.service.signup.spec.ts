import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { UserNS } from 'src/users/schemas/user.schema';

/**
 * This test suite focuses on the *control-flow contract* of `AuthService.handleUserSignup`.
 *
 * The production implementation splits work into two categories:
 *
 * 1) **Transactional (must be atomic / rollback together)**
 *    - user creation
 *    - referral usage registration
 *
 *    These writes must run inside a *single MongoDB transaction session* so that
 *    a failure in any required step (e.g. referral registration) prevents partial
 *    sign-ups (no user document persisted).
 *
 * 2) **Post-commit side effects (best-effort)**
 *    - support conversation creation
 *    - verification email sending
 *
 *    These run *after* the transaction commits. If they fail, signup should still
 *    succeed (the user exists) and the system can recover via retries/resend endpoints.
 *
 * Notes about test strategy:
 * - We do not spin up MongoDB or run real transactions here. Instead we assert that
 *   the code *attempts* to use a transaction (`runInTransaction`) and that required
 *   work is executed *within* that callback while side effects happen *after* it.
 * - This gives fast, deterministic unit tests that protect the intended ordering.
 */
describe('AuthService.handleUserSignup', () => {
  /**
   * NOTE ON TYPES:
   * `handleUserSignup` accepts a concrete `SignupDto` (which extends `CreateUserDto`).
   * For strict TypeScript, we construct a valid `SignupDto` object with the required
   * fields, even though most fields are irrelevant to the orchestration being tested.
   */
  type CreatedUserResult = {
    message: string;
    user: {
      _id: string;
      email: string;
      user_type: string;
    };
  };

  type TransactionSession = { readonly _fake: true };

  const signupDto: SignupDto = {
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    user_type: UserNS.UserType.Student,
    discovery_info: { discovery_mode: UserNS.DiscoveryMode.Invitation, invitation_code: 'BADCODE' },
  };

  function makeService({
    referralThrows = false,
    chatThrows = false,
    emailThrows = false,
    existingUser = null,
  }: {
    referralThrows?: boolean;
    chatThrows?: boolean;
    emailThrows?: boolean;
    existingUser?: null | { _id: string };
  }) {
    const session: TransactionSession = { _fake: true };

    const usersService = {
      validateAndFilterAcceptedLegalDocumentsForRegistration: jest
        .fn<Promise<unknown[]>, [unknown[]]>()
        .mockResolvedValue([]),
      prepareUserCreationData: jest
        .fn<Promise<{ email: string }>, [SignupDto]>()
        .mockResolvedValue({ email: signupDto.email }),
      findByEmail: jest
        .fn<Promise<null | { _id: string }>, [string]>()
        .mockResolvedValue(existingUser),
      create: jest
        .fn<Promise<CreatedUserResult>, [{ email: string }, { session?: TransactionSession }?]>()
        .mockResolvedValue({
          message: 'User created successfully.',
          user: { _id: 'userId123', email: signupDto.email, user_type: 'Student' },
        }),
      sendVerificationForCreatedUser: jest
        .fn<Promise<void>, [string]>()
        .mockImplementation(async () => {
          if (emailThrows) throw new Error('email failed');
        }),
    };

    const referenceSystemService = {
      handleReferralOnSignup: jest
        .fn<Promise<{ _id: string }>, [string, string, TransactionSession]>()
        .mockImplementation(async () => {
          if (referralThrows) throw new Error('referral failed');
          return { _id: 'usageId' };
        }),
    };

    const mongoTransactionService = {
      runInTransaction: jest
        .fn<Promise<CreatedUserResult>, [(session: TransactionSession) => Promise<CreatedUserResult>]>()
        .mockImplementation(async (work) => await work(session)),
    };

    const chatService = {
      createSupportConversationForUser: jest
        .fn<Promise<{ _id: string }>, [CreatedUserResult['user']]>()
        .mockImplementation(async () => {
          if (chatThrows) throw new Error('chat failed');
          return { _id: 'convId' };
        }),
    };

    // These dependencies are not used by `handleUserSignup` in this unit test,
    // but are required by the AuthService constructor.
    const jwtService = {} as never;
    const configService = {} as never;
    const emailService = {} as never;

    const authService = new AuthService(
      usersService as never,
      referenceSystemService as never,
      mongoTransactionService as never,
      chatService as never,
      jwtService,
      configService,
      emailService,
    );

    return {
      authService,
      usersService,
      referenceSystemService,
      mongoTransactionService,
      chatService,
      session,
    };
  }

  it('aborts signup when referral fails (no post-commit side effects)', async () => {
    /**
     * Intent:
     * - Referral registration is a REQUIRED step.
     * - If it fails, the signup must fail and *no* post-commit side effects should run.
     *
     * What we verify:
     * - The flow is executed inside `runInTransaction`.
     * - `usersService.create` is called with a `session`.
     * - Side effects (chat + email) are not invoked if the transaction body throws.
     */
    const {
      authService,
      usersService,
      referenceSystemService,
      mongoTransactionService,
      chatService,
    } = makeService({ referralThrows: true });

    await expect(authService.handleUserSignup(signupDto)).rejects.toThrow(
      'referral failed',
    );

    expect(mongoTransactionService.runInTransaction).toHaveBeenCalledTimes(1);
    expect(usersService.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ session: expect.anything() }),
    );
    expect(referenceSystemService.handleReferralOnSignup).toHaveBeenCalledTimes(1);

    // post-commit best-effort calls should not run if transaction fails
    expect(chatService.createSupportConversationForUser).not.toHaveBeenCalled();
    expect(usersService.sendVerificationForCreatedUser).not.toHaveBeenCalled();
  });

  it('returns created user even if post-commit side effects fail', async () => {
    /**
     * Intent:
     * - Side effects are best-effort (per product requirement).
     * - Failures in chat/email should NOT fail signup once the transaction has committed.
     *
     * What we verify:
     * - `handleUserSignup` resolves with the created user payload.
     * - Both side-effect methods are attempted exactly once.
     */
    const { authService, chatService, usersService } = makeService({
      chatThrows: true,
      emailThrows: true,
    });

    await expect(authService.handleUserSignup(signupDto)).resolves.toMatchObject({
      user: { _id: 'userId123', email: signupDto.email },
    });

    expect(chatService.createSupportConversationForUser).toHaveBeenCalledTimes(1);
    expect(usersService.sendVerificationForCreatedUser).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException if user already exists', async () => {
    /**
     * Intent:
     * - Duplicate signup for an existing user should be rejected.
     *
     * What we verify:
     * - The method throws a `ConflictException`.
     */
    const { authService } = makeService({ existingUser: { _id: 'existing' } });

    await expect(authService.handleUserSignup(signupDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});