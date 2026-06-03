/**
 * TEMPORARY CHANGE NOTICE:
 * This service has been modified to temporarily filter out support campus conversations
 * from user and campus conversation lists. This is a temporary change that must be removed later.
 * 
 * To remove this filtering:
 * 1. Search for "TEMPORARY FILTER" in this file
 * 2. Remove all code blocks marked with "TEMPORARY FILTER" comments
 * 3. Remove the campus_type field from the campus projection in buildUserConversationsAggregationStages
 * 
 * This affects the following methods:
 * - buildCampusConversationsAggregationStages
 * - buildUserConversationsAggregationStages
 * - getUserConversationsCount
 * - getCampusConversationsCount
 * - findAllConversationsForUser
 * - findAllConversationsForCampus
 */

import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, Types } from 'mongoose';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { CampusAdminCacheService } from 'src/common/services/campus-admin-cache.service';
import { Campus, CampusDocument } from '../campuses/schemas/campus.schema';
import { User, UserDocument, UserNS } from '../users/schemas/user.schema';
import { CampusesService } from '../campuses/campuses.service';
import { ChatSessionService } from './chat-session.service';
import { ChatGateway } from './chat.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
  Conversation,
  ConversationDocument,
  ConversationParticipantType,
} from './schemas/conversation.schema';
import {
  isPopulatedAll,
  PopulatedConversationAll,
} from './schemas/conversation.schema.utils';
import { Message, MessageDocument } from './schemas/message.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import {
  ListConversationsQueryDto,
  ConversationReadStatusFilter,
} from './dto/list-conversations.query.dto';
import { getDataAndCountAggPipeline, getSortOrder, stringToObjectId } from 'src/utils/db.utils';
import { SanitizedUser } from 'src/users/schemas/user.types';
import { GetConversationsCountQueryDto } from 'src/chat/dto/list-conversations.query.dto';

// test comment
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Campus.name) private campusModel: Model<CampusDocument>,
    private readonly chatSessionService: ChatSessionService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    /**
     * Why is this required:
     * - In the chat system, when a user sends a message to a campus, the message must be delivered to all campus admins.
     * - To do this, we need to quickly retrieve the user IDs of all campus admins associated with a campus.
     *
     * Why caching is used:
     * - The list of campus admins for a campus is unlikely to change frequently, but is queried often (on every message sent to a campus).
     * - Querying the database every time would be inefficient and could lead to performance bottlenecks under high load.
     * - An in-memory cache (campusAdminsCache) is used to store the mapping from campusId to campus admin user IDs, reducing database reads and improving response times.
     *
     * Cache invalidation:
     * - The cache should be invalidated (using invalidateCampusAdminsCache) whenever campus admins are added or removed for a campus.
     * - This ensures that the cache does not serve stale data and always reflects the current set of campus admins.
     * - Cache invalidation can be triggered by admin management events or hooks in the user/campus admin management logic.
     *
     * Usage:
     * - This method should be used whenever the system needs to determine the recipients for campus-directed chat messages.
     * - It is safe to use the cache for read-heavy, write-light scenarios, but always ensure proper invalidation on admin changes.
     *
     * @param campusId - The ObjectId of the campus whose admin user IDs are to be retrieved.
     * @param useCache - Whether to use the cache (default: true).
     * @returns Promise<string[]> - Array of campus admin user IDs as strings.
     */

    private readonly campusAdminCacheService: CampusAdminCacheService,
    @Inject(forwardRef(() => CampusesService))
    private readonly campusesService: CampusesService,
  ) { }

  /**
   * Validates if a user has permission to access a conversation.
   * And if the conversation and user are valid.
   *
   * @param conversationId - The conversation ID to check access for
   * @param reqUser - The user requesting access
   * @param senderType - The type of user ('user' or 'campus')
   * @returns The conversation document if access is granted
   * @throws NotFoundException if conversation doesn't exist
   * @throws BadRequestException if conversation ID or user ID is invalid
   * @throws ForbiddenException if user doesn't have access to conversation
   */
  private async validateConversationAccess(
    conversationId: string,
    reqUser: AuthenticatedRequest['user'],
    /* The reason of a dedicated senderType is that a user may be a student as well as a campus admin. In that case, we need to know which type of user is requesting access to the conversation. Which is determined by the api endpoint calling this function*/
    senderType: ConversationParticipantType,
  ): Promise<ConversationDocument> {
    const requestingUserId = reqUser.sub;
    const requestingUserCampusId = reqUser.campus_id;
    const isSenderStudent = senderType === ConversationParticipantType.USER;

    // Validate conversationId
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException(
        `Invalid conversation ID: ${conversationId}`,
      );
    }

    // Validate requesting user ID
    if (!Types.ObjectId.isValid(requestingUserId)) {
      throw new BadRequestException(`Invalid user ID: ${requestingUserId}`);
    }

    const conversationObjectId = new Types.ObjectId(conversationId);

    // Find the conversation and verify it exists
    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    // Permission check: Ensure the requesting user has access to this conversation
    if (isSenderStudent) {
      const reqUserObjectId = new Types.ObjectId(requestingUserId);
      // If user is requesting access, they must be the user in the conversation
      const isUserParticipant = conversation.user_id.equals(reqUserObjectId);

      if (!isUserParticipant) {
        this.logger.debug(
          `User with ID ${requestingUserId} is not a participant in conversation with ID ${conversationObjectId}`,
        );
        throw new NotFoundException(
          'You do not have permission to access this conversation because you are not a participant in this conversation',
        );
      }
    } else if (!isSenderStudent) {
      // If campus admin is requesting access, they must be a campus admin for this campus
      const reqUserCampusObjectId = new Types.ObjectId(requestingUserCampusId);

      if (!reqUserCampusObjectId) {
        this.logger.error(
          `User with ID ${requestingUserId} does not have a campus assigned to them in the payload`,
        );
        throw new ForbiddenException(
          'You do not have permission to access this conversation because you are not a campus admin participant in this conversation',
        );
      }
      const isCampusParticipant = conversation.campus_id.equals(
        reqUserCampusObjectId,
      );

      if (!isCampusParticipant) {
        this.logger.debug(
          `Campus with ID ${reqUserCampusObjectId} is not a participant in conversation with ID ${conversationObjectId}`,
        );
        throw new ForbiddenException(
          'You do not have permission to access this conversation because you are not a participant in this conversation',
        );
      }
    }

    return conversation;
  }

  /**
   * Build aggregation stages for listing/counting campus conversations.
   * @param campusId - The ObjectId of the campus whose conversations are to be retrieved.
   * @param skipDataEnrichment - Whether to skip data enrichment for the conversation like populating/sorting data. (Useful for counting conversations as population and sorting are not needed)
   * @returns PipelineStage[] - The aggregation stages for listing/counting campus conversations.
   */
  private buildCampusConversationsAggregationStages(
    campusId: string,
    readStatus?: ConversationReadStatusFilter,
  ): PipelineStage[] {
    if (!Types.ObjectId.isValid(campusId)) {
      throw new BadRequestException(`Invalid campus ID: ${campusId}`);
    }

    const campusObjectId = new Types.ObjectId(campusId);

    const stages: PipelineStage[] = [
      // Get all active conversations for the campus
      {
        $match: {
          campus_id: campusObjectId,
          _deleted: { $ne: true },
        },
      },
      // Ensure user exists and project required fields (also removes conversations without users)
      {
        $lookup: {
          from: DB_COLLECTIONS.USERS,
          let: { uid: '$user_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$uid'] } } },
            {
              $project: {
                _id: 1,
                full_name: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                user_type: 1,
                profile_image_url: 1,
              },
            },
          ],
          as: 'user_id',
        },
      },
      { $unwind: '$user_id' }, // unwind drops any documents where user_id is null/undefined

      // Get the last message sent by the user (by timestamp) to determine read status
      // If no message is returned, it means the conversation has no messages (read=true, nothing to read)
      // If a message is returned, we check if it's unread by the campus
      {
        $lookup: {
          from: 'messages',
          let: { cid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$conversation_id', '$$cid'] } } },
            // Get the last message sent by the user (for campus perspective)
            { $match: { sender_type: 'user' } },
            { $sort: { created_at: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                is_read_by_campus: 1,
              },
            },
          ],
          as: 'last_user_message',
        },
      },
      // Filter out conversations with zero messages (no last user message = no messages = nothing to read)
      {
        $match: {
          last_user_message: { $ne: [] },
        },
      },
    ];

    // Apply read/unread filter when requested
    if (readStatus) {
      stages.push(
        {
          $addFields: {
            __hasUnread: {
              // If last user message exists and is unread by campus, then conversation is unread
              $and: [
                { $gt: [{ $size: '$last_user_message' }, 0] },
                {
                  $eq: [
                    { $arrayElemAt: ['$last_user_message.is_read_by_campus', 0] },
                    false,
                  ],
                },
              ],
            },
          },
        },
        {
          $match:
            readStatus === ConversationReadStatusFilter.UNREAD
              ? { __hasUnread: true }
              : { __hasUnread: { $ne: true } },
        },
        { $project: { last_user_message: 0, __hasUnread: 0 } },
      );
    } else {
      // If no read status filter, still remove the temporary field
      stages.push({
        $project: {
          last_user_message: 0,
        },
      });
    }

    // ? OPTIONAL: Populate campus details (full doc parity) // ? Commented out because it's being requested by the campus admin and since all the conversations against a campus will have same campus details, it's not needed
    // const populateStages: PipelineStage[] = [
    //   {
    //     $lookup: {
    //       from: DB_COLLECTIONS.CAMPUSES,
    //       localField: 'campus_id',
    //       foreignField: '_id',
    //       as: 'campus_id',
    //     },
    //   },
    //   { $unwind: '$campus_id' },
    // ];

    // stages.push(...populateStages);

    return stages;
  }

  /**
   * Returns the count of active conversations for a given campus.
   */
  async getCampusConversationsCount(
    campusId: string,
    query?: GetConversationsCountQueryDto,
  ): Promise<{ count: number; conversationIds: string[] }> {
    const pipeline = this.buildCampusConversationsAggregationStages(
      campusId,
      query?.read_status,
    );
    const result = await this.conversationModel.aggregate([
      ...pipeline,
      { $project: { _id: 1 } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          conversationIds: { $push: '$_id' },
        },
      },
    ]);
    const data = result?.[0];
    return {
      count: data?.count ?? 0,
      conversationIds: data?.conversationIds?.map((id) => id.toString()) ?? [],
    };
  }

  /**
   * Build aggregation stages for listing/counting user conversations.
   * Mirrors the filters used by findAllConversationsForUser without
   * population, pagination, or sorting so it can be reused for counts.
   */
  private buildUserConversationsAggregationStages(
    userId: string,
    readStatus?: ConversationReadStatusFilter,
  ): PipelineStage[] {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }

    const userObjectId = new Types.ObjectId(userId);

    const stages: PipelineStage[] = [
      {
        // Get all active conversations for the user
        $match: {
          user_id: userObjectId,
          _deleted: { $ne: true },
        },
      },
      // Ensure campus exists and project minimal required fields (drops conversations without campuses)
      {
        $lookup: {
          from: DB_COLLECTIONS.CAMPUSES,
          let: { cid: '$campus_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$cid'] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                logo_url: 1,
                contact_email: 1,
                contact_phone: 1,
                university_id: 1,
                website: 1,
                campus_type: 1,
              },
            },
          ],
          as: 'campus_id',
        },
      },
      { $unwind: '$campus_id' },

    ];

    // Apply read/unread filter when requested
    if (readStatus) {
      const readField = '$is_read_by_user';
      stages.push(
        {
          // Get the last message sent by the campus that is unread by the user
          $lookup: {
            from: 'messages',
            let: { cid: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$conversation_id', '$$cid'] } } },
              // For user perspective, only consider messages sent by CAMPUS that are unread by user
              { $match: { sender_type: 'campus', is_read_by_user: false } },
              { $limit: 1 },
            ],
            as: 'unread_messages_probe',
          },
        },
        {
          $addFields: {
            __hasUnread: {
              $or: [
                { $gt: [{ $size: '$unread_messages_probe' }, 0] },
                { $eq: [readField, false] },
              ],
            },
          },
        },
        {
          $match:
            readStatus === ConversationReadStatusFilter.UNREAD
              ? { __hasUnread: true }
              : { __hasUnread: { $ne: true } },
        },
        { $project: { unread_messages_probe: 0, __hasUnread: 0 } },
      );
    }


    // ? User requests do not require user details; campus already enriched above
    // const populateStages: PipelineStage[] = [
    //   {
    //     $lookup: {
    //       from: DB_COLLECTIONS.USERS,
    //       let: { uid: '$user_id' },
    //       pipeline: [
    //         { $match: { $expr: { $eq: ['$_id', '$$uid'] } } },
    //         {
    //           $project: {
    //             _id: 1,
    //             first_name: 1,
    //             last_name: 1,
    //             email: 1,
    //             user_type: 1,
    //           },
    //         },
    //       ],
    //       as: 'user_id',
    //     },
    //   },
    //   { $unwind: '$user_id' }
    // ];
    // stages.push(...populateStages);


    return stages;
  }

  /**
   * Returns the count of active conversations for a given user.
   */
  async getUserConversationsCount(
    userId: string,
    query?: GetConversationsCountQueryDto,
  ): Promise<{ count: number; conversationIds: string[] }> {
    const pipeline = this.buildUserConversationsAggregationStages(
      userId,
      query?.read_status,
    );
    const result = await this.conversationModel.aggregate([
      ...pipeline,
      { $project: { _id: 1 } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          conversationIds: { $push: '$_id' },
        },
      },
    ]);
    const data = result?.[0];
    return {
      count: data?.count ?? 0,
      conversationIds: data?.conversationIds?.map((id) => id.toString()) ?? [],
    };
  }

  async createConversation(
    createConversationDto: CreateConversationDto,
    userId: string,
  ): Promise<Conversation> {
    try {
      // Validate IDs
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException(`Invalid user ID: ${userId}`);
      }

      if (!Types.ObjectId.isValid(createConversationDto.campus_id)) {
        throw new BadRequestException(
          `Invalid campus ID: ${createConversationDto.campus_id}`,
        );
      }

      // Check if conversation already exists
      const existingConversation = await this.conversationModel.findOne({
        user_id: new Types.ObjectId(userId),
        campus_id: new Types.ObjectId(createConversationDto.campus_id),
      });

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      // Set is_read_by_campus to true initially since there are no messages to read yet
      // It will be updated to false when the user sends the first message
      const newConversation = new this.conversationModel({
        user_id: new Types.ObjectId(userId),
        campus_id: new Types.ObjectId(createConversationDto.campus_id),
        last_message_time: new Date(),
        is_read_by_user: true,
        is_read_by_campus: true,
        _deleted: false, // not required. But keeping it for extra safety and explicitness
      });

      return await newConversation.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle MongoDB duplicate key error (code 11000)
      if (error.code === 11000) {
        // Find and return the existing conversation instead of throwing an error
        const existingConversation = await this.conversationModel.findOne({
          user_id: new Types.ObjectId(userId),
          campus_id: new Types.ObjectId(createConversationDto.campus_id),
        });

        if (existingConversation) {
          return existingConversation;
        }

        throw new BadRequestException(
          'Conversation already exists between this user and campus',
        );
      }

      if (error.message.includes('hex string must be 24 characters')) {
        throw new BadRequestException(
          'Invalid ID format. IDs must be valid MongoDB ObjectIds.',
        );
      }

      throw error;
    }
  }

  async findAllConversationsForUser(
    userId: string,
    query: ListConversationsQueryDto,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    const {
      page,
      limit = 10,
      sortOrder,
      sortBy,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'last_message_time']: getSortOrder(sortOrder ?? 'desc') } as const;

    // Build filter pipeline without internal sort so we can control it here
    const filterPipeline = this.buildUserConversationsAggregationStages(
      userId,
      query?.read_status,
    );

    const { dataPipeline, countPipeline } = getDataAndCountAggPipeline(
      filterPipeline,
      sort,
      limit,
      skip,
    );

    const [data, countAgg] = await Promise.all([
      this.conversationModel.aggregate(dataPipeline).exec(),
      this.conversationModel.aggregate(countPipeline).exec(),
    ]);

    const total = countAgg?.[0]?.total ?? 0;
    const pages = Math.ceil(total / limit) || 0;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  async findAllConversationsForCampus(
    campusId: string,
    query: ListConversationsQueryDto,
  ) {
    if (!Types.ObjectId.isValid(campusId)) {
      throw new BadRequestException(`Invalid campus ID: ${campusId}`);
    }
    const {
      page,
      limit = 10,
      sortOrder,
      sortBy,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'last_message_time']: getSortOrder(sortOrder ?? 'desc') } as const;

    // Build filter pipeline without internal sort so we can control it here
    const filterPipeline = this.buildCampusConversationsAggregationStages(
      campusId,
      query?.read_status,
    );

    const { dataPipeline, countPipeline } = getDataAndCountAggPipeline(
      filterPipeline,
      sort,
      limit,
      skip,
    );

    const [data, countAgg] = await Promise.all([
      this.conversationModel.aggregate(dataPipeline).exec(),
      this.conversationModel.aggregate(countPipeline).exec(),
    ]);

    const total = countAgg?.[0]?.total ?? 0;
    const pages = Math.ceil(total / limit) || 0;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  // TODO: Add a flag in the response to indicate if there are any valid admin-recipients for the campus existing in the database
  async findConversation(id: string): Promise<PopulatedConversationAll> {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('user_id')
      .populate('campus_id')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!isPopulatedAll(conversation)) {
      throw new Error('Conversation is not fully populated');
    }

    return conversation;
  }

  async updateConversation(
    id: string,
    updateConversationDto: UpdateConversationDto,
  ) {
    const conversation = await this.conversationModel.findByIdAndUpdate(
      id,
      updateConversationDto,
      { new: true },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async deleteConversation(id: string) {
    // Soft delete by setting is_active to false
    const conversation = await this.conversationModel.findByIdAndUpdate(
      id,
      { _deleted: true, deletedAt: new Date() }, // Properly soft delete
      { new: true },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return { message: 'Conversation deleted successfully' };
  }

  private async handleMessageCreation(
    createMessageDto: CreateMessageDto,
    userId: string,
    senderType: ConversationParticipantType,
    curMsgTime: Date,
    conversationId: Types.ObjectId,
    senderId: Types.ObjectId,
    sessionResult: Awaited<
      ReturnType<typeof this.chatSessionService.handleChatSession>
    >,
  ) {
    // Create message object
    let messageData: Partial<MessageDocument> = {
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      sender_type_ref:
        senderType === ConversationParticipantType.USER ? 'User' : 'Campus',
      content: createMessageDto.content,
      is_read_by_user: senderType === ConversationParticipantType.USER,
      is_read_by_campus: senderType === ConversationParticipantType.CAMPUS,
      attachments: createMessageDto.attachments || [],
      created_at: curMsgTime,
      sessionId: sessionResult.sessionId,
    };

    // If the message is sent by the campus, then keep a track of which user replied on behalf of the campus
    if (senderType === ConversationParticipantType.CAMPUS) {
      messageData.replied_by_user_id = new Types.ObjectId(userId);
    }

    // Create new message
    const newMessage = new this.messageModel(messageData);
    const savedMessage = await newMessage.save();

    return {
      savedMessage,
      sessionResult,
    };
  }

  /**
   * Creates a new chat message in a conversation.
   *
   * This method handles the following:
   * - Validates the conversation ID and user permissions.
   * - Ensures the sender is a participant in the conversation (student or campus admin).
   * - Determines the correct sender and recipient IDs based on sender type.
   * - Fetches campus admin IDs from cache if the recipient is a campus.
   * - Throws appropriate errors if validation fails.
   * - Proceeds to session handling and message creation.
   *
   * @param createMessageDto - DTO containing message content and conversation ID
   * @param user - Authenticated user sending the message
   * @param senderType - Type of sender (USER or CAMPUS)
   * @returns The created Message document
   */
  async createMessage(
    createMessageDto: CreateMessageDto,
    user: AuthenticatedRequest['user'],
    senderType: ConversationParticipantType,
  ): Promise<Message> {
    try {
      const userId = user.sub;

      // Validate the provided conversation ID
      if (!Types.ObjectId.isValid(createMessageDto.conversation_id)) {
        throw new BadRequestException(
          `Invalid conversation ID: ${createMessageDto.conversation_id}`,
        );
      }

      // Convert IDs to ObjectId for MongoDB operations
      const userObjectId = new Types.ObjectId(userId);
      const conversationId = createMessageDto.conversation_id;
      const conversationObjectId = new Types.ObjectId(conversationId);

      // Validate user access to conversation
      const currentConversation = await this.validateConversationAccess(
        createMessageDto.conversation_id,
        user,
        senderType,
      );

      // Determine sender and recipient IDs based on sender type
      let senderId: Types.ObjectId;
      let recipientIds: string[];
      if (senderType === ConversationParticipantType.USER) {
        // If the sender is a user, set senderId to the user's ObjectId
        senderId = userObjectId;
        const recipientCampusId = currentConversation.campus_id;
        // Fetch campus admin IDs for the campus (using cache for efficiency)
        const recipientCampusAdminIds =
          await this.campusAdminCacheService.getCampusAdminIdsForCampus(
            recipientCampusId,
          );
        recipientIds = recipientCampusAdminIds;
      } else {
        // If the sender is a campus admin, set senderId to the campus's ObjectId
        senderId = currentConversation.campus_id;
        // The recipient is the user in the conversation
        recipientIds = [currentConversation.user_id.toString()];
      }

      // Get the current timestamp for the message
      const curMsgTime = new Date();

      // Handle chat session logic (e.g., session validity, response time updates)
      const sessionResult = await this.chatSessionService.handleChatSession({
        conversation: currentConversation,
        senderType,
        curMsgTime,
        conversationId: conversationObjectId,
      });

      // TODO: Use a DB Transaction around all db updates and socket messages
      // Create the message in db and handle the session logic
      const { savedMessage } = await this.handleMessageCreation(
        createMessageDto,
        userId,
        senderType,
        curMsgTime,
        conversationObjectId,
        senderId,
        sessionResult,
      );

      // Update conversation with last message info and session updates
      await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
        last_message: createMessageDto.content,
        last_message_time: curMsgTime,
        last_message_sender: senderType,
        is_read_by_user: senderType === ConversationParticipantType.USER,
        is_read_by_campus: senderType === ConversationParticipantType.CAMPUS,
        ...sessionResult.conversationDocUpdate,
      });

      // TODO: Get the message recipients

      // If recipient is a campus, then send the message notification to all the admins of the campus
      // - they should be listening to the `chat/notification/message` event (as expected)
      // - if no campus admin is found active, then do nothing

      // If recipient is a user, then send the message notification to the user
      // - they should be listening to the `chat/notification/message` event (as expected)
      // - if no user is found active, then do nothing

      // TODO: Get the message recipients
      // This should decide if the message notification to the user against this specific message based on the user's active conversation and conversationId
      // ! BUG: notification should only be emitted to recipients (excludes the sender)
      // ! BUG: notification should only be emitted to recipients who are not in the conversation room
      if (recipientIds && recipientIds.length > 0) {
        this.chatGateway.emitMessageNotificationToRecipients(
          recipientIds,
          savedMessage,
        );
      }

      // Then emit the event with the saved message
      // TODO: Restrict sending the message to the sender
      this.chatGateway.emitChatMessageToConversation(
        userId,
        createMessageDto.conversation_id,
        savedMessage,
      );

      return savedMessage;
    } catch (error) {
      console.error('🚀 ~ ChatService ~ error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error.message.includes('hex string must be 24 characters')) {
        throw new BadRequestException(
          'Invalid ID format. IDs must be valid MongoDB ObjectIds.',
        );
      }
      throw error;
    }
  }

  async getMessagesByConversation(
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      // Validate conversationId
      if (!Types.ObjectId.isValid(conversationId)) {
        throw new BadRequestException(
          `Invalid conversation ID: ${conversationId}`,
        );
      }

      const skip = (page - 1) * limit;

      // Find the conversation to verify it exists
      const conversation = await this.conversationModel.findById(
        new Types.ObjectId(conversationId),
      );

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${conversationId} not found`,
        );
      }

      // Get messages
      const [messages, total] = await Promise.all([
        this.messageModel
          .find({
            conversation_id: new Types.ObjectId(conversationId),
          })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.messageModel.countDocuments({
          conversation_id: new Types.ObjectId(conversationId),
        }),
      ]);

      // Manually populate sender details based on sender_type
      const populatedMessages = await Promise.all(
        messages.map(async (message) => {
          const messageObj = message.toObject();

          try {
            if (messageObj.sender_type === 'user') {
              // Populate from User model
              const user = await this.userModel
                .findById(messageObj.sender_id)
                .select('full_name first_name last_name email profile_image user_type')
                .exec();

              if (user) {
                messageObj.sender = user.toObject();
              }
            } else if (messageObj.sender_type === 'campus') {
              // Populate from Campus model
              const campus = await this.campusModel
                .findById(messageObj.sender_id)
                .select('name logo_url contact_email contact_phone')
                .exec();

              if (campus) {
                messageObj.sender = campus.toObject();

                // Also populate the user who replied on behalf of the campus
                if (messageObj.replied_by_user_id) {
                  const repliedByUser = await this.userModel
                    .findById(messageObj.replied_by_user_id)
                    .select('full_name first_name last_name email user_type')
                    .exec();

                  if (repliedByUser) {
                    messageObj.replied_by_user = repliedByUser.toObject();
                  }
                }
              }
            }
          } catch (error) {
            console.error(
              `Error populating sender for message ${messageObj._id}:`,
              error,
            );
          }

          return messageObj;
        }),
      );

      return {
        data: populatedMessages,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error.message.includes('hex string must be 24 characters')) {
        throw new BadRequestException(
          'Invalid conversation ID format. Must be a valid MongoDB ObjectId.',
        );
      }
      throw error;
    }
  }

  async markMessagesAsRead(
    conversationId: string,
    requestingUser: AuthenticatedRequest['user'],
    requestedAsParticipantType: ConversationParticipantType, // this property will be used to determine if the check would be for the user or the campus. (This is because a user may be a student as well as a campus admin. Now whether the user is attempting to act as a user or a campus admin is dependent on the senderType which is received based on the endpoint calling this function)
  ) {
    try {
      // Validate user access to conversation
      const conversation = await this.validateConversationAccess(
        conversationId,
        requestingUser,
        requestedAsParticipantType,
      );

      const conversation_id = conversation._id;

      // if the requester is a user, then we want to mark `is_read_by_user` as true; if the requester is a campus, then we want to mark `is_read_by_campus` as true;
      const readField =
        requestedAsParticipantType === ConversationParticipantType.USER
          ? 'is_read_by_user'
          : 'is_read_by_campus';

      // Update conversation read status
      const updateField = { [readField]: true };

      // TODO: Use a DB Transaction around all db updates and socket messages
      const updatedMessages = await this.messageModel.updateMany(
        {
          conversation_id,
          sender_type:
            requestedAsParticipantType === ConversationParticipantType.USER
              ? 'campus'
              : 'user', // ? if the requester is a user, then we want to filter the messages "sent by the campus"; if the requester is a campus, then we want to filter the messages "sent by the user";
          [readField]: false,
        },
        { [readField]: true },
      );

      await this.conversationModel.findByIdAndUpdate(
        conversation_id,
        updateField,
      );

      const updatedMessageCount = updatedMessages.modifiedCount;

      return {
        updatedMessageCount,
        message:
          updatedMessageCount > 0
            ? `Marked ${updatedMessageCount} messages as read`
            : 'No messages found to mark as read',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error.message.includes('hex string must be 24 characters')) {
        throw new BadRequestException(
          'Invalid conversation ID format. Must be a valid MongoDB ObjectId.',
        );
      }
      throw error;
    }
  }

  /**
   * Creates a support conversation for a new user.
   * This method is called during user signup to automatically create
   * a conversation with the support team.
   * @param userId - The user ID to create the conversation for
   * @returns Promise<Conversation> - The created support conversation
   */
  async createSupportConversationForUser(
    user: SanitizedUser,
    options?: { session?: ClientSession },
  ): Promise<Conversation> {
    try {
      const userId = user._id;
      // Validate user ID
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException(`Invalid user ID: ${userId}`);
      }

      // Get or create the support campus
      const supportCampus =
        await this.campusesService.findOrCreateSupportCampus();

      // Check if conversation already exists
      const existingConversationQuery = this.conversationModel.findOne({
        user_id: stringToObjectId(userId),
        campus_id: supportCampus._id,
        _deleted: true,
      });
      if (options?.session) {
        existingConversationQuery.session(options.session);
      }
      const existingConversation = await existingConversationQuery.exec();

      if (existingConversation) {
        return existingConversation;
      }

      // Create new support conversation
      const newConversation = new this.conversationModel({
        user_id: stringToObjectId(userId),
        campus_id: supportCampus._id,
        last_message_time: new Date(),
        is_read_by_user: true,
        is_read_by_campus: true,
        _deleted: false,
      });

      const savedConversation = await newConversation.save({
        session: options?.session,
      });

      // Send welcome message from support campus
      try {
        const welcomeMessage =
          "Welcome to ScholarBee Support! We're here to help you with any questions about admissions, applications, or our platform. How can we assist you today?";

        // Welcome message is a best-effort, non-transactional side effect;
        // do not attach it to the signup transaction.
        await this.createMessage(
          {
            conversation_id: savedConversation._id.toString(),
            content: welcomeMessage,
            attachments: [],
          },
          {
            ...user,
            campus_id: supportCampus._id,
            university_id: supportCampus.university_id,
            _id: user._id.toString(),
            sub: user._id.toString(),
            userId: user._id.toString(),
          },
          ConversationParticipantType.CAMPUS,
        );
      } catch (messageError) {
        // Log error but don't fail conversation creation if welcome message fails
        this.logger.error('Failed to send welcome message:', messageError);
      }

      return savedConversation;
    } catch (error) {
      this.logger.error(
        'Failed to create support conversation for user:',
        error,
      );
      throw error;
    }
  }
}
