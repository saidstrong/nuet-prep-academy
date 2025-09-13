"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users, Plus, Search, Settings, Crown, Shield, UserPlus,
  UserMinus, User, Edit, Trash2, Lock, Unlock, Eye, EyeOff,
  Bell, BellOff, Volume2, VolumeX, Pin, Archive, Star,
  MessageCircle, Calendar, Clock, MapPin, Tag, Hash,
  Check, X, AlertCircle, Info, Zap, Target, Trophy,
  Award, Medal, Star as StarIcon, Flame, Brain, Rocket,
  Crown as CrownIcon, Gem, Diamond, Coins, Gift, Heart,
  ThumbsUp, ThumbsDown, Flag, Download, Upload, Share2,
  Copy, Link, ExternalLink, Maximize, Minimize, RotateCcw,
  RotateCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Filter, SortAsc, SortDesc, Grid, List, MoreVertical,
  MoreHorizontal, Phone, Video, Camera, Mic, MicOff,
  CameraOff, Play, Pause, Square, SkipBack,
  SkipForward, Repeat, Shuffle, Volume1, Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon, Headphones, Speaker, Monitor,
  Smartphone, Tablet, Laptop, Globe, Wifi,
  WifiOff, Signal, Battery, Plug, Zap as ZapIcon, Sun, Moon, Cloud,
  CloudRain, CloudSnow, CloudLightning, Wind, Thermometer,
  Droplet, Snowflake, Umbrella, Sun as SunIcon, Moon as MoonIcon
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  type: 'public' | 'private' | 'course' | 'support';
  memberCount: number;
  maxMembers?: number;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  rules?: string[];
  tags?: string[];
  category?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  permissions?: {
    canInvite: boolean;
    canPost: boolean;
    canComment: boolean;
    canShare: boolean;
    canModerate: boolean;
  };
  statistics?: {
    totalMessages: number;
    totalPosts: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalLikes: number;
    totalReactions: number;
    activeMembers: number;
    newMembersToday: number;
    newMembersThisWeek: number;
    newMembersThisMonth: number;
  };
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member' | 'guest';
  joinedAt: string;
  lastActive: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  isMuted: boolean;
  isBanned: boolean;
  permissions: {
    canInvite: boolean;
    canPost: boolean;
    canComment: boolean;
    canShare: boolean;
    canModerate: boolean;
  };
  statistics?: {
    totalMessages: number;
    totalPosts: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalLikes: number;
    totalReactions: number;
  };
}

interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  message?: string;
}

export default function GroupManagement() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover' | 'invites' | 'create'>('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showInviteMembers, setShowInviteMembers] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [showGroupRules, setShowGroupRules] = useState(false);
  const [showGroupStatistics, setShowGroupStatistics] = useState(false);
  const [showGroupPermissions, setShowGroupPermissions] = useState(false);
  const [showGroupSocial, setShowGroupSocial] = useState(false);
  const [showGroupContact, setShowGroupContact] = useState(false);
  const [showGroupLocation, setShowGroupLocation] = useState(false);
  const [showGroupTags, setShowGroupTags] = useState(false);
  const [showGroupCategory, setShowGroupCategory] = useState(false);
  const [showGroupWebsite, setShowGroupWebsite] = useState(false);
  const [showGroupSocialLinks, setShowGroupSocialLinks] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchInvites();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/groups', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/chat/invites', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/members`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/join`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/leave`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleInviteMembers = async (groupId: string, userIds: string[]) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchGroupMembers(groupId);
      }
    } catch (error) {
      console.error('Error inviting members:', error);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchGroupMembers(groupId);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateMemberRole = async (groupId: string, userId: string, role: string) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/members/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchGroupMembers(groupId);
      }
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/chat/invites/${inviteId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        fetchInvites();
        fetchGroups();
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/chat/invites/${inviteId}/decline`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        fetchInvites();
      }
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'moderator': return <Shield className="w-4 h-4" />;
      case 'member': return <Users className="w-4 h-4" />;
      case 'guest': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-red-100 text-red-800';
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Management</h2>
          <p className="text-gray-600">Manage your groups and discover new ones</p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="course">Course</option>
              <option value="support">Support</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
        {[
          { id: 'my-groups', label: 'My Groups', icon: Users },
          { id: 'discover', label: 'Discover', icon: Search },
          { id: 'invites', label: 'Invites', icon: UserPlus },
          { id: 'create', label: 'Create', icon: Plus }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'my-groups' && (
        <div className="space-y-4">
          {filteredGroups.filter(group => group.isMember).map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(group.type)}`}>
                        {group.type}
                      </span>
                      {group.isAdmin && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {group.isModerator && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {group.memberCount} members
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Last activity {new Date(group.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupInfo(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupSettings(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="space-y-4">
          {filteredGroups.filter(group => !group.isMember).map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(group.type)}`}>
                        {group.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {group.memberCount} members
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                      {group.tags && group.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          {group.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupInfo(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'invites' && (
        <div className="space-y-4">
          {invites.map((invite) => (
            <div key={invite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{invite.groupName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        invite.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invite.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Invited by {invite.inviterName} to join {invite.groupName}
                    </p>
                    {invite.message && (
                      <p className="text-sm text-gray-500 mb-2">"{invite.message}"</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Invited {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {invite.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptInvite(invite.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(invite.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Create a New Group</h3>
            <p className="text-gray-600 mb-6">Start a new group to connect with others</p>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
