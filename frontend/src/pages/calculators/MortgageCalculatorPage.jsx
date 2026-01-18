/**
 * MortgageCalculatorPage
 * SEO-optimized page for mortgage calculator
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MortgageCalculator } from '@/components/calculators/MortgageCalculator/MortgageCalculator';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export function MortgageCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Mortgage Calculator Australia",
    "description": "Free Australian mortgage calculator. Calculate monthly repayments, total interest, and view detailed amortization schedules for home loans.",
    "url": "https://propequitylab.com/calculators/mortgage",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "AUD"
    },
    "featureList": [
      "Calculate monthly mortgage repayments",
      "View amortization schedules",
      "Compare principal vs interest",
      "Estimate LMI costs",
      "Offset account impact analysis"
    ]
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Mortgage Calculator Australia | Free Home Loan Calculator 2026</title>
        <meta
          name="description"
          content="Calculate your Australian mortgage repayments with our free calculator. Get accurate estimates for monthly payments, total interest, LMI, and view detailed amortization schedules."
        />
        <meta
          name="keywords"
          content="mortgage calculator, home loan calculator, mortgage repayment calculator, loan calculator australia, mortgage calculator australia, home loan repayments"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://propequitylab.com/calculators/mortgage" />
        <meta property="og:title" content="Mortgage Calculator Australia | Free Home Loan Calculator" />
        <meta
          property="og:description"
          content="Calculate your Australian mortgage repayments with our free calculator. Get accurate monthly payment estimates and detailed amortization schedules."
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://propequitylab.com/calculators/mortgage" />
        <meta property="twitter:title" content="Mortgage Calculator Australia | Free Home Loan Calculator" />
        <meta
          property="twitter:description"
          content="Calculate your Australian mortgage repayments with our free calculator. Get accurate monthly payment estimates."
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://propequitylab.com/calculators/mortgage" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <MortgageCalculator />

        {/* Rich SEO Content Below Calculator */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <article className="prose lg:prose-xl max-w-none bg-white rounded-lg p-8">
            <h2>Understanding Mortgage Calculators in Australia</h2>
            <p>
              A mortgage calculator is an essential tool for anyone looking to buy property in Australia.
              Whether you're a first home buyer or an experienced investor, understanding your potential
              repayments is crucial for financial planning.
            </p>

            <h3>How Australian Mortgage Calculations Work</h3>
            <p>
              Australian home loans typically use a reducing balance calculation method, where interest
              is calculated daily on the outstanding loan balance. This means as you pay down your loan,
              the interest portion of your repayment decreases while the principal portion increases.
            </p>

            <h3>Key Terms Explained</h3>
            <dl className="space-y-4">
              <div>
                <dt className="font-bold text-gray-900">Principal:</dt>
                <dd className="text-gray-700 ml-4">The original amount you borrow from the lender.</dd>
              </div>

              <div>
                <dt className="font-bold text-gray-900">Interest Rate:</dt>
                <dd className="text-gray-700 ml-4">The annual percentage charged by the lender, typically expressed as a comparison rate in Australia.</dd>
              </div>

              <div>
                <dt className="font-bold text-gray-900">LVR (Loan-to-Value Ratio):</dt>
                <dd className="text-gray-700 ml-4">Your loan amount divided by the property value, expressed as a percentage.</dd>
              </div>

              <div>
                <dt className="font-bold text-gray-900">LMI (Lenders Mortgage Insurance):</dt>
                <dd className="text-gray-700 ml-4">Insurance required when your LVR exceeds 80%, protecting the lender if you default.</dd>
              </div>

              <div>
                <dt className="font-bold text-gray-900">Offset Account:</dt>
                <dd className="text-gray-700 ml-4">A transaction account linked to your mortgage that reduces the interest charged.</dd>
              </div>
            </dl>

            <h3>Typical Australian Mortgage Rates (2026)</h3>
            <p>
              As of January 2026, Australian mortgage rates typically range from:
            </p>
            <ul>
              <li><strong>Variable rates:</strong> 5.5% - 7.0% p.a.</li>
              <li><strong>Fixed rates (1-5 years):</strong> 5.8% - 6.8% p.a.</li>
              <li><strong>Investment property rates:</strong> Typically 0.2-0.5% higher than owner-occupied</li>
            </ul>

            <h3>Factors That Affect Your Mortgage Repayments</h3>
            <ol>
              <li><strong>Loan Amount:</strong> The more you borrow, the higher your repayments</li>
              <li><strong>Interest Rate:</strong> Even 0.25% can significantly impact total interest paid</li>
              <li><strong>Loan Term:</strong> Longer terms = lower monthly payments but more total interest</li>
              <li><strong>Repayment Frequency:</strong> Fortnightly payments can save thousands in interest</li>
              <li><strong>Offset Accounts:</strong> Reduces interest charged on your loan balance</li>
              <li><strong>Extra Repayments:</strong> Can significantly reduce loan term and total interest</li>
            </ol>

            <h3>Frequently Asked Questions</h3>

            <h4>What's the difference between principal & interest vs interest-only?</h4>
            <p>
              <strong>Principal & Interest (P&I):</strong> Your repayments cover both the loan amount and interest,
              gradually reducing your debt over time. This is the standard repayment method.
            </p>
            <p>
              <strong>Interest-Only (IO):</strong> You only pay the interest for a set period (usually 1-5 years),
              with the loan balance remaining unchanged. After the IO period, repayments increase as you start
              paying off principal. Often used by investors for tax benefits.
            </p>

            <h4>How much deposit do I need?</h4>
            <p>
              Most lenders require a minimum 5-20% deposit:
            </p>
            <ul>
              <li><strong>20%+ deposit:</strong> No LMI required, best interest rates</li>
              <li><strong>10-20% deposit:</strong> LMI required, good interest rates</li>
              <li><strong>5-10% deposit:</strong> Higher LMI, stricter lending criteria</li>
              <li><strong>First Home Buyer schemes:</strong> May allow as low as 5% with government guarantee</li>
            </ul>

            <h4>What is LMI and how much does it cost?</h4>
            <p>
              Lenders Mortgage Insurance (LMI) protects the lender if you default on your loan. It's typically
              required when your LVR exceeds 80%. Costs vary significantly:
            </p>
            <ul>
              <li><strong>85% LVR:</strong> Approximately 1-2% of loan amount</li>
              <li><strong>90% LVR:</strong> Approximately 2-3% of loan amount</li>
              <li><strong>95% LVR:</strong> Approximately 3-6% of loan amount</li>
            </ul>
            <p>
              LMI can be capitalized (added to your loan) or paid upfront. The exact cost depends on your loan
              amount, LVR, and lender.
            </p>

            <h3>Tips to Reduce Your Mortgage Repayments</h3>
            <ol>
              <li><strong>Make extra repayments:</strong> Even $100/month extra can save tens of thousands in interest</li>
              <li><strong>Pay fortnightly instead of monthly:</strong> Results in 13 monthly payments per year instead of 12</li>
              <li><strong>Use an offset account:</strong> Reduces interest charged without losing liquidity</li>
              <li><strong>Refinance for better rates:</strong> Shop around every 2-3 years</li>
              <li><strong>Negotiate with your lender:</strong> Many lenders will reduce rates to retain customers</li>
              <li><strong>Reduce your loan term:</strong> If you can afford higher repayments, save significantly on interest</li>
            </ol>
          </article>

          {/* Related Calculators */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Related Calculators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/calculators/stamp-duty"
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-blue-600 mb-1">Stamp Duty Calculator</h4>
                  <p className="text-sm text-gray-600">Calculate stamp duty for all Australian states</p>
                </Link>
                <Link
                  to="/calculators/equity"
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-blue-600 mb-1">Equity Calculator</h4>
                  <p className="text-sm text-gray-600">Calculate usable equity for investment</p>
                </Link>
                <Link
                  to="/calculators/rental-income"
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-blue-600 mb-1">Rental Income Calculator</h4>
                  <p className="text-sm text-gray-600">Project rental income and expenses</p>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
