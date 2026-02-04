import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setStatus('error');
      setError('No verification token provided');
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      await verifyEmail(token);
      setStatus('success');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Email verified successfully! You can now log in.'
          }
        });
      }, 3000);
    } catch (err) {
      setStatus('error');
      const errorMessage = err.response?.data?.detail || 'Verification failed. The link may be expired or invalid.';
      setError(errorMessage);
      setShowResend(true);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();

    if (!resendEmail || !/\S+@\S+\.\S+/.test(resendEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      await resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <Loader2 className="w-16 h-16 text-lime-500 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verifying your email...
          </h2>

          <p className="text-gray-600">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified!
          </h2>

          <p className="text-gray-600 mb-8">
            Your email has been successfully verified. You can now log in to your account.
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

  // Error state with resend option
  if (resendSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Email Sent
          </h2>

          <p className="text-gray-600 mb-8">
            We've sent a new verification email to <span className="font-semibold">{resendEmail}</span>.
            Please check your inbox and click the verification link.
          </p>

          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800">
                Go to Login
              </Button>
            </Link>

            <p className="text-sm text-gray-500">
              Didn't receive it? Check your spam folder or wait a few minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Failed
          </h2>

          <p className="text-gray-600 mb-2">
            {error}
          </p>
          <p className="text-gray-600 mb-8">
            The verification link may have expired or is invalid.
          </p>
        </div>

        {showResend && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resend Verification Email
            </h3>

            <form onSubmit={handleResend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resendEmail">Email Address</Label>
                <Input
                  id="resendEmail"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="h-12"
                  placeholder="Enter your email"
                  autoFocus
                />
              </div>

              {error && status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={resendLoading}
                className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
