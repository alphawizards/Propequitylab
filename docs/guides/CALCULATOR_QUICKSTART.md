# Calculator Implementation Quick Start
## Get Your First Calculator Live in 1 Week

**Goal:** Launch mortgage calculator on PropEquityLab.com in 7 days

---

## Day 1: Setup (2 hours)

### Install Dependencies

```bash
cd frontend
npm install decimal.js
npm install --save-dev @types/decimal.js
```

### Create Utility Files

**File:** `frontend/src/lib/financial/decimal.ts`

```typescript
import Decimal from 'decimal.js';

// Configure Decimal for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function dollarsToCents(dollars: number): number {
  return new Decimal(dollars).times(100).round().toNumber();
}

export function centsToDollars(cents: number): number {
  return new Decimal(cents).div(100).toNumber();
}

export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function basisPointsToRate(basisPoints: number): Decimal {
  return new Decimal(basisPoints).div(10000);
}
```

---

## Day 2-3: Core Logic (4 hours)

**File:** `frontend/src/lib/calculators/mortgage.ts`

```typescript
import { Decimal, basisPointsToRate } from '../financial/decimal';

export interface MortgageResult {
  monthlyPayment: number;      // in cents
  annualPayment: number;       // in cents
  totalPaid: number;           // in cents
  totalInterest: number;       // in cents
  totalPrincipal: number;      // in cents
}

/**
 * Calculate Principal & Interest loan repayment
 */
export function calculateMortgageRepayment(
  loanAmount: number,        // in cents
  interestRate: number,      // in basis points (e.g., 650 = 6.5%)
  termYears: number
): MortgageResult {
  const principal = new Decimal(loanAmount);
  const annualRate = basisPointsToRate(interestRate);
  const monthlyRate = annualRate.div(12);
  const numberOfPayments = termYears * 12;

  // Safety check for zero/negative rates
  if (monthlyRate.lte(0)) {
    const monthlyPayment = principal.div(numberOfPayments).round();
    const totalPaid = monthlyPayment.times(numberOfPayments);
    return {
      monthlyPayment: monthlyPayment.toNumber(),
      annualPayment: monthlyPayment.times(12).toNumber(),
      totalPaid: totalPaid.toNumber(),
      totalInterest: 0,
      totalPrincipal: totalPaid.toNumber(),
    };
  }

  // Standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
  const onePlusRPowerN = new Decimal(1).plus(monthlyRate).pow(numberOfPayments);
  const numerator = principal.times(monthlyRate).times(onePlusRPowerN);
  const denominator = onePlusRPowerN.minus(1);
  const monthlyPayment = numerator.div(denominator).round();

  const totalPaid = monthlyPayment.times(numberOfPayments);
  const totalInterest = totalPaid.minus(principal);

  return {
    monthlyPayment: monthlyPayment.toNumber(),
    annualPayment: monthlyPayment.times(12).toNumber(),
    totalPaid: totalPaid.toNumber(),
    totalInterest: totalInterest.toNumber(),
    totalPrincipal: principal.toNumber(),
  };
}

/**
 * Calculate Interest-Only loan repayment
 */
export function calculateInterestOnlyRepayment(
  loanAmount: number,
  interestRate: number
): number {
  const principal = new Decimal(loanAmount);
  const annualRate = basisPointsToRate(interestRate);
  const monthlyRate = annualRate.div(12);
  const interestPayment = principal.times(monthlyRate).round();

  return interestPayment.toNumber();
}
```

---

## Day 4-5: UI Component (6 hours)

**File:** `frontend/src/app/tools/mortgage-calculator/page.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateMortgageRepayment, calculateInterestOnlyRepayment } from '@/lib/calculators/mortgage';
import { dollarsToCents, formatCurrency } from '@/lib/financial/decimal';

export const metadata = {
  title: "Free Mortgage Calculator Australia | PropEquityLab",
  description: "Calculate your mortgage repayments with our free calculator. Supports P&I and interest-only loans. Get instant results for Australian home loans.",
  openGraph: {
    title: "Mortgage Calculator - PropEquityLab",
    description: "Calculate your Australian mortgage repayments instantly",
    images: ["/og-mortgage-calculator.png"],
  },
};

export default function MortgageCalculatorPage() {
  const [propertyValue, setPropertyValue] = useState(800000);
  const [deposit, setDeposit] = useState(160000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [loanStructure, setLoanStructure] = useState<'PI' | 'IO'>('PI');

  const loanAmount = propertyValue - deposit;
  const lvr = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

  const result = useMemo(() => {
    const loanAmountCents = dollarsToCents(loanAmount);
    const interestRateBps = Math.round(interestRate * 100);

    if (loanStructure === 'IO') {
      const monthlyPayment = calculateInterestOnlyRepayment(
        loanAmountCents,
        interestRateBps
      );
      return {
        monthlyPayment,
        annualPayment: monthlyPayment * 12,
        totalPaid: monthlyPayment * 12 * termYears + loanAmountCents,
        totalInterest: monthlyPayment * 12 * termYears,
        totalPrincipal: loanAmountCents,
      };
    }

    return calculateMortgageRepayment(
      loanAmountCents,
      interestRateBps,
      termYears
    );
  }, [loanAmount, interestRate, termYears, loanStructure]);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mortgage Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your home loan repayments with our free Australian mortgage calculator
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>Enter your property and loan information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyValue">Property Value ($)</Label>
              <Input
                id="propertyValue"
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                placeholder="800000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit ($)</Label>
              <Input
                id="deposit"
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                placeholder="160000"
              />
              <p className="text-sm text-muted-foreground">
                LVR: {lvr.toFixed(1)}%
                {lvr > 80 && <span className="text-orange-500 ml-2">⚠️ LMI may apply</span>}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="6.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termYears">Loan Term (years)</Label>
              <Input
                id="termYears"
                type="number"
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanStructure">Loan Structure</Label>
              <Select value={loanStructure} onValueChange={(v) => setLoanStructure(v as 'PI' | 'IO')}>
                <SelectTrigger id="loanStructure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PI">Principal & Interest</SelectItem>
                  <SelectItem value="IO">Interest Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Your Repayments</CardTitle>
            <CardDescription>Based on your loan details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(dollarsToCents(loanAmount))}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Repayment</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(result.monthlyPayment)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Repayment</p>
                <p className="text-lg font-semibold">{formatCurrency(result.annualPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                <p className="text-lg font-semibold">{formatCurrency(result.totalInterest)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Total Amount Payable</p>
              <p className="text-2xl font-bold">{formatCurrency(result.totalPaid)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Over {termYears} years
              </p>
            </div>

            {loanStructure === 'IO' && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  ⚠️ Interest-only: Principal ({formatCurrency(dollarsToCents(loanAmount))}) still owed at end of term
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-sm max-w-none">
        <h2>How to Use the Mortgage Calculator</h2>
        <p>
          Our free mortgage calculator helps Australian property buyers estimate their home loan repayments.
          Simply enter your property value, deposit amount, interest rate, and loan term to get instant results.
        </p>

        <h3>Understanding Your Results</h3>
        <ul>
          <li><strong>Monthly Repayment:</strong> The amount you'll pay each month</li>
          <li><strong>Total Interest:</strong> Total interest paid over the loan term</li>
          <li><strong>LVR (Loan-to-Value Ratio):</strong> Your loan as a percentage of property value</li>
        </ul>

        <h3>Principal & Interest vs. Interest-Only</h3>
        <p>
          <strong>Principal & Interest (P&I):</strong> Each payment reduces your loan balance.
          You own the property outright at the end of the loan term.
        </p>
        <p>
          <strong>Interest-Only (IO):</strong> Lower monthly payments, but loan balance stays the same.
          You'll need to pay off or refinance the principal at the end of the IO period.
        </p>

        <h3>What is LMI?</h3>
        <p>
          Lenders Mortgage Insurance (LMI) is typically required when your LVR exceeds 80%.
          This protects the lender if you default on your loan. LMI can add thousands to your upfront costs.
        </p>
      </div>
    </div>
  );
}
```

---

## Day 6: SEO Optimization (2 hours)

### Create Open Graph Image

Use Canva or Figma to create: `public/og-mortgage-calculator.png`
- Size: 1200x630px
- Text: "Free Mortgage Calculator | PropEquityLab"
- Brand colors
- Clean, professional design

### Add Structured Data

**File:** `frontend/src/app/tools/mortgage-calculator/page.tsx` (add at bottom)

```typescript
export default function MortgageCalculatorPage() {
  // ... existing code

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Mortgage Calculator",
            "description": "Free Australian mortgage calculator for home loan repayments",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "AUD"
            },
            "featureList": [
              "Principal & Interest calculations",
              "Interest-Only calculations",
              "LVR calculator",
              "Australian home loans"
            ]
          })
        }}
      />
      {/* ... rest of component */}
    </>
  );
}
```

---

## Day 7: Launch & Track (2 hours)

### Deploy to Production

```bash
# Build and test
npm run build
npm run start

# Deploy (Vercel)
vercel --prod
```

### Submit to Google

1. **Google Search Console:**
   - Add URL: `https://propequitylab.com/tools/mortgage-calculator`
   - Request indexing

2. **Update Sitemap:**
   ```xml
   <url>
     <loc>https://propequitylab.com/tools/mortgage-calculator</loc>
     <lastmod>2026-01-09</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```

3. **Track in Google Analytics:**
   - Set up event tracking for calculator usage
   - Track "Calculate" button clicks
   - Track time on page

### Share on Social Media

**Twitter/LinkedIn Post:**
```
🏠 Just launched our free Mortgage Calculator for Australians!

✅ P&I and Interest-Only loans
✅ LVR calculation
✅ Instant results
✅ No sign-up required

Calculate your home loan repayments: propequitylab.com/tools/mortgage-calculator

#PropertyInvesting #AustralianProperty #MortgageCalculator
```

---

## Testing Checklist

### Functional Tests

- [ ] Calculator works with default values
- [ ] All inputs accept valid numbers
- [ ] Results update in real-time
- [ ] LVR calculation is correct
- [ ] LMI warning shows when LVR > 80%
- [ ] Interest-only calculation is correct
- [ ] P&I calculation is correct
- [ ] Mobile responsive
- [ ] Dark mode works

### Edge Cases

- [ ] Zero interest rate (should not crash)
- [ ] Very large loan amounts (10M+)
- [ ] Very small loan amounts (10K)
- [ ] 100% deposit (loan amount = 0)
- [ ] 1-year loan term
- [ ] 50-year loan term

### SEO Tests

- [ ] Meta tags are correct
- [ ] Open Graph image loads
- [ ] Structured data validates (Google Rich Results Test)
- [ ] Page loads in <2 seconds
- [ ] Lighthouse score >90

---

## Success Metrics (Track These)

### Week 1
- [ ] Page indexed by Google
- [ ] 10+ organic visitors
- [ ] 0 errors in Search Console

### Week 2-4
- [ ] 100+ organic visitors
- [ ] Ranking in top 50 for "mortgage calculator"
- [ ] 5+ backlinks

### Month 2-3
- [ ] 1,000+ organic visitors/month
- [ ] Ranking in top 20 for target keywords
- [ ] 10+ calculator completions per day

### Month 6
- [ ] 5,000+ organic visitors/month
- [ ] Top 10 ranking for "mortgage calculator Australia"
- [ ] 50+ signups from calculator page

---

## Next Steps After Launch

### Week 2: Add Equity Calculator
- Copy mortgage calculator structure
- Swap logic for equity calculations
- Launch in 2-3 days

### Week 3: Add Stamp Duty Calculator
- Similar structure
- Add state selector
- Launch in 3-4 days

### Month 2: Dashboard Integration
- Use same calculator logic
- Add to property detail pages
- Freemium gates for advanced features

---

## Quick Reference: File Locations

```
frontend/
├── src/
│   ├── lib/
│   │   ├── financial/
│   │   │   └── decimal.ts          ← Start here (Day 1)
│   │   └── calculators/
│   │       └── mortgage.ts         ← Core logic (Day 2-3)
│   │
│   └── app/
│       └── tools/
│           └── mortgage-calculator/
│               └── page.tsx         ← UI component (Day 4-5)
│
└── public/
    └── og-mortgage-calculator.png   ← OG image (Day 6)
```

---

## Common Issues & Solutions

### Issue: Decimal.js not found
```bash
npm install decimal.js @types/decimal.js
```

### Issue: Calculations seem off
- Check you're using cents, not dollars
- Check interest rate is in basis points (650, not 6.5)
- Verify rounding is HALF_UP

### Issue: Page not indexing
- Check robots.txt allows crawling
- Submit sitemap to Google Search Console
- Ensure page is linked from homepage
- Check no `noindex` meta tag

### Issue: Slow page load
- Optimize images (use Next.js Image component)
- Enable React Server Components where possible
- Check bundle size with `npm run analyze`

---

## Support

**Need help?** Check:
1. [CALCULATOR_EXTRACTION_GUIDE.md](CALCULATOR_EXTRACTION_GUIDE.md) - Full documentation
2. [Source Code](https://github.com/alphawizards/Property-Portfolio-Website) - Original implementation
3. This file - Quick start guide

**Questions?** Ask your development team or create an issue.

---

**🚀 You're ready! Start with Day 1 and launch your first calculator in 7 days.**
