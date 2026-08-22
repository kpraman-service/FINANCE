'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user credentials, profile information, and security preferences</p>
      </div>

      <Card title="User Profile Details" subtitle="Update basic information displayed in reports and navbar">
        <form className="space-y-4 pt-2" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
              {profile.first_name ? profile.first_name[0] : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">{user?.username}</div>
              <div className="text-xs text-slate-400">Roles: {(user?.roles || []).join(', ')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />

          <Button type="button" size="sm">Save Profile Changes</Button>
        </form>
      </Card>

      <Card title="Security & Password" subtitle="Update account password">
        <form className="space-y-4 pt-2" onSubmit={(e) => e.preventDefault()}>
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Button type="button" variant="secondary" size="sm" className="gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Update Security Key</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
