"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  Target,
  Clock,
  Users,
  Medal,
  Crown,
  Zap,
  Flame,
  BookOpen,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Calendar,
  Share2,
  UserPlus,
  Users2,
  Gift,
  CalendarDays,
  MessageCircle,
  Heart,
  Send,
  Plus,
  Settings,
  Bell,
} from 'lucide-react';

interface UserProfile {
  points: any;
  badges: any[];
  achievements: any[];
  recentTransactions: any[];
}

interface Friend {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  logo: string;
  maxMembers: number;
  members: any[];
}

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  isTeamEvent: boolean;
  participations: any[];
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  rules: any;
  rewards: any;
}

export default function EnhancedGamificationDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, friendsRes, eventsRes] = await Promise.all([
        fetch('/api/gamification/profile'),
        fetch('/api/social/friends'),
        fetch('/api/events')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (email: string, message: string) => {
    try {
      const response = await fetch('/api/social/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendEmail: email, message })
      });

      if (response.ok) {
        setShowFriendModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const createTeam = async (name: string, description: string, maxMembers: number) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, maxMembers })
      });

      if (response.ok) {
        setShowTeamModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const shareAchievement = async (type: string, id: string, message: string) => {
    try {
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, message })
      });

      if (response.ok) {
        setShowShareModal(false);
        setShareData(null);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'teams', label: 'Teams', icon: Users2 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'challenges', label: 'Challenges', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Points</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {profile?.points?.points || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Level</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {profile?.points?.level || 1}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Streak</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {profile?.points?.streak || 0} days
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Friends</p>
                  <p className="text-2xl font-bold text-slate-900">{friends.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {profile?.recentTransactions && profile.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {profile.recentTransactions.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-slate-700">{transaction.reason}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Friends Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Friends</h3>
              <button
                onClick={() => setShowFriendModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </button>
            </div>
            <div className="p-6">
              {friends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                        {friend.image ? (
                          <img src={friend.image} alt={friend.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {friend.name?.charAt(0) || friend.email.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{friend.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-500">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No friends yet</p>
                  <button
                    onClick={() => setShowFriendModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Your First Friend
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Social Feed</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-500 text-center py-8">
                Social interactions and achievements shared by friends will appear here
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Create Team */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">My Teams</h3>
              <button
                onClick={() => setShowTeamModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </button>
            </div>
            <div className="p-6">
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <div key={team.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Users2 className="w-6 h-6 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-slate-900">{team.name}</h4>
                          <p className="text-sm text-slate-500">{team.members?.length || 0} members</p>
                        </div>
                      </div>
                      {team.description && (
                        <p className="text-sm text-slate-600 mb-3">{team.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>Max: {team.maxMembers}</span>
                        <button className="text-primary hover:text-primary-dark">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No teams yet</p>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Team
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Active Events */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Active Events</h3>
            </div>
            <div className="p-6">
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-slate-900">{event.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {event.participations?.length || 0} participants
                            </span>
                            {event.isTeamEvent && (
                              <span className="flex items-center">
                                <Users2 className="w-4 h-4 mr-1" />
                                Team Event
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => joinEvent(event.id)}
                          className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                        >
                          Join Event
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No active events at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {/* Available Challenges */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Available Challenges</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Challenges will appear here when events are active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Friend Request Modal */}
      {showFriendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Send Friend Request</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              sendFriendRequest(
                formData.get('email') as string,
                formData.get('message') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Friend's Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="friend@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Hey! I'd like to connect with you..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFriendModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Team</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createTeam(
                formData.get('name') as string,
                formData.get('description') as string,
                parseInt(formData.get('maxMembers') as string)
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your team..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Members
                  </label>
                  <input
                    type="number"
                    name="maxMembers"
                    min="2"
                    max="20"
                    defaultValue="10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Share Achievement</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              shareAchievement(
                shareData.type,
                shareData.id,
                formData.get('message') as string
              );
            }}>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    You're about to share: <strong>{shareData.name}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add your own message..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareData(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
