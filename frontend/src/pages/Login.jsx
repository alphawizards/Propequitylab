import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center gap-2 mb-8">
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8L20 20L8 32" style={{ stroke: 'oklch(var(--sage))' }} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 8L20 20L32 32" style={{ stroke: 'oklch(var(--ink))' }}  strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xl font-semibold text-foreground">PropEquityLab</span>
      </div>

      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/register"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'rounded-2xl border border-border shadow-modal',
            formButtonPrimary: 'bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-150',
            footerActionLink: 'text-sage hover:text-sage/80',
          },
        }}
      />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/legal/privacy" className="hover:text-foreground transition-colors duration-150">Privacy Policy</Link>
        <span className="mx-2">·</span>
        <Link to="/legal/terms" className="hover:text-foreground transition-colors duration-150">Terms of Service</Link>
      </div>
    </div>
  );
};

export default Login;
