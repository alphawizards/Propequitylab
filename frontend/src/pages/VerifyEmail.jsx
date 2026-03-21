import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Clerk handles email verification natively.
// Any direct visits to /verify-email are redirected to /login.
const VerifyEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default VerifyEmail;
