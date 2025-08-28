"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Send, Users, MessageCircle, Plus, Search } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  type: 'PRIVATE' | 'GROUP' | 'GLOBAL';
  courseId?: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
}

interface ChatParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  isAdmin: boolean;
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchChats();
  }, [session, status, router]);

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
      const response = await fetch('/api/chat/chats');
      const data = await response.json();
      
      if (data.success) {
        setChats(data.chats);
        if (data.chats.length > 0) {
          setSelectedChat(data.chats[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${chatId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: newMessage,
          type: 'TEXT',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh messages
        fetchMessages(selectedChat.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (status === 'loading' || loading) {
    return (
      <main>
        <Header />
        <div className="container-section py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main>
      <Header />
      <div className="container-section py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
              {/* Chat List Sidebar */}
              <div className="border-r border-slate-200">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Chats</h2>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Chat List */}
                <div className="overflow-y-auto h-[500px]">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            {chat.type === 'PRIVATE' ? (
                              <Users className="w-5 h-5 text-white" />
                            ) : (
                              <MessageCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {chat.name || chat.participants.map(p => p.user.name).join(', ')}
                            </p>
                            {chat.lastMessage && (
                              <span className="text-xs text-slate-500">
                                {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">
                            {chat.type === 'PRIVATE' ? 'Private Chat' : 
                             chat.type === 'GROUP' ? 'Group Chat' : 'Global Chat'}
                          </p>
                          {chat.lastMessage && (
                            <p className="text-xs text-slate-400 truncate">
                              {chat.lastMessage.sender.name}: {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="lg:col-span-2 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            {selectedChat.type === 'PRIVATE' ? (
                              <Users className="w-4 h-4 text-white" />
                            ) : (
                              <MessageCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {selectedChat.name || selectedChat.participants.map(p => p.user.name).join(', ')}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {selectedChat.type === 'PRIVATE' ? 'Private Chat' : 
                               selectedChat.type === 'GROUP' ? 'Group Chat' : 'Global Chat'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">
                            {selectedChat.participants.length} participants
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender.id === session.user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender.id === session.user.id
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.sender.name}
                              </span>
                              <span className="text-xs opacity-75">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-200">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Select a chat</h3>
                      <p className="text-slate-500">Choose a chat from the sidebar to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
