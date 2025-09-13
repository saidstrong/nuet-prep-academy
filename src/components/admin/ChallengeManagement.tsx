"use client";
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Trophy,
  Target,
  Clock,
  Star,
  Award,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  X
} from 'lucide-react';
import ChallengeForm from './ChallengeForm';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'INDIVIDUAL' | 'TEAM' | 'MIXED';
  startDate: string;
  endDate: string;
  rules: any;
  rewards: any;
  eventId?: string;
  maxParticipants?: number;
  hasQuiz?: boolean;
  quiz?: {
    questions: any[];
    totalPoints: number;
    passingScore: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  event?: {
    name: string;
    type: string;
  };
  _count?: {
    submissions: number;
  };
}

interface Event {
  id: string;
  name: string;
  type: string;
  status: string;
}

export default function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
    fetchEvents();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateChallenge = async (challengeData: any) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData)
      });

      if (response.ok) {
        await fetchChallenges();
        setShowCreateModal(false);
      } else {
        const error = await response.json();
        alert(`Error creating challenge: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge');
    }
  };

  const handleEditChallenge = async (challengeData: any) => {
    if (!selectedChallenge) return;

    try {
      const response = await fetch(`/api/challenges/${selectedChallenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData)
      });

      if (response.ok) {
        await fetchChallenges();
        setShowEditModal(false);
        setSelectedChallenge(null);
      } else {
        const error = await response.json();
        alert(`Error updating challenge: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      alert('Failed to update challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchChallenges();
      } else {
        const error = await response.json();
        alert(`Error deleting challenge: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge');
    }
  };

  const handleToggleStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        await fetchChallenges();
      } else {
        const error = await response.json();
        alert(`Error toggling status: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || challenge.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && challenge.isActive) ||
                         (filterStatus === 'inactive' && !challenge.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gamification Challenges</h2>
          <p className="text-gray-600">Manage challenges, events, and competitions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Challenge
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="TEAM">Team</option>
              <option value="MIXED">Mixed</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first challenge'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Challenge
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challenge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{challenge.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {challenge.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        challenge.type === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' :
                        challenge.type === 'TEAM' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {challenge.type === 'INDIVIDUAL' && <Target className="w-3 h-3 mr-1" />}
                        {challenge.type === 'TEAM' && <Users className="w-3 h-3 mr-1" />}
                        {challenge.type === 'MIXED' && <Zap className="w-3 h-3 mr-1" />}
                        {challenge.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        challenge.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {challenge.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {challenge.hasQuiz ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Award className="w-3 h-3 mr-1" />
                          Quiz ({challenge.quiz?.questions?.length || 0} questions)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Quiz
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challenge._count?.submissions || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedChallenge(challenge);
                            setShowPreviewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedChallenge(challenge);
                            setShowEditModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(challenge.id, challenge.isActive)}
                          className={`p-1 ${
                            challenge.isActive 
                              ? 'text-orange-600 hover:text-orange-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={challenge.isActive ? 'Pause' : 'Activate'}
                        >
                          {challenge.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Challenge</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <ChallengeForm
              events={events}
              onSubmit={handleCreateChallenge}
              onCancel={() => setShowCreateModal(false)}
              isEditing={false}
            />
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {showEditModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Challenge: {selectedChallenge.name}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChallenge(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <ChallengeForm
              challenge={selectedChallenge}
              events={events}
              onSubmit={handleEditChallenge}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedChallenge(null);
              }}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Challenge Preview Modal */}
      {showPreviewModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Challenge Preview: {selectedChallenge.name}</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedChallenge(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedChallenge.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="ml-2 text-sm text-gray-900 mt-1">{selectedChallenge.description}</p>
                  </div>
                </div>
              </div>

              {/* Challenge Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Challenge Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedChallenge.type === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-800' :
                      selectedChallenge.type === 'TEAM' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedChallenge.type === 'INDIVIDUAL' && <Target className="w-3 h-3 mr-1" />}
                      {selectedChallenge.type === 'TEAM' && <Users className="w-3 h-3 mr-1" />}
                      {selectedChallenge.type === 'MIXED' && <Zap className="w-3 h-3 mr-1" />}
                      {selectedChallenge.type}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedChallenge.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {selectedChallenge.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Start Date:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(selectedChallenge.startDate).toLocaleDateString()} at {new Date(selectedChallenge.startDate).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">End Date:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(selectedChallenge.endDate).toLocaleDateString()} at {new Date(selectedChallenge.endDate).toLocaleTimeString()}
                    </span>
                  </div>

                  {selectedChallenge.maxParticipants && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Max Participants:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedChallenge.maxParticipants}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Submissions:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedChallenge._count?.submissions || 0}</span>
                  </div>
                </div>
              </div>

              {/* Rules */}
              {selectedChallenge.rules && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Challenge Rules</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedChallenge.rules.timeLimit && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Time Limit:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedChallenge.rules.timeLimit} minutes</span>
                      </div>
                    )}
                    {selectedChallenge.rules.maxAttempts && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Max Attempts:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedChallenge.rules.maxAttempts}</span>
                      </div>
                    )}
                    {selectedChallenge.rules.requiredScore && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Required Score:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedChallenge.rules.requiredScore}%</span>
                      </div>
                    )}
                    {selectedChallenge.rules.teamSize && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Team Size:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedChallenge.rules.teamSize} members</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rewards */}
              {selectedChallenge.rewards && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Rewards</h4>
                  <div className="space-y-3">
                    {selectedChallenge.rewards.points && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Points:</span>
                        <span className="ml-2 text-sm text-gray-900 font-medium">{selectedChallenge.rewards.points}</span>
                      </div>
                    )}
                    
                    {selectedChallenge.rewards.badges && selectedChallenge.rewards.badges.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Badges:</span>
                        <div className="ml-2 mt-1 flex flex-wrap gap-1">
                          {selectedChallenge.rewards.badges.map((badge: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedChallenge.rewards.achievements && selectedChallenge.rewards.achievements.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Achievements:</span>
                        <div className="ml-2 mt-1 flex flex-wrap gap-1">
                          {selectedChallenge.rewards.achievements.map((achievement: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedChallenge.rewards.specialRewards && selectedChallenge.rewards.specialRewards.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Special Rewards:</span>
                        <div className="ml-2 mt-1 flex flex-wrap gap-1">
                          {selectedChallenge.rewards.specialRewards.map((reward: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {reward}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Information */}
              {selectedChallenge.hasQuiz && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Quiz Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Questions:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedChallenge.quiz?.questions?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Points:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedChallenge.quiz?.totalPoints || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Passing Score:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedChallenge.quiz?.passingScore || 70}%</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Quiz Type:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {(selectedChallenge.quiz?.questions?.length || 0) > 0 ? 'Interactive Quiz' : 'No Questions'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedChallenge.quiz?.questions && selectedChallenge.quiz.questions.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-500">Question Types:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Array.from(new Set(selectedChallenge.quiz.questions.map((q: any) => q.type))).map((type: string) => (
                          <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Event Association */}
              {selectedChallenge.event && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Event Association</h4>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Event:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedChallenge.event.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({selectedChallenge.event.type})</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedChallenge(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
