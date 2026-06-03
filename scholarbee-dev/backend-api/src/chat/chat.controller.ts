import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ResourceProtectionGuard } from '../auth/guards/resource-protection.guard';
import { ChatGateway } from './chat.gateway';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { ConversationParticipantType } from './schemas/conversation.schema';
import { ListConversationsQueryDto } from './dto/list-conversations.query.dto';
import { UserNS } from 'src/users/schemas/user.schema';
import { GetConversationsCountQueryDto } from 'src/chat/dto/list-conversations.query.dto';
import { stringToObjectId } from 'src/utils/db.utils';
import { ApiTags } from '@nestjs/swagger';
import { CreateConversationApiDoc } from './api-docs/create-conversation.api-doc';
import { ListConversationsForCampusApiDoc, ListConversationsForUserApiDoc, GetConversationsCountForCampusApiDoc, GetConversationsCountForUserApiDoc } from './api-docs/list-conversations.api-doc';
import { FindConversationApiDoc } from './api-docs/find-conversation.api-doc';
import { UpdateConversationApiDoc } from './api-docs/update-conversation.api-doc';
import { MarkConversationAsReadByCampusApiDoc, MarkConversationAsReadByUserApiDoc } from './api-docs/mark-read.api-doc';
import { DeleteConversationApiDoc } from './api-docs/delete-conversation.api-doc';
import { CreateCampusMessageApiDoc, CreateUserMessageApiDoc } from './api-docs/create-message.api-doc';
import { GetMessagesByConversationApiDoc } from './api-docs/get-messages.api-doc';

@ApiTags('chat')
@Controller('chat')
@UseGuards(ResourceProtectionGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) { }

  @Post('conversations')
  @CreateConversationApiDoc()
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    try {
      // Get user ID from JWT token
      const userId = req.user.sub;

      return await this.chatService.createConversation(
        createConversationDto,
        userId,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('conversations/user')
  @ListConversationsForUserApiDoc()
  findAllConversationsForUser(
    @AuthReq() req: AuthenticatedRequest,
    @Query() query: ListConversationsQueryDto,
  ) {
    try {
      const userId = req.user.sub;

      // Validate userId
      if (!userId) {
        throw new BadRequestException('User ID not found in token');
      }

      return this.chatService.findAllConversationsForUser(userId, query);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('conversations/user/count')
  @GetConversationsCountForUserApiDoc()
  getConversationsCountForUser(
    @AuthReq() req: AuthenticatedRequest,
    @Query() query: GetConversationsCountQueryDto,
  ) {
    try {
      const userId = req.user.sub;

      if (!userId) {
        throw new BadRequestException('User ID not found in token');
      }

      return this.chatService.getUserConversationsCount(userId, query);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // TODO: Use the @AllowedUserTypes decorator to protect this endpoint and the CampusAdminAuthenticatedRequest decorator to validate the user type and campus id.
  // TODO: However, the service is current open to super-admin as well but the CampusAdminAuthenticatedRequest decorator will not be able to validate super-admin. (Might need to update the AuthReq decorator to handle super-admin as well as create a new SuperAdminAuthenticatedRequest type)
  @Get('conversations/campus')
  @ListConversationsForCampusApiDoc()
  findAllConversationsForCampus(
    @AuthReq() req: AuthenticatedRequest,
    @Query() query: ListConversationsQueryDto,
  ) {
    // Here you would typically check if the user has admin rights for this campus
    const user = req.user;
    const campusId = user.campus_id;
    if (!campusId) {
      throw new ForbiddenException('Only campus admins can access conversations for their campus');
    }

    // Check if user has admin rights for this campus
    const isAdminUser =
      user.user_type === UserNS.UserType.Campus_Admin ||
      user.user_type === UserNS.UserType.Super_Admin;
    const hasValidCampusId = !!user.campus_id;
    const isAuthorizedForCampus = user.campus_id.equals(campusId);

    if (!isAdminUser || !hasValidCampusId || !isAuthorizedForCampus) {
      throw new ForbiddenException(
        'You do not have permission to access these conversations',
      );
    }

    return this.chatService.findAllConversationsForCampus(campusId.toString(), query);
  }

  @Get('conversations/campus/count')
  @GetConversationsCountForCampusApiDoc()
  getConversationsCountForCampus(
    @AuthReq() req: AuthenticatedRequest,
    @Query() query: GetConversationsCountQueryDto,
  ) {
    try {
      const user = req.user;
      const campusId = user.campus_id;

      if (!campusId) {
        throw new ForbiddenException('Only campus admins can access conversations for their campus');
      }


      // Check if user has admin rights for this campus
      const isAdminUser =
        user.user_type === UserNS.UserType.Campus_Admin ||
        user.user_type === UserNS.UserType.Super_Admin;
      const hasValidCampusId = !!user.campus_id;
      const isAuthorizedForCampus = user.campus_id.equals(campusId);

      if (!isAdminUser || !hasValidCampusId || !isAuthorizedForCampus) {
        throw new ForbiddenException(
          'You do not have permission to access these conversations',
        );
      }

      return this.chatService.getCampusConversationsCount(campusId.toString(), query);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('conversations/:id')
  @FindConversationApiDoc()
  findConversation(@Param('id') id: string) {
    return this.chatService.findConversation(id);
  }

  @Patch('conversations/:id')
  @UpdateConversationApiDoc()
  updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.chatService.updateConversation(id, updateConversationDto);
  }

  @Patch('conversations/:conversationId/read/user')
  @MarkConversationAsReadByUserApiDoc()
  markConversationAsReadByUser(
    @Param('conversationId') conversationId: string,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    return this.chatService.markMessagesAsRead(
      conversationId,
      user,
      ConversationParticipantType.USER,
    );
  }

  @Patch('conversations/:conversationId/read/campus')
  @MarkConversationAsReadByCampusApiDoc()
  markConversationAsReadByCampus(
    @Param('conversationId') conversationId: string,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    // Check if user has admin rights
    const isAdminUser =
      user.user_type === UserNS.UserType.Campus_Admin ||
      user.user_type === UserNS.UserType.Super_Admin;
    const hasValidCampusId = !!user.campus_id;

    if (!isAdminUser || !hasValidCampusId) {
      throw new ForbiddenException(
        'You do not have permission to mark conversations as read',
      );
    }

    return this.chatService.markMessagesAsRead(
      conversationId,
      user,
      ConversationParticipantType.CAMPUS,
    );
  }

  @Delete('conversations/:id')
  @DeleteConversationApiDoc()
  deleteConversation(@Param('id') id: string) {
    return this.chatService.deleteConversation(id);
  }

  @Post('messages/user')
  @CreateUserMessageApiDoc()
  async createUserMessage(
    @Body() createMessageDto: CreateMessageDto,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    try {
      // Save message to database first
      const message = await this.chatService.createMessage(
        createMessageDto,
        req.user,
        ConversationParticipantType.USER,
      );

      return message;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('messages/campus')
  @CreateCampusMessageApiDoc()
  async createCampusMessage(
    @Body() createMessageDto: CreateMessageDto,
    @AuthReq() req: AuthenticatedRequest,
  ) {
    try {
      const user = req.user;

      // Check if user has admin rights
      const isAdminUser =
        user.user_type === UserNS.UserType.Campus_Admin ||
        user.user_type === UserNS.UserType.Super_Admin;
      const hasValidCampusId = !!user.campus_id;

      if (!isAdminUser || !hasValidCampusId) {
        throw new ForbiddenException(
          'You do not have permission to send messages as campus',
        );
      }

      // Save message to database first
      const message = await this.chatService.createMessage(
        createMessageDto,
        req.user,
        ConversationParticipantType.CAMPUS,
      );

      return message;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('messages/:conversationId')
  @GetMessagesByConversationApiDoc()
  getMessagesByConversation(
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.chatService.getMessagesByConversation(
      conversationId,
      page,
      limit,
    );
  }
}
