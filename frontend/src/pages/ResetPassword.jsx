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

      // Redirect to login after 3 seconds
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
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset Successful!
          </h2>

          <p className="text-gray-600 mb-8">
            Your password has been reset successfully. You will be redirected to the login page in a few seconds...
          </p>

          <Link to="/login">
            <Button className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Reset Link
          </h2>

          <p className="text-gray-600 mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>

          <Link to="/forgot-password">
            <Button className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark with Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1f36] relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="none">
            <line x1="0" y1="400" x2="300" y2="800" stroke="#2a3152" strokeWidth="100" />
            <line x1="100" y1="0" x2="400" y2="400" stroke="#2a3152" strokeWidth="80" />
            <line x1="400" y1="600" x2="600" y2="800" stroke="#BFFF00" strokeWidth="60" />
          </svg>
        </div>

        <div className="relative z-10 p-12 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-20">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 8L20 20L32 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-white text-xl font-semibold">Zapiio</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-light text-lime-400 italic mb-2">Create a</h1>
            <h2 className="text-5xl font-bold text-white mb-6">New Password</h2>
            <p className="text-gray-300 text-lg max-w-md">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          <div className="mt-8">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#BFFF00" strokeWidth="2" />
              <path d="M12 12L20 20L12 28" stroke="#BFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M28 12L20 20L28 28" stroke="#BFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset your password
          </h2>
          <p className="text-gray-600 mb-8">
            Please enter your new password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-14 h-12 bg-lime-50 border-lime-200"
                  placeholder="Enter new password"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-14 h-12 bg-lime-50 border-lime-200"
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
              className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
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
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
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
