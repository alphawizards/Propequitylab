import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Clerk handles password reset via its own SignIn flow.
// Any direct visits to /forgot-password are redirected to /login.
const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default ForgotPassword;
