import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1f36] relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 8L20 20L32 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white text-xl font-semibold">PropEquityLab</span>
        </div>
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-gray-900 rounded-full px-6"
        >
          Sign In
        </Button>
      </nav>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center mt-16 px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L20 20L8 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 8L20 20L32 32" stroke="#BFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-lime-400 text-3xl font-semibold">propequitylab</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white italic mb-4">
          Smart tools for smart investing.
        </h1>
        
        <p className="text-xl text-gray-300 italic mb-4">
          Elevate Your Service. Transform Client Success.
        </p>
        
        <p className="text-gray-400 max-w-3xl mx-auto mb-12">
          PropEquityLab is the intelligent platform that empowers buyer's agents, mortgage brokers, and serious
          investors to navigate the property market with unparalleled clarity, strategic insight, and complete
          confidence.
        </p>
      </div>
      
      {/* Hero Image - Tablet with Dashboard */}
      <div className="relative z-10 flex justify-center mt-8">
        <div className="relative">
          {/* Tablet Frame */}
          <div className="bg-gray-800 rounded-3xl p-4 shadow-2xl transform perspective-1000 rotate-x-6">
            <div className="bg-white rounded-2xl overflow-hidden w-72 h-48 md:w-96 md:h-64">
              {/* Mini Dashboard Preview */}
              <div className="p-3 bg-white h-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-lime-400"></div>
                  <span className="text-xs text-gray-600">Live Preview</span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  <div className="bg-blue-100 rounded p-1 text-center">
                    <div className="text-xs font-bold">3</div>
                    <div className="text-[8px] text-gray-500">Props</div>
                  </div>
                  <div className="bg-green-100 rounded p-1 text-center">
                    <div className="text-xs font-bold">4.04</div>
                    <div className="text-[8px] text-gray-500">Value</div>
                  </div>
                  <div className="bg-gray-100 rounded p-1 text-center">
                    <div className="text-xs font-bold">3.1</div>
                    <div className="text-[8px] text-gray-500">Debt</div>
                  </div>
                  <div className="bg-yellow-100 rounded p-1 text-center">
                    <div className="text-xs font-bold">0.94</div>
                    <div className="text-[8px] text-gray-500">Equity</div>
                  </div>
                </div>
                {/* Mini Chart */}
                <div className="h-16 bg-gray-50 rounded flex items-end p-2">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <path d="M0,25 Q20,20 40,15 T80,8 T100,5" fill="none" stroke="#BFFF00" strokeWidth="2" />
                    <path d="M0,28 Q20,25 40,22 T80,18 T100,15" fill="none" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2,2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hand holding tablet - simplified representation */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-12 bg-gradient-to-t from-[#d4a574] to-[#e8c4a0] rounded-t-full opacity-90"></div>
        </div>
      </div>
      
      {/* Decorative Arrows */}
      <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <polygon points="0,200 80,200 40,120" fill="#BFFF00" />
          <polygon points="20,200 120,200 70,80" fill="none" stroke="#BFFF00" strokeWidth="2" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <polygon points="200,200 120,200 160,120" fill="#BFFF00" />
          <polygon points="180,200 80,200 130,80" fill="none" stroke="#BFFF00" strokeWidth="2" />
        </svg>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(#BFFF00 1px, transparent 1px), linear-gradient(90deg, #BFFF00 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Bottom Logo */}
      <div className="fixed bottom-6 left-6 z-20">
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="#BFFF00" strokeWidth="2" />
          <path d="M12 12L20 20L12 28" stroke="#BFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28 12L20 20L28 28" stroke="#BFFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Landing;
