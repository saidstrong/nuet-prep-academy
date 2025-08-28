"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, User, Check, CheckCheck } from 'lucide-react';
import { supabase, subscribeToChatMessages, markMessageAsRead } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  isRead?: boolean;
}

interface ChatInterfaceProps {
  chatId: string;
  chatName: string;
  participants: any[];
  onClose: () => void;
}

export default function ChatInterface({ chatId, chatName, participants, onClose }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    setupRealTimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupRealTimeSubscription = () => {
    subscriptionRef.current = subscribeToChatMessages(chatId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new;
        setMessages(prev => [...prev, newMessage]);
        
        // Mark message as read if it's not from current user
        if (session?.user.id && newMessage.sender.id !== session.user.id) {
          markMessageAsRead(newMessage.id, session.user.id);
        }
      }
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          content: newMessage.trim(),
          type: 'TEXT',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Message will be added via real-time subscription
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message: Message) => message.sender.id === session?.user.id;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{chatName}</h3>
            <p className="text-sm text-slate-500">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage(message)
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              {!isOwnMessage(message) && (
                <div className="text-xs text-slate-500 mb-1">
                  {message.sender.name}
                </div>
              )}
              <div className="text-sm">{message.content}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-70">
                  {formatTime(message.createdAt)}
                </span>
                {isOwnMessage(message) && (
                  <div className="flex items-center space-x-1">
                    {message.isRead ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Smile className="w-4 h-4" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
