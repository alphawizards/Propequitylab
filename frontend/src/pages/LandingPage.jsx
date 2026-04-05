import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Building2, Calculator, Shield, ChevronRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Property Portfolio Tracking',
    description: 'Track every property you own — purchase price, current value, rental income, and loan details — all in one place.',
  },
  {
    icon: BarChart3,
    title: 'Cash Flow Analysis',
    description: 'See exactly where you stand each month. Income vs. expenses, yield calculations, and cash flow per property.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Projections',
    description: 'Model your portfolio growth over 5, 10, or 20 years. Visualise when you hit your net worth and passive income targets.',
  },
  {
    icon: Calculator,
    title: 'Scenario Modelling',
    description: "Run 'what if' scenarios — buy another property, pay down debt faster, or increase rent — and see the impact instantly.",
  },
];

const benefits = [
  'Built specifically for Australian property investors',
  'Handles PPOR, investment properties, and portfolios of any size',
  'Tracks HECS, margin loans, and all Australian debt types',
  'Secure — your data is encrypted and never sold',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">PropEquityLab</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5" />
            Built for Australian investors
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Know exactly where your
            <span className="text-emerald-600"> property wealth </span>
            is headed
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Track your portfolio, analyse cash flow, model scenarios, and forecast when you'll hit financial freedom — all in one dashboard.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Start for free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to manage your portfolio</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Stop juggling spreadsheets. PropEquityLab gives you a real-time view of your entire investment picture.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Designed for the Australian market</h2>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <p className="text-gray-400 text-sm uppercase tracking-wide font-medium mb-2">Get started in minutes</p>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Free account, no credit card</h3>
            <Link
              to="/register"
              className="block w-full text-center bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors mb-3"
            >
              Create your free account
            </Link>
            <Link
              to="/login"
              className="block w-full text-center border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} PropEquityLab. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/legal/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link to="/calculators/mortgage" className="hover:text-gray-600 transition-colors">Mortgage Calculator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
