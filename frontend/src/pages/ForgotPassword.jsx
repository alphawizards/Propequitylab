import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-modal p-10">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-[#111111] mb-4">
              Check your email
            </h2>

            <p className="text-[#6B7280] mb-8">
              We've sent a password reset link to <span className="font-medium text-[#111111]">{email}</span>.
              Please check your inbox and follow the instructions to reset your password.
            </p>

            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium rounded-lg transition-all duration-150">
                  Back to Login
                </Button>
              </Link>

              <p className="text-sm text-[#6B7280]">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-150"
                >
                  try again
                </button>
              </p>
            </div>
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
          <Link to="/login" className="inline-flex items-center text-sm text-[#6B7280] hover:text-[#111111] mb-8 transition-colors duration-150">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <h2 className="text-2xl font-semibold text-[#111111] mb-2">
            Reset your password
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#111111]">Email Address</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#6B7280]" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-[#EAEAEA] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg"
                  placeholder="Enter your email"
                  autoFocus
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
