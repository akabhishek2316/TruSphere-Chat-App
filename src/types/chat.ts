export type UserId = string;

export interface User {
  uid: string;



  name: string;

  photo: string;

  about: string;

  online: boolean;

  lastSeen: number;

  secret?: string;
}

export interface ChatRoom {
  id: string;


  participants: UserId[];

  lastMessage?: string;

  lastMessageTime?: number;

  createdAt: number;
}

export type ChatId = string;

export type MessageType =
  | "text"
  | "image"
  | "voice";


export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type ReplyMessage = {
  id: string;

  sender: string;

  senderName: string;

  type: "text" | "image" | "voice";

  text?: string;

  image?: string;

  voiceUrl?: string;
};

export type ChatMessage = {
  id: string;

  clientId?: string;

  type: MessageType;

  text?: string;

  image?: string;

  thumbnail?: string;

  caption?: string;

  localImageUri?: string;

  voiceUrl?: string;

  localUri?: string;

  uploadCompleted?: boolean;

  duration?: number;

  sender: UserId;

  senderName?: string;

  receiver: UserId;

  timestamp: number;

  status: MessageStatus;

  deleted?: boolean;

  deletedForEveryone?: boolean;

  deletedFor?: Record<UserId, boolean>;

  replyTo?: ReplyMessage;

  deliveredAt?: number;

  readAt?: number;

  reactions?: Record<UserId, string>;

  readBy?: Record<UserId, boolean>;

  expiresAt?: number | null;
};