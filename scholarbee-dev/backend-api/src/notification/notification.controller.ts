import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import {
  CreateCampusGlobalNotificationDto,
  CreateGlobalNotificationDto,
  CreateCampusSpecificNotificationsDto,
  CreateSpecificNotificationDto,
  MarkBulkNotificationsAsReadDto,
  MarkAllNotificationsAsReadDto,
  MarkNotificationAsReadDto,
  CreateAdmissionProgramNotificationDto,
  CreateScholarshipNotificationDto,
  CreateApplicationStatusNotificationDto,
  CreateCampusNotificationDto,
  CreateProgramNotificationDto,
  CreateChatNotificationDto,
  CreateBlogPostNotificationDto,
} from './dto/create-notification.dto';
import {
  QueryCampusNotificationDto,
  QueryNotificationDto,
} from './dto/query-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './services/notfication.service';
import { NotificationTestService } from './services/notification-test.service';
import { AudienceType } from 'src/notification/schemas/notification.schema';
import { ApiTags } from '@nestjs/swagger';
import { GetNotificationsApiDoc, GetNotificationsCountApiDoc } from './api-docs/get-notifications.api-doc';
import { MarkBulkNotificationsAsReadApiDoc, MarkNotificationAsReadApiDoc, MarkAllNotificationsAsReadApiDoc } from './api-docs/mark-notifications-read.api-doc';
import { CreateGlobalUserNotificationApiDoc, CreateSpecificUsersNotificationApiDoc } from './api-docs/test-create-user-notifications.api-doc';
import { CreateGlobalCampusNotificationApiDoc, CreateSpecificCampusesNotificationApiDoc } from './api-docs/test-create-campus-notifications.api-doc';
import {
  CreateAdmissionProgramNotificationApiDoc,
  CreateScholarshipNotificationApiDoc,
  CreateApplicationStatusNotificationApiDoc,
  CreateCampusNotificationApiDoc,
  CreateProgramNotificationApiDoc,
  CreateChatNotificationApiDoc,
  CreateBlogPostNotificationApiDoc,
} from './api-docs/test-create-typed-notifications.api-doc';

@ApiTags('notifications')
@UseInterceptors(ResponseInterceptor)
@UseGuards(ResourceProtectionGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
  ) { }

  @GetNotificationsApiDoc()
  @Get()
  async getNotifications(
    @AuthReq() authReq: AuthenticatedRequest,
    @Query() queryDto: QueryNotificationDto,
  ) {
    return this.notificationService.getNotifications(authReq.user, queryDto);
  }

  @GetNotificationsCountApiDoc()
  @Get('count')
  async getNotificationsCount(
    @AuthReq() authReq: AuthenticatedRequest,
    @Query() queryDto: QueryNotificationDto,
  ) {
    const count = await this.notificationService.getNotificationsCount(
      authReq.user,
      queryDto,
    );
    return { count };
  }

  @MarkBulkNotificationsAsReadApiDoc()
  @Patch('mark-read/bulk')
  async markBulkNotificationsAsRead(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() markNotificationsReadDto: MarkBulkNotificationsAsReadDto,
  ) {
    const userId = authReq.user._id;
    const { notificationIds } = markNotificationsReadDto;
    const updatedCount =
      await this.notificationService.markBulkNotificationsAsRead(
        userId,
        notificationIds,
      );
    return { updatedCount };
  }

  @MarkAllNotificationsAsReadApiDoc()
  @Patch('mark-read/all')
  async markAllNotificationsAsRead(
    @AuthReq() authReq: AuthenticatedRequest,
    @Query() markAllReadDto: MarkAllNotificationsAsReadDto,
  ) {
    const userId = authReq.user._id;
    const { category } = markAllReadDto;
    const updatedCount =
      await this.notificationService.markAllNotificationsAsRead(
        authReq.user,
        category,
      );
    return { updatedCount };
  }

  @MarkNotificationAsReadApiDoc()
  @Patch('mark-read/:notificationId')
  async markNotificationAsRead(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param(new ValidationPipe({ transform: true }))
    params: MarkNotificationAsReadDto,
  ) {
    const userId = authReq.user._id;
    const { notificationId } = params;
    const updated = await this.notificationService.markNotificationAsRead(
      userId,
      notificationId,
    );
    return { updated };
  }
}

// Test Controller for creating notifications
@UseInterceptors(ResponseInterceptor)
@UseGuards(ResourceProtectionGuard)
@Controller('notifications/test')
export class NotificationTestController {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly notificationTestService: NotificationTestService,
  ) { }

  @CreateGlobalUserNotificationApiDoc()
  @Post('user/global')
  async createGlobalUserNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createGlobalNotificationDto: CreateGlobalNotificationDto,
  ) {
    const notification =
      await this.notificationService.createGlobalUserNotification(
        createGlobalNotificationDto,
      );
    return notification;
  }

  @CreateSpecificUsersNotificationApiDoc()
  @Post('user/specific')
  async createSpecificUsersNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createSpecificNotificationDto: CreateSpecificNotificationDto,
  ) {
    const notification =
      await this.notificationService.createSpecificUsersNotification(
        createSpecificNotificationDto,
      );
    return notification;
  }

  @CreateGlobalCampusNotificationApiDoc()
  @Post('campus/global')
  async createGlobalCampusNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body()
    createCampusGlobalNotificationDto: CreateCampusGlobalNotificationDto,
  ) {
    const notification =
      await this.notificationService.createGlobalCampusNotification(
        createCampusGlobalNotificationDto,
      );
    return notification;
  }

  @CreateSpecificCampusesNotificationApiDoc()
  @Post('campus/specific')
  async createSpecificCampusesNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body()
    createCampusSpecificNotificationDto: CreateCampusSpecificNotificationsDto,
  ) {
    const notification =
      await this.notificationService.createSpecificCampusesNotification(
        createCampusSpecificNotificationDto,
      );
    return notification;
  }

  // ============================================================================
  // RANDOM NOTIFICATION ENDPOINTS WITH NAVIGATION
  // ============================================================================

  @CreateAdmissionProgramNotificationApiDoc()
  @Post('admission-program')
  async createAdmissionProgramNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body()
    createAdmissionProgramNotificationDto: CreateAdmissionProgramNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createAdmissionProgramNotification(
        createAdmissionProgramNotificationDto.programId,
        createAdmissionProgramNotificationDto.title,
        createAdmissionProgramNotificationDto.message,
        createAdmissionProgramNotificationDto.userIds,
      );
    return notification;
  }

  @CreateScholarshipNotificationApiDoc()
  @Post('scholarship')
  async createScholarshipNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createScholarshipNotificationDto: CreateScholarshipNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createScholarshipNotification(
        createScholarshipNotificationDto.scholarshipId,
        createScholarshipNotificationDto.title,
        createScholarshipNotificationDto.message,
        createScholarshipNotificationDto.campusIds,
      );
    return notification;
  }

  @CreateApplicationStatusNotificationApiDoc()
  @Post('application-status')
  async createApplicationStatusNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body()
    createApplicationStatusNotificationDto: CreateApplicationStatusNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createApplicationStatusNotification(
        createApplicationStatusNotificationDto.applicationId,
        createApplicationStatusNotificationDto.title,
        createApplicationStatusNotificationDto.message,
        createApplicationStatusNotificationDto.userId,
        createApplicationStatusNotificationDto.status,
      );
    return notification;
  }

  @CreateCampusNotificationApiDoc()
  @Post('campus-specific')
  async createCampusNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createCampusNotificationDto: CreateCampusNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createCampusNotification(
        createCampusNotificationDto.campusId,
        createCampusNotificationDto.title,
        createCampusNotificationDto.message,
        createCampusNotificationDto.campusIds,
      );
    return notification;
  }

  @CreateProgramNotificationApiDoc()
  @Post('program')
  async createProgramNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createProgramNotificationDto: CreateProgramNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createProgramNotification(
        createProgramNotificationDto.programId,
        createProgramNotificationDto.title,
        createProgramNotificationDto.message,
        createProgramNotificationDto.campusIds,
      );
    return notification;
  }

  @CreateChatNotificationApiDoc()
  @Post('chat')
  async createChatNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createChatNotificationDto: CreateChatNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createChatNotification(
        createChatNotificationDto.chatId,
        createChatNotificationDto.title,
        createChatNotificationDto.message,
        createChatNotificationDto.userId,
      );
    return notification;
  }

  @CreateBlogPostNotificationApiDoc()
  @Post('blog-post')
  async createBlogPostNotification(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() createBlogPostNotificationDto: CreateBlogPostNotificationDto,
  ) {
    const notification =
      await this.notificationTestService.createBlogPostNotification(
        createBlogPostNotificationDto.blogPostId,
        createBlogPostNotificationDto.title,
        createBlogPostNotificationDto.message,
        createBlogPostNotificationDto.userIds,
      );
    return notification;
  }
}
