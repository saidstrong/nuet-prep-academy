"use client";
import { useState, useEffect } from 'react';
import {
  Settings, Save, RefreshCw, Globe, Mail, Shield, Bell, 
  Database, Server, Key, Users, BookOpen, DollarSign,
  AlertCircle, CheckCircle, Clock, Eye, EyeOff, Lock, Trophy, BarChart3
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    twoFactorAuth: boolean;
  };
  features: {
    enableChat: boolean;
    enableGamification: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enablePayments: boolean;
  };
  payments: {
    stripePublicKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    currency: string;
    taxRate: number;
  };
}

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'NUET Prep Academy',
      siteDescription: 'Online learning platform for NUET preparation',
      siteUrl: 'https://nuet-prep.com',
      timezone: 'Asia/Almaty',
      language: 'en',
      maintenanceMode: false
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@nuet-prep.com',
      fromName: 'NUET Prep Academy'
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      twoFactorAuth: false
    },
    features: {
      enableChat: true,
      enableGamification: true,
      enableNotifications: true,
      enableAnalytics: true,
      enablePayments: true
    },
    payments: {
      stripePublicKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      currency: 'USD',
      taxRate: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security' | 'features' | 'payments'>('general');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">System Settings</h3>
          <p className="text-sm text-slate-600">Configure platform settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchSettings}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'features', label: 'Features', icon: Settings },
          { id: 'payments', label: 'Payments', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900">General Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings?.general?.siteName || 'NUET Prep Academy'}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site URL</label>
                <input
                  type="url"
                  value={settings.general.siteUrl}
                  onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Description</label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Almaty">Asia/Almaty (Kazakhstan)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select
                  value={settings.general.language}
                  onChange={(e) => updateSetting('general', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                  <option value="kk">Kazakh</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 text-sm text-slate-700">
                    Enable maintenance mode
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900">Email Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Password</label>
                <div className="relative">
                  <input
                    type={showSecrets.smtpPassword ? 'text' : 'password'}
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('smtpPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showSecrets.smtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900">Security Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password Min Length</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-slate-700">
                    Require email verification for new users
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-slate-700">
                    Enable two-factor authentication
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900">Feature Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-slate-900">Chat System</h5>
                    <p className="text-sm text-slate-600">Enable real-time messaging between users</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.enableChat}
                  onChange={(e) => updateSetting('features', 'enableChat', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h5 className="font-medium text-slate-900">Gamification</h5>
                    <p className="text-sm text-slate-600">Enable points, badges, and leaderboards</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.enableGamification}
                  onChange={(e) => updateSetting('features', 'enableGamification', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-green-600" />
                  <div>
                    <h5 className="font-medium text-slate-900">Notifications</h5>
                    <p className="text-sm text-slate-600">Enable push and email notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.enableNotifications}
                  onChange={(e) => updateSetting('features', 'enableNotifications', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <h5 className="font-medium text-slate-900">Analytics</h5>
                    <p className="text-sm text-slate-600">Enable usage tracking and analytics</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.enableAnalytics}
                  onChange={(e) => updateSetting('features', 'enableAnalytics', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <h5 className="font-medium text-slate-900">Payments</h5>
                    <p className="text-sm text-slate-600">Enable payment processing for courses</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.enablePayments}
                  onChange={(e) => updateSetting('features', 'enablePayments', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="p-6 space-y-6">
            <h4 className="text-lg font-semibold text-slate-900">Payment Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stripe Public Key</label>
                <input
                  type="text"
                  value={settings.payments.stripePublicKey}
                  onChange={(e) => updateSetting('payments', 'stripePublicKey', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stripe Secret Key</label>
                <div className="relative">
                  <input
                    type={showSecrets.stripeSecretKey ? 'text' : 'password'}
                    value={settings.payments.stripeSecretKey}
                    onChange={(e) => updateSetting('payments', 'stripeSecretKey', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('stripeSecretKey')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showSecrets.stripeSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stripe Webhook Secret</label>
                <div className="relative">
                  <input
                    type={showSecrets.stripeWebhookSecret ? 'text' : 'password'}
                    value={settings.payments.stripeWebhookSecret}
                    onChange={(e) => updateSetting('payments', 'stripeWebhookSecret', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('stripeWebhookSecret')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showSecrets.stripeWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select
                  value={settings.payments.currency}
                  onChange={(e) => updateSetting('payments', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="KZT">KZT (Kazakhstani Tenge)</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.payments.taxRate}
                  onChange={(e) => updateSetting('payments', 'taxRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
