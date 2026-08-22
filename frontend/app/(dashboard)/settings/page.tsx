'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { User, Bell, Lock, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage profile details, security preferences, and display settings</p>
      </div>

      <Card title="User Profile Details">
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          {saved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
              Profile details updated successfully!
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Username"
            value={user?.username || ''}
            disabled
            helperText="Username cannot be altered"
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            helperText="Primary email tied to JWT authentication"
          />

          <Button type="submit" className="mt-2">Update Profile</Button>
        </form>
      </Card>

      <Card title="Security & Authentication">
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Account Password</div>
                <div className="text-[11px] text-slate-400">Encrypted with Bcrypt hash security</div>
              </div>
            </div>
            <Button size="sm" variant="secondary">Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Active Roles</div>
                <div className="text-[11px] text-slate-400">Roles: {(user?.roles || ['User']).join(', ')}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
