'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 text-center mb-1">Reset Password</h2>
      <p className="text-xs text-slate-400 text-center mb-6">Enter your email to receive password reset instructions</p>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
            If an account exists for {email}, a password reset link has been dispatched.
          </div>
          <Link href="/login">
            <Button className="w-full">Return to Sign In</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registered Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <Button type="submit" className="w-full">
            Send Reset Instructions
          </Button>

          <div className="text-center text-xs text-slate-400 mt-4">
            Remembered your password?{' '}
            <Link href="/login" className="text-blue-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
