"use client";
import { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Lock, Unlock, AlertCircle } from 'lucide-react';

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    topics: Array<{
      id: string;
      title: string;
      accessControl?: {
        isUnlocked: boolean;
        unlockDate?: string;
        lockDate?: string;
      };
    }>;
  } | null;
  onSave: (accessData: any) => void;
}

export default function AccessControlModal({ isOpen, onClose, course, onSave }: AccessControlModalProps) {
  const [accessData, setAccessData] = useState<{ [topicId: string]: any }>({});
  const [timezone, setTimezone] = useState('Asia/Almaty'); // Kazakhstan timezone

  useEffect(() => {
    if (course && isOpen) {
      const initialData: { [topicId: string]: any } = {};
      course.topics.forEach(topic => {
        initialData[topic.id] = {
          isUnlocked: topic.accessControl?.isUnlocked || false,
          unlockDate: topic.accessControl?.unlockDate || '',
          lockDate: topic.accessControl?.lockDate || ''
        };
      });
      setAccessData(initialData);
    }
  }, [course, isOpen]);

  const handleSave = () => {
    onSave(accessData);
    onClose();
  };

  const updateTopicAccess = (topicId: string, field: string, value: any) => {
    setAccessData(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [field]: value
      }
    }));
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Access Control - {course.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Almaty">Asia/Almaty (Kazakhstan)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="space-y-6">
            {course.topics.map((topic) => (
              <div key={topic.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">{topic.title}</h3>
                  <div className="flex items-center space-x-2">
                    {accessData[topic.id]?.isUnlocked ? (
                      <Unlock className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      accessData[topic.id]?.isUnlocked ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {accessData[topic.id]?.isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={accessData[topic.id]?.isUnlocked ? 'unlocked' : 'locked'}
                      onChange={(e) => updateTopicAccess(topic.id, 'isUnlocked', e.target.value === 'unlocked')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="locked">Locked</option>
                      <option value="unlocked">Unlocked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Unlock Date
                    </label>
                    <input
                      type="datetime-local"
                      value={accessData[topic.id]?.unlockDate || ''}
                      onChange={(e) => updateTopicAccess(topic.id, 'unlockDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Lock Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={accessData[topic.id]?.lockDate || ''}
                      onChange={(e) => updateTopicAccess(topic.id, 'lockDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Access Control Rules:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Unlock Date: When students can start accessing this topic</li>
                        <li>• Lock Date: When students lose access (leave empty for permanent access)</li>
                        <li>• All times are in {timezone} timezone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
