import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8L20 20L8 32" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 8L20 20L32 32" stroke="#111111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xl font-semibold text-[#111111]">PropEquityLab</span>
      </div>

      <SignUp
        routing="path"
        path="/register"
        signInUrl="/login"
        afterSignUpUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'rounded-2xl border border-[#EAEAEA] shadow-modal',
            formButtonPrimary:
              'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-150',
            footerActionLink: 'text-emerald-600 hover:text-emerald-700',
          },
        }}
      />

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-[#6B7280]">
        <Link to="/legal/privacy" className="hover:text-[#111111] transition-colors duration-150">Privacy Policy</Link>
        <span className="mx-2">·</span>
        <Link to="/legal/terms" className="hover:text-[#111111] transition-colors duration-150">Terms of Service</Link>
      </div>
    </div>
  );
};

export default Register;
