export interface IChat {
  id: string;
  campusLogo: string;
  campusName: string;
  lastMessage: string;
  lastMessageTime: string;
  unread?: number | boolean;
  active?: boolean;
  verified?: boolean;
  campusId?: string;
}

export interface IChat {
  id: string;
  logoUrl: string;
  name: string;
  message: string;
  time: string;
  unreadCount?: number;
  active?: boolean;
  verified?: boolean;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
}

export interface IChatResponse {
  _id: string;
  user_id: string;
  campus_id: {
    id: string;
    name: string;
    logo_url: string;
  };
  last_message_time: string;
  is_read_by_user: boolean;
  is_read_by_campus: boolean;
  is_active: boolean;
  last_message_sender: string;
  last_message?: {
    content: string;
  };
}

export interface IMessageResponse {
  _id: string;
  conversation_id: string;
  sender: string;
  content: string;
  createdAt: string;
}
