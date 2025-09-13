"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  reactions?: { [emoji: string]: string[] };
  isEdited?: boolean;
  isDeleted?: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'course' | 'support';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    lastSeen?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  chatId: string;
  timestamp: string;
}

interface OnlineUser {
  userId: string;
  userName: string;
  status: 'online' | 'busy' | 'away';
  lastSeen: string;
}

interface RealtimeMessagingOptions {
  onMessage?: (message: Message) => void;
  onTyping?: (typingUser: TypingUser) => void;
  onStopTyping?: (typingUser: TypingUser) => void;
  onUserOnline?: (user: OnlineUser) => void;
  onUserOffline?: (user: OnlineUser) => void;
  onChatUpdate?: (chat: Chat) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeMessaging(options: RealtimeMessagingOptions = {}) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!session?.user?.id) return;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(`${wsUrl}?userId=${session.user.id}&token=${(session as any).accessToken || ''}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          options.onError?.(error as Error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        attemptReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
        options.onError?.(new Error('WebSocket connection error'));
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionError('Failed to connect');
      options.onError?.(error as Error);
    }
  }, [session?.user?.id, options]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setConnectionError('Max reconnection attempts reached');
      return;
    }

    reconnectAttempts.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
      connect();
    }, delay);
  }, [connect]);

  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'message':
        const message: Message = data.payload;
        setMessages(prev => [...prev, message]);
        options.onMessage?.(message);
        break;

      case 'typing':
        const typingUser: TypingUser = data.payload;
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== typingUser.userId || u.chatId !== typingUser.chatId);
          return [...filtered, typingUser];
        });
        options.onTyping?.(typingUser);
        break;

      case 'stop_typing':
        const stopTypingUser: TypingUser = data.payload;
        setTypingUsers(prev => 
          prev.filter(u => !(u.userId === stopTypingUser.userId && u.chatId === stopTypingUser.chatId))
        );
        options.onStopTyping?.(stopTypingUser);
        break;

      case 'user_online':
        const onlineUser: OnlineUser = data.payload;
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.userId !== onlineUser.userId);
          return [...filtered, onlineUser];
        });
        options.onUserOnline?.(onlineUser);
        break;

      case 'user_offline':
        const offlineUser: OnlineUser = data.payload;
        setOnlineUsers(prev => prev.filter(u => u.userId !== offlineUser.userId));
        options.onUserOffline?.(offlineUser);
        break;

      case 'chat_update':
        const chat: Chat = data.payload;
        setChats(prev => {
          const filtered = prev.filter(c => c.id !== chat.id);
          return [...filtered, chat];
        });
        options.onChatUpdate?.(chat);
        break;

      case 'error':
        console.error('WebSocket error:', data.payload);
        setConnectionError(data.payload.message);
        options.onError?.(new Error(data.payload.message));
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }, [options]);

  const sendMessage = useCallback((message: Partial<Message>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        payload: message
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      options.onError?.(error as Error);
      return false;
    }
  }, [options]);

  const sendTyping = useCallback((chatId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        payload: {
          chatId,
          userId: session?.user?.id,
          userName: session?.user?.name
        }
      }));

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(chatId);
      }, 3000);

      setIsTyping(true);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [session?.user?.id, session?.user?.name]);

  const sendStopTyping = useCallback((chatId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'stop_typing',
        payload: {
          chatId,
          userId: session?.user?.id,
          userName: session?.user?.name
        }
      }));

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Error sending stop typing indicator:', error);
    }
  }, [session?.user?.id, session?.user?.name]);

  const joinChat = useCallback((chatId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'join_chat',
        payload: { chatId }
      }));
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'leave_chat',
        payload: { chatId }
      }));
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'add_reaction',
        payload: { messageId, emoji, userId: session?.user?.id }
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [session?.user?.id]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'remove_reaction',
        payload: { messageId, emoji, userId: session?.user?.id }
      }));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  }, [session?.user?.id]);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'edit_message',
        payload: { messageId, content, userId: session?.user?.id }
      }));
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, [session?.user?.id]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'delete_message',
        payload: { messageId, userId: session?.user?.id }
      }));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [session?.user?.id]);

  const markAsRead = useCallback((chatId: string, messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'mark_as_read',
        payload: { chatId, messageId, userId: session?.user?.id }
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [session?.user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  // Connect when session is available
  useEffect(() => {
    if (session?.user?.id) {
      connect();
    }
  }, [session?.user?.id, connect]);

  return {
    isConnected,
    connectionError,
    messages,
    chats,
    typingUsers,
    onlineUsers,
    currentChat,
    isTyping,
    sendMessage,
    sendTyping,
    sendStopTyping,
    joinChat,
    leaveChat,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    markAsRead,
    setCurrentChat,
    setMessages,
    setChats,
    connect,
    disconnect
  };
}
