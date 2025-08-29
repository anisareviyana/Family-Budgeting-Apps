import React, { useState, useRef } from 'react';
import Card from './ui/Card';
import { UserCircle, Camera, Key, ShieldCheck, LogOut, Trash } from './ui/Icons';
import type { User, Settings } from '../types';
import { CURRENCIES } from '../constants';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, theme, onToggleTheme, settings, onSettingsChange, onLogout, onDeleteAccount }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'prefs' | 'security'>('profile');
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, name, email, phone });
    alert('Profile updated successfully!');
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.passwordHash !== currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password does not match.'});
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.'});
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.'});
      return;
    }
    onUpdateUser({ ...user, passwordHash: newPassword });
    setPasswordMessage({ type: 'success', text: 'Password changed successfully!'});
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const TabButton = ({ tab, label }: {tab: 'profile' | 'prefs' | 'security', label: string}) => (
    <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <Card className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-200 dark:ring-primary-800" />
          ) : (
            <UserCircle className="h-24 w-24 text-gray-400" />
          )}
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-transform transform hover:scale-110">
            <Camera className="h-4 w-4" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePictureChange} accept="image/*" className="hidden" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </Card>

      <div className="flex justify-center space-x-2 border-b dark:border-gray-700 pb-2">
        <TabButton tab="profile" label="Profile Details" />
        <TabButton tab="prefs" label="Preferences" />
        <TabButton tab="security" label="Security" />
      </div>

      <div>
        {activeTab === 'profile' && (
          <Card>
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg mx-auto">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (Optional)</label>
                {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              {/* FIX: Replaced custom btn-primary class with Tailwind utility classes for consistency and to fix the jsx style error. */}
              <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium">Save Changes</button>
            </form>
          </Card>
        )}
        
        {activeTab === 'prefs' && (
          <Card>
            <div className="space-y-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold">App Preferences</h3>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <div className="flex items-center space-x-2">
                        <span>Light</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={theme === 'dark'} onChange={onToggleTheme} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                        <span>Dark</span>
                    </div>
                </div>
                 <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                    {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                    <select id="currency" value={settings.currency} onChange={e => onSettingsChange({ ...settings, currency: e.target.value })} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                    </select>
                </div>
            </div>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <div className="space-y-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold flex items-center"><ShieldCheck className="h-5 w-5 mr-2 text-primary-500" />Security Settings</h3>
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <p className="text-sm font-medium">Last Login:</p>
                    <p className="text-gray-500 dark:text-gray-400">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h4 className="font-semibold flex items-center"><Key className="h-4 w-4 mr-2" />Change Password</h4>
                  <div>
                    <label className="block text-sm font-medium">Current Password</label>
                    {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                   <div>
                    <label className="block text-sm font-medium">New Password</label>
                    {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                   <div>
                    <label className="block text-sm font-medium">Confirm New Password</label>
                    {/* FIX: Replaced custom form-input class with Tailwind utility classes for consistency and to fix the jsx style error. */}
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  {passwordMessage.text && <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{passwordMessage.text}</p>}
                  {/* FIX: Replaced custom btn-primary class with Tailwind utility classes and removed the now-unused style jsx block. */}
                  <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium">Update Password</button>
                </form>
            </div>
          </Card>
        )}
      </div>
      
      <Card className="space-y-4">
        <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
        </button>
        <button onClick={onDeleteAccount} className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/50 dark:hover:bg-red-900 transition">
            <Trash className="h-5 w-5" />
            <span>Delete Account</span>
        </button>
      </Card>
    </div>
  );
};

export default ProfilePage;
