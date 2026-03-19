import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(password)) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Password reset successful! You can now log in with your new password.'
          }
        });
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to reset password. The link may be expired or invalid.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-modal p-10 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-[#111111] mb-4">
              Password Reset Successful!
            </h2>

            <p className="text-[#6B7280] mb-8">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>

            <Link to="/login">
              <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium rounded-lg transition-all duration-150">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-modal p-10 text-center">
            <h2 className="text-2xl font-semibold text-[#111111] mb-4">
              Invalid Reset Link
            </h2>

            <p className="text-[#6B7280] mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <Link to="/forgot-password">
              <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium rounded-lg transition-all duration-150">
                Request New Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 8L20 20L32 32" stroke="#111111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-semibold text-[#111111]">PropEquityLab</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-modal p-10">
          <h2 className="text-2xl font-semibold text-[#111111] mb-2">
            Reset your password
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            Please enter your new password
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-[#111111]">New Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#6B7280]" />
                </div>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-11 border-[#EAEAEA] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
                  placeholder="Enter new password"
                  autoFocus
                />
              </div>
              <p className="text-xs text-[#6B7280]">
                8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#111111]">Confirm Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#6B7280]" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-11 border-[#EAEAEA] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium rounded-lg disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-[#6B7280] hover:text-[#111111] transition-colors duration-150">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
