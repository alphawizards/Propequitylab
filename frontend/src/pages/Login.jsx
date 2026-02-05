import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for success message from registration
  const successMessage = location.state?.message;
  const prefilledEmail = location.state?.email || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Dark with Welcome */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1f36] relative overflow-hidden">
        {/* Diagonal Lines */}
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
              <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M32 8L20 20L32 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-xl font-semibold">PropEquityLab</span>
          </div>

          {/* Welcome Text */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-light text-lime-400 italic mb-2">Hello,</h1>
            <h2 className="text-5xl font-bold text-white">Welcome!</h2>
          </div>

          {/* Signup Options */}
          <div className="space-y-4">
            <p className="text-white font-semibold">Not a Member?</p>
            <p className="text-lime-400 text-sm">Sign up to get started with PropEquityLab</p>

            <div className="space-y-3 mt-6">
              <div className="border border-teal-500 rounded-lg p-4 flex items-center justify-between bg-[#1a1f36]/50 backdrop-blur">
                <div>
                  <p className="text-lime-400 font-bold text-sm">PROFESSIONALS</p>
                  <p className="text-gray-400 text-sm">Help clients plan, track, and invest with clarity.</p>
                </div>
                <Button className="bg-lime-400 text-gray-900 hover:bg-lime-500 font-semibold">
                  JOIN NOW
                </Button>
              </div>

              <div className="border border-teal-500 rounded-lg p-4 flex items-center justify-between bg-[#1a1f36]/50 backdrop-blur">
                <div>
                  <p className="text-lime-400 font-bold text-sm">PRIVATE INVESTORS</p>
                  <p className="text-gray-400 text-sm">Manage your property portfolio and plan your next move.</p>
                </div>
                <Button className="bg-lime-400 text-gray-900 hover:bg-lime-500 font-semibold">
                  JOIN NOW
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Logo */}
          <div className="mt-8">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#BFFF00" strokeWidth="2" />
              <path d="M12 12L20 20L12 28" stroke="#BFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 12L20 20L28 28" stroke="#BFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Login to your Account
          </h2>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 h-12 bg-gray-50 border-gray-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 h-12 bg-lime-50 border-lime-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-500">
        <Link to="/legal/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        <span className="mx-2">|</span>
        <Link to="/legal/terms" className="hover:text-gray-700">Terms of Service</Link>
      </div>
    </div>
  );
};

export default Login;
