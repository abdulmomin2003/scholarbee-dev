import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { AuthenticatedSocket } from 'src/auth/types/auth.interface';
import { AuthenticatedConnectionStoreGateway } from 'src/common/gateway/authenticated-connection-store.gateway';
import { Message } from './schemas/message.schema';
import chat_gateway_constants from './chat-gateway.constant';
import { ChatService } from './chat.service';
import { UserNS } from '../users/schemas/user.schema';
import { Inject, forwardRef } from '@nestjs/common';
import { CampusAdminCacheService } from 'src/common/services/campus-admin-cache.service';

// type ActiveConversationStore = {
//   userId: string;
//   conversationId: string;
// };

// const activeConversationStore: Map<string, ActiveConversationStore> = new Map();

@WebSocketGateway({
  cors: {
    origin: '*', // For development - change to specific origins in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'chat',
  transports: ['websocket', 'polling'], // Allow both WebSocket and polling
})
@UseGuards(WsJwtGuard)
export class ChatGateway extends AuthenticatedConnectionStoreGateway {
  // @WebSocketServer()
  // server: Server;

  /**
   * This is a map of the user's active conversation which keeps of active conversation of the each user
   */
  protected activeConversationStore: Map<string, string> = new Map();
  // Only inject the services needed for this gateway
  constructor(
    protected readonly authService: AuthService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly campusAdminCacheService: CampusAdminCacheService,
  ) {
    super(authService);
  }

  private getUserActiveConversation(userId: string) {
    const activeConversationId =
      this.activeConversationStore.get(userId) ?? null;
    this.logger.log(
      `Retrieved active conversation for user: ${userId} to ${activeConversationId}`,
    );
    return activeConversationId;
  }

  /**
   * Sets the active conversation for a user.
   * Note: This uses `Map.set` which overwrites any existing value for the key.
   * There is no need to call `removeUserActiveConversation` before this.
   */
  private setUserActiveConversation(userId: string, conversationId: string) {
    this.logger.log(
      `Setting active conversation for user: ${userId} to ${conversationId}`,
    );
    this.activeConversationStore.set(userId, conversationId);
  }

  /**
   * Removes the active conversation for a user entirely.
   * Use this when you want to clear the state (e.g., leave/disconnect),
   * not when switching conversations (setUserActiveConversation already overwrites).
   */
  private removeUserActiveConversation(userId: string) {
    return this.activeConversationStore.delete(userId);
  }

  // ***********************
  // Lifecycle methods
  // ***********************

  // Custom logic for authenticated connections
  protected async onAuthenticatedConnectionStoreConnection(
    authSocket: AuthenticatedSocket,
  ) {
    this.logger.log(
      `Authenticated client connected: ${authSocket.id}, user: ${authSocket.data.user.userId}`,
    );

    // Notify the client of successful connection
    authSocket.emit('connection_established', {
      message: 'Successfully connected to chat server',
      userId: authSocket.data.user._id,
    });
  }

  protected async onAuthenticatedConnectionStoreDisconnect(
    authSocket: AuthenticatedSocket,
  ) {
    // Only process disconnect if user was authenticated (user exists in socket data)
    if (!authSocket.data.user) {
      this.logger.log(
        `Client disconnected without authentication: ${authSocket.id}`,
      );
      return;
    }

    this.logger.log(
      `Authenticated client disconnected: ${authSocket.id}, user: ${authSocket.data.user.userId}`,
    );

    // Remove the user's active conversation
    this.removeUserActiveConversation(authSocket.data.user._id);
  }

  private isActiveConversationOfUser(
    userId: string,
    conversationIdOfMessage: string,
  ) {
    const activeConversationIdOfUser = this.getUserActiveConversation(userId);
    if (!activeConversationIdOfUser) return false;

    return conversationIdOfMessage === activeConversationIdOfUser;
  }

  // ***********************
  // Subscription methods
  // ***********************

  /**
   * Validates if the user is allowed to join the conversation room.
   * Checks if user is :
   *  - a direct participant of the conversation. OR
   *  - a campus admin for the campus in the conversation.
   * Throws an error if not allowed.
   */
  private async validateUserCanJoinConversation(
    authSocket: AuthenticatedSocket,
    conversationId: string,
  ) {
    const user = authSocket.data.user;
    const userId = user._id;
    const userType = user.user_type;

    // Fetch conversation
    const conversation =
      await this.chatService.findConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const conversationUserId = conversation.user_id._id;
    const conversationUserIdString = conversationUserId.toString();
    const conversationCampusId = conversation.campus_id._id;

    // Student: must match user_id
    if (userType === UserNS.UserType.Student) {
      if (conversationUserIdString !== userId) {
        throw new Error('You are not a participant of this conversation.');
      }
    } else if (
      userType === UserNS.UserType.Campus_Admin ||
      userType === UserNS.UserType.Super_Admin
    ) {
      // Campus admin: must be a campus admin for the campus in the conversation
      const campusAdminIds =
        await this.campusAdminCacheService.getCampusAdminIdsForCampus(
          conversationCampusId,
        );
      if (!campusAdminIds.includes(userId)) {
        throw new Error('You are not a campus admin for this conversation.');
      }
    } else {
      // Other user types not allowed
      throw new Error('You are not allowed to join this conversation.');
    }
    // If no error thrown, validation passed
    return conversation;
  }

  @SubscribeMessage(
    chat_gateway_constants.subscription_events.join_conversation,
  )
  async joinConversation(
    authSocket: AuthenticatedSocket,
    conversationId: string,
  ) {
    // Validation: Only allow participants to join the conversation room
    try {
      await this.validateUserCanJoinConversation(authSocket, conversationId);
      // Passed validation, join the room
      const userId = authSocket.data.user._id;

      // If already in a different conversation room, leave it first
      const prevConversationId = this.getUserActiveConversation(userId);
      if (prevConversationId && prevConversationId !== conversationId) {
        const prevRoom =
          chat_gateway_constants.rooms.conversation(prevConversationId);
        authSocket.leave(prevRoom);
        this.logger.log(
          `User (${userId}) left previous conversation room (${prevRoom})`,
        );
      }

      // Join the requested conversation room
      const conversationRoom =
        chat_gateway_constants.rooms.conversation(conversationId);
      authSocket.join(conversationRoom);
      this.logger.log(
        `User (${userId}) joined conversation room (${conversationRoom})`,
      );

      // Overwrite active conversation
      this.setUserActiveConversation(userId, conversationId);
      this.logger.log(
        `User (${userId}) set active conversation to (${conversationId})`,
      );
    } catch (err) {
      this.logger.error('Error joining conversation:', err);
      authSocket.emit(chat_gateway_constants.emit_events.ERROR, {
        message: err.message || 'Failed to join conversation.',
      });
    }
  }

  // leave conversation
  @SubscribeMessage(
    chat_gateway_constants.subscription_events.leave_conversation,
  )
  leaveConversation(authSocket: AuthenticatedSocket) {
    // Leave the conversation room
    const conversationId = this.getUserActiveConversation(
      authSocket.data.user._id,
    );
    if (!conversationId) {
      this.logger.warn(`User ${authSocket.data.user._id} not in any conversation`);
      return;
    }

    const conversationRoom =
      chat_gateway_constants.rooms.conversation(conversationId);

    if (conversationId) {
      authSocket.leave(conversationRoom);
      this.logger.log(
        `User (${authSocket.data.user._id}) left conversation room (${conversationId})`,
      );
    }

    // Remove the user's active conversation
    this.removeUserActiveConversation(authSocket.data.user._id);
    this.logger.log(
      `User (${authSocket.data.user._id}) reset active conversation to null`,
    );
  }

  // ***********************
  // Emit methods
  // ***********************

  /**
   * Emits a message notification to the recipients in the following cases:
   * - recipients are connected to the chat-socket
   * - recipients do not have the conversation as the active conversation
   */
  emitMessageNotificationToRecipients(
    recipientIds: string[],
    // TODO: Accept the exact notification payload or create-and-user a prepareMessageNotificaiton private method
    message: Message,
  ) {
    // ******************************
    // Get the recipients of the conversation by checking the users in the conversation room
    // ******************************
    this.logger.debug('🍌 Getting the recipients of the conversation');

    let validRecipientsOfMessageNotification: string[] = [];

    // Get the connection against each recipientId
    for (const recipientId of recipientIds) {
      const connection = this.socketStoreService.getConnection({
        userId: recipientId.toString(),
      });

      if (!connection) continue;

      const { socketId: connSocketId, userId: connUserId } = connection;

      // Check if the active conversation of current connectedUser is the same as active conversation of the message
      const messageExistsInActiveConversationOfConnectedUser =
        this.isActiveConversationOfUser(
          connUserId,
          message.conversation_id.toString(),
        );

      // No need to send a message-notification to the user if the message is in the active conversation of the user
      if (!messageExistsInActiveConversationOfConnectedUser) {
        // Append the user to the valid recipients if the message notification
        validRecipientsOfMessageNotification.push(connSocketId);
      }
    }

    // ******************************
    // Send the message notification to the valid recipients
    // ******************************

    // Retrieve the event name
    const msgNotificationEvent =
      chat_gateway_constants.emit_events.notification_message;

    this.logger.debug(
      `🍌 Sending the message notification to the valid recipients`,
    );

    if (validRecipientsOfMessageNotification.length > 0) {
      // Send the message notification to the valid recipients
      this.server
        .to(validRecipientsOfMessageNotification)
        .emit(msgNotificationEvent, {
          conversationId: message.conversation_id.toString(),
          messageId: message._id,
          senderId: message.sender_id,
          messageSnippet: message.content,
          timestamp: message.created_at,
        });
    }
  }

  /**
   * Emits a message to the conversation room (includes all the participants of the conversation)
   * @param senderUserId - This is different from the sender_id in the message because in case of a message from campus to user, the sender_id is the campus_id and senderUserId is the user_id. However, for socket communication, we need to use the user_id only as there's not socketId for the campus_id
   * @param conversationId
   * @param chatMessage
   */
  emitChatMessageToConversation(
    senderUserId: string,
    conversationId: string,
    chatMessage: Message,
  ) {
    // this.logger.log(`Emitting ${event} to conversation: ${conversationId}`);

    // Emit to the conversation room
    const conversationRoom =
      chat_gateway_constants.rooms.conversation(conversationId);

    const conversationEvent =
      chat_gateway_constants.emit_events.conversation_message;

    // Get the socket for the sender
    const senderConn = this.socketStoreService.getConnection({
      userId: senderUserId,
    });

    // Send the message only to the conversation room
    this.server
      .to(conversationRoom)
      .except(senderConn?.socketId ?? []) // if sender is connected, then exclude the sender from the message
      .emit(conversationEvent, chatMessage);
  }
}
