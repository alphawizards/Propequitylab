from .user import User, UserCreate, UserUpdate
from .portfolio import Portfolio, PortfolioCreate, PortfolioUpdate, PortfolioSummary
from .property import Property, PropertyCreate, PropertyUpdate
from .income import IncomeSource, IncomeSourceCreate, IncomeSourceUpdate
from .expense import Expense, ExpenseCreate, ExpenseUpdate
from .asset import Asset, AssetCreate, AssetUpdate
from .liability import Liability, LiabilityCreate, LiabilityUpdate
from .plan import Plan, PlanCreate, PlanUpdate
from .net_worth import NetWorthSnapshot

# Financial modeling tables (Phase 1 - Property Portfolio Forecasting)
from .financials import (
    # Enums
    LoanStructure,
    LoanType,
    Frequency,
    UsageType,
    PropertyStatus,
    # Loan tables
    Loan,
    LoanCreate,
    LoanUpdate,
    LoanResponse,
    ExtraRepayment,
    LumpSumPayment,
    InterestRateForecast,
    # Valuation & growth tables
    PropertyValuation,
    ValuationCreate,
    ValuationResponse,
    GrowthRatePeriod,
    # Income tables
    RentalIncome,
    # Expense tables
    ExpenseLog,
    DepreciationSchedule,
    CapitalExpenditure,
    # Usage & ownership tables
    PropertyUsagePeriod,
    PropertyOwnership,
    # Wizard draft
    PropertyDraft,
    # Projection response models
    ProjectionYearData,
    PropertyProjectionResponse,
    PortfolioProjectionResponse,
)
