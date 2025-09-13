"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Send, Paperclip, Smile, MoreVertical, Search, Phone, Video,
  Users, Settings, Star, Pin, Archive, Trash2, Edit, Reply,
  Forward, Copy, Download, Eye, EyeOff, Lock, Unlock, Crown,
  MessageCircle, Plus, X, Check, AlertCircle, Clock, Circle, Info,
  Bell, BellOff, Volume2, VolumeX, Mic,
  MicOff, Camera, CameraOff, Image, File, FileText, Play,
  Pause, Square, RotateCcw, RotateCw, Maximize, Minimize,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter,
  SortAsc, SortDesc, Grid, List, Calendar, MapPin, Tag,
  Hash, DollarSign, Percent, PlusCircle, MinusCircle,
  Heart, ThumbsUp, ThumbsDown, Flag, Shield, Zap, Target,
  Trophy, Award, Medal, Star as StarIcon, Flame, Brain,
  Rocket, Crown as CrownIcon, Gem, Diamond, Coins, Gift
} from 'lucide-react';

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

interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  isPrivate: boolean;
  isAdmin: boolean;
  lastActivity: string;
}

export default function EnhancedChatInterface() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'contacts'>('chats');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showForwardMessage, setShowForwardMessage] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [showReplyMessage, setShowReplyMessage] = useState(false);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [showEditMessage, setShowEditMessage] = useState(false);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionMessage, setReactionMessage] = useState<Message | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [messageOptions, setMessageOptions] = useState<Message | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    messageType: 'all',
    sender: 'all'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat/chats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${chatId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: newMessage,
          type: 'text',
          replyTo: replyMessage?.id
        })
      });

      if (response.ok) {
        setNewMessage('');
        setReplyMessage(null);
        setShowReplyMessage(false);
        fetchMessages(selectedChat.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (type: string) => {
    switch (type) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'file':
        fileInputRef.current?.click();
        break;
      case 'audio':
        audioInputRef.current?.click();
        break;
      case 'video':
        videoInputRef.current?.click();
        break;
    }
    setShowAttachmentMenu(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // Handle message reaction
    console.log('Reacting to message:', messageId, 'with emoji:', emoji);
  };

  const handleReply = (message: Message) => {
    setReplyMessage(message);
    setShowReplyMessage(true);
  };

  const handleEdit = (message: Message) => {
    setEditMessage(message);
    setShowEditMessage(true);
    setNewMessage(message.content);
  };

  const handleForward = (message: Message) => {
    setForwardMessage(message);
    setShowForwardMessage(true);
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      // Handle message deletion
      console.log('Deleting message:', messageId);
    }
  };

  const handlePin = (messageId: string) => {
    // Handle message pinning
    console.log('Pinning message:', messageId);
  };

  const handleStar = (messageId: string) => {
    // Handle message starring
    console.log('Starring message:', messageId);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Circle className="w-3 h-3 fill-green-500" />;
      case 'busy': return <Circle className="w-3 h-3 fill-red-500" />;
      case 'away': return <Circle className="w-3 h-3 fill-yellow-500" />;
      default: return <Circle className="w-3 h-3 fill-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'chats', label: 'Chats', icon: MessageCircle },
            { id: 'groups', label: 'Groups', icon: Users },
            { id: 'contacts', label: 'Contacts', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' && (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {chat.type === 'group' ? (
                          <Users className="w-6 h-6 text-gray-600" />
                        ) : (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {chat.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {chat.type === 'direct' && chat.participants[0]?.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-1 p-2">
              {chats.filter(chat => chat.type === 'group').map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {chat.participants.length} members
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-1 p-2">
              {chats.filter(chat => chat.type === 'direct').map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {chat.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(chat.participants[0]?.status || 'offline')}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {chat.participants[0]?.status || 'offline'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.participants[0]?.lastSeen ? `Last seen ${formatTime(chat.participants[0].lastSeen)}` : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedChat.type === 'group' ? (
                        <Users className="w-5 h-5 text-gray-600" />
                      ) : (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {selectedChat.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedChat.type === 'direct' && selectedChat.participants[0]?.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedChat.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.type === 'group' 
                        ? `${selectedChat.participants.length} members`
                        : selectedChat.participants[0]?.status || 'offline'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowGroupInfo(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.senderId === session?.user?.id ? 'order-2' : 'order-1'}`}>
                    {message.senderId !== session?.user?.id && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {message.senderName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{message.senderName}</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        message.senderId === session?.user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-gray-100 rounded border-l-4 border-gray-400">
                          <p className="text-xs text-gray-600">{message.replyTo.senderName}</p>
                          <p className="text-sm text-gray-800">{message.replyTo.content}</p>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                              <File className="w-4 h-4" />
                              <span className="text-sm">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        <div className="flex items-center space-x-1">
                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div className="flex space-x-1">
                              {Object.entries(message.reactions).map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200"
                                >
                                  {emoji} {users.length}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {showReplyMessage && replyMessage && (
                <div className="mb-3 p-2 bg-gray-100 rounded border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Replying to {replyMessage.senderName}</p>
                      <p className="text-sm text-gray-800">{replyMessage.content}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowReplyMessage(false);
                        setReplyMessage(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                  {showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleFileUpload('image')}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                        >
                          <Image className="w-4 h-4" />
                          <span className="text-sm">Image</span>
                        </button>
                        <button
                          onClick={() => handleFileUpload('file')}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                        >
                          <File className="w-4 h-4" />
                          <span className="text-sm">File</span>
                        </button>
                        <button
                          onClick={() => handleFileUpload('audio')}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                        >
                          <Mic className="w-4 h-4" />
                          <span className="text-sm">Audio</span>
                        </button>
                        <button
                          onClick={() => handleFileUpload('video')}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                        >
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Video</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={(e) => {
          // Handle file upload
          console.log('File selected:', e.target.files?.[0]);
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          // Handle image upload
          console.log('Image selected:', e.target.files?.[0]);
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        className="hidden"
        accept="audio/*"
        onChange={(e) => {
          // Handle audio upload
          console.log('Audio selected:', e.target.files?.[0]);
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={(e) => {
          // Handle video upload
          console.log('Video selected:', e.target.files?.[0]);
        }}
      />
    </div>
  );
}
