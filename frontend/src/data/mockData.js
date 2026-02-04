// Mock data for PropEquityLab with Australian property data

export const mockUser = {
  id: '1',
  name: 'Matt Lee',
  email: 'matt.lee@example.com',
  avatar: null
};

export const mockPortfolio = {
  id: '1',
  name: 'LFPTrust',
  type: 'Actual',
  lastUpdated: '17 Dec 2025',
  members: ['Matt Lee', 'Sarah Chen'],
  summary: {
    properties: 3,
    totalValue: 4.04,
    debt: 3.1,
    equity: 0.94,
    goalReached: 'FY2066'
  }
};

export const mockProperties = [
  {
    id: '1',
    address: '42 Harbour Street',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    carSpaces: 1,
    purchasePrice: 1250000,
    purchaseDate: '2022-03-15',
    currentValue: 1380000,
    loanAmount: 1000000,
    interestRate: 6.25,
    loanType: 'Interest Only',
    rentalIncome: 850,
    rentalFrequency: 'weekly',
    expenses: {
      strata: 1200,
      councilRates: 1800,
      waterRates: 700,
      insurance: 1500,
      maintenance: 2000,
      propertyManagement: 4420
    },
    capitalGrowthRate: 5.5,
    rentalGrowthRate: 3.0
  },
  {
    id: '2',
    address: '15 Collins Place',
    suburb: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    propertyType: 'House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    purchasePrice: 1850000,
    purchaseDate: '2021-08-20',
    currentValue: 2100000,
    loanAmount: 1480000,
    interestRate: 6.15,
    loanType: 'Principal & Interest',
    rentalIncome: 1100,
    rentalFrequency: 'weekly',
    expenses: {
      strata: 0,
      councilRates: 2400,
      waterRates: 900,
      insurance: 2200,
      maintenance: 3500,
      propertyManagement: 5720
    },
    capitalGrowthRate: 4.8,
    rentalGrowthRate: 3.2
  },
  {
    id: '3',
    address: '8 River Terrace',
    suburb: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
    propertyType: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    purchasePrice: 780000,
    purchaseDate: '2023-01-10',
    currentValue: 860000,
    loanAmount: 620000,
    interestRate: 6.35,
    loanType: 'Interest Only',
    rentalIncome: 650,
    rentalFrequency: 'weekly',
    expenses: {
      strata: 800,
      councilRates: 1600,
      waterRates: 600,
      insurance: 1400,
      maintenance: 1800,
      propertyManagement: 3380
    },
    capitalGrowthRate: 6.2,
    rentalGrowthRate: 3.5
  }
];

// Generate forecast data for portfolio
export const generateForecastData = (years = 30) => {
  const data = [];
  const currentYear = new Date().getFullYear();
  let equity = 0.94;
  let totalValue = 4.04;
  let debt = 3.1;
  
  for (let i = 0; i <= years; i++) {
    const year = currentYear + i;
    data.push({
      year,
      fiscalYear: `FY${year}`,
      equity: parseFloat(equity.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      debt: parseFloat(debt.toFixed(2)),
      cashflow: parseFloat((equity * 0.05 + i * 0.02).toFixed(2)),
      grossYield: parseFloat((5.2 + Math.random() * 0.5).toFixed(2)),
      netYield: parseFloat((3.8 + Math.random() * 0.3).toFixed(2))
    });
    
    // Growth projections
    totalValue *= 1.052;
    equity = totalValue - debt;
    debt *= 0.97; // Assuming some principal paydown
  }
  
  return data;
};

// Chart data for equity projection
export const generateChartData = (years = 30) => {
  const forecast = generateForecastData(years);
  return forecast.map(item => ({
    year: item.fiscalYear,
    equity: item.equity,
    debt: item.debt,
    totalValue: item.totalValue
  }));
};

// Cashflow data
export const generateCashflowData = (years = 30) => {
  const data = [];
  const currentYear = new Date().getFullYear();
  let annualCashflow = -15000; // Starting negative (typical for IO loans)
  
  for (let i = 0; i <= years; i++) {
    const year = currentYear + i;
    data.push({
      year,
      fiscalYear: `FY${year}`,
      cashflow: annualCashflow,
      rentalIncome: 135000 + (i * 4000),
      expenses: 45000 + (i * 1500),
      loanPayments: 195000 - (i * 2000)
    });
    
    annualCashflow += 8000 + Math.random() * 2000;
  }
  
  return data;
};

export const portfolioMembers = [
  { id: '1', name: 'Matt Lee', email: 'matt.lee@example.com', role: 'Owner' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'Member' }
];
