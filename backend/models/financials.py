"""
Financial Models - SQLModel (PostgreSQL)
Extended database schema for property portfolio financial forecasting.
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import DECIMAL, JSON, Enum as SAEnum, Index
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class LoanStructure(str, Enum):
    """Loan repayment structure"""
    INTEREST_ONLY = "InterestOnly"
    PRINCIPAL_AND_INTEREST = "PrincipalAndInterest"


class LoanType(str, Enum):
    """Type of loan"""
    EQUITY_LOAN = "EquityLoan"
    PRINCIPAL_LOAN = "PrincipalLoan"


class Frequency(str, Enum):
    """Payment/Income frequency"""
    WEEKLY = "Weekly"
    FORTNIGHTLY = "Fortnightly"
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    ANNUALLY = "Annually"
    ONE_TIME = "OneTime"


class UsageType(str, Enum):
    """Property usage type"""
    INVESTMENT = "Investment"
    PPOR = "PPOR"  # Principal Place of Residence


class PropertyStatus(str, Enum):
    """Property status"""
    ACTUAL = "Actual"
    PROJECTED = "Projected"


# ============================================================================
# LOAN MANAGEMENT TABLES
# ============================================================================

class Loan(SQLModel, table=True):
    """
    Loan table - Supports multiple loans per property
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "loans"
    __table_args__ = (
        Index("ix_loans_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    # Loan identification
    lender_name: str = Field(max_length=255)
    loan_type: LoanType = Field(sa_column=Column(SAEnum(LoanType)))
    loan_structure: LoanStructure = Field(sa_column=Column(SAEnum(LoanStructure)))
    
    # Loan amounts (DECIMAL for precision)
    original_amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    current_amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    
    # Interest details
    interest_rate: Decimal = Field(sa_column=Column(DECIMAL(5, 2)))  # Percentage
    
    # Term details
    loan_term_years: int = Field(default=30)
    remaining_term_years: int = Field(default=30)
    interest_only_period_years: int = Field(default=0)
    
    # Payment details
    repayment_frequency: Frequency = Field(
        default=Frequency.MONTHLY,
        sa_column=Column(SAEnum(Frequency))
    )
    
    # Offset account
    offset_balance: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    
    # Security property (for equity loans secured against another property)
    security_property_id: Optional[str] = Field(
        default=None,
        foreign_key="properties.id",
        max_length=50
    )
    
    # Timestamps
    start_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ExtraRepayment(SQLModel, table=True):
    """Recurring extra payment schedules for loans"""
    __tablename__ = "extra_repayments"
    __table_args__ = (
        Index("ix_extra_repayments_loan_id", "loan_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="loans.id")
    
    amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    frequency: Frequency = Field(sa_column=Column(SAEnum(Frequency)))
    
    start_date: date
    end_date: Optional[date] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LumpSumPayment(SQLModel, table=True):
    """One-time additional payments for loans"""
    __tablename__ = "lump_sum_payments"
    __table_args__ = (
        Index("ix_lump_sum_payments_loan_id", "loan_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="loans.id")
    
    amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    payment_date: date
    description: str = Field(default="", max_length=500)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterestRateForecast(SQLModel, table=True):
    """Future interest rate projections for loans"""
    __tablename__ = "interest_rate_forecasts"
    __table_args__ = (
        Index("ix_interest_rate_forecasts_loan_id", "loan_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="loans.id")
    
    effective_date: date
    interest_rate: Decimal = Field(sa_column=Column(DECIMAL(5, 2)))  # Percentage
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# PROPERTY VALUATION & GROWTH TABLES
# ============================================================================

class PropertyValuation(SQLModel, table=True):
    """Historical property valuations"""
    __tablename__ = "property_valuations"
    __table_args__ = (
        Index("ix_property_valuations_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    valuation_date: date
    value: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    
    # Optional source/type of valuation
    valuation_source: str = Field(default="manual", max_length=100)  # manual, bank, api
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GrowthRatePeriod(SQLModel, table=True):
    """Flexible growth rate modeling by time period"""
    __tablename__ = "growth_rate_periods"
    __table_args__ = (
        Index("ix_growth_rate_periods_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    start_year: int
    end_year: Optional[int] = Field(default=None)  # None = ongoing
    growth_rate: Decimal = Field(sa_column=Column(DECIMAL(5, 2)))  # Percentage
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# INCOME TABLES
# ============================================================================

class RentalIncome(SQLModel, table=True):
    """Rental income streams with growth rates"""
    __tablename__ = "rental_income"
    __table_args__ = (
        Index("ix_rental_income_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    amount: Decimal = Field(sa_column=Column(DECIMAL(12, 2)))
    frequency: Frequency = Field(sa_column=Column(SAEnum(Frequency)))
    
    # Growth rate for rental income
    growth_rate: Decimal = Field(
        default=Decimal("3.00"),
        sa_column=Column(DECIMAL(5, 2))
    )  # Percentage
    
    # Vacancy
    vacancy_weeks_per_year: int = Field(default=2)
    
    # Period
    start_date: date
    end_date: Optional[date] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# EXPENSE TABLES
# ============================================================================

class ExpenseLog(SQLModel, table=True):
    """Expense tracking with frequency and growth"""
    __tablename__ = "expense_logs"
    __table_args__ = (
        Index("ix_expense_logs_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    category: str = Field(max_length=100)  # council_rates, water, insurance, etc.
    description: str = Field(default="", max_length=500)
    
    amount: Decimal = Field(sa_column=Column(DECIMAL(12, 2)))
    frequency: Frequency = Field(sa_column=Column(SAEnum(Frequency)))
    
    # Growth rate for this expense
    growth_rate: Decimal = Field(
        default=Decimal("2.50"),
        sa_column=Column(DECIMAL(5, 2))
    )  # Percentage
    
    # Period
    start_date: date
    end_date: Optional[date] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DepreciationSchedule(SQLModel, table=True):
    """Tax depreciation schedules"""
    __tablename__ = "depreciation_schedules"
    __table_args__ = (
        Index("ix_depreciation_schedules_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    year: int  # Year of depreciation
    building_depreciation: Decimal = Field(sa_column=Column(DECIMAL(12, 2)))
    plant_and_equipment: Decimal = Field(sa_column=Column(DECIMAL(12, 2)))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CapitalExpenditure(SQLModel, table=True):
    """Capital expenditure tracking"""
    __tablename__ = "capital_expenditures"
    __table_args__ = (
        Index("ix_capital_expenditures_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    description: str = Field(max_length=500)
    amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    
    expenditure_date: date
    
    # Optional: link to depreciation impact
    adds_to_cost_base: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# PROPERTY USAGE & OWNERSHIP TABLES
# ============================================================================

class PropertyUsagePeriod(SQLModel, table=True):
    """Investment vs PPOR tracking over time"""
    __tablename__ = "property_usage_periods"
    __table_args__ = (
        Index("ix_property_usage_periods_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    usage_type: UsageType = Field(sa_column=Column(SAEnum(UsageType)))
    start_date: date
    end_date: Optional[date] = Field(default=None)  # None = ongoing
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PropertyOwnership(SQLModel, table=True):
    """Multi-owner percentage tracking"""
    __tablename__ = "property_ownerships"
    __table_args__ = (
        Index("ix_property_ownerships_property_id", "property_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(foreign_key="properties.id", max_length=50)
    
    owner_name: str = Field(max_length=255)
    ownership_percentage: Decimal = Field(sa_column=Column(DECIMAL(5, 2)))  # 0-100
    
    # Optional: link to user if owner is a registered user
    user_id: Optional[str] = Field(
        default=None,
        foreign_key="users.id",
        max_length=50
    )
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# WIZARD DRAFT TABLE
# ============================================================================

class PropertyDraft(SQLModel, table=True):
    """Property wizard draft saving for multi-step form"""
    __tablename__ = "property_drafts"
    __table_args__ = (
        Index("ix_property_drafts_user_id", "user_id"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", max_length=50)
    
    # Store complete draft data as JSON
    draft_data: dict = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Current step in wizard (1-10)
    current_step: int = Field(default=1)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# PYDANTIC REQUEST/RESPONSE MODELS
# ============================================================================

class LoanCreate(SQLModel):
    """Loan creation request"""
    property_id: str
    lender_name: str
    loan_type: LoanType = LoanType.PRINCIPAL_LOAN
    loan_structure: LoanStructure = LoanStructure.PRINCIPAL_AND_INTEREST
    original_amount: Decimal
    current_amount: Optional[Decimal] = None
    interest_rate: Decimal
    loan_term_years: int = 30
    remaining_term_years: Optional[int] = None
    interest_only_period_years: int = 0
    repayment_frequency: Frequency = Frequency.MONTHLY
    offset_balance: Decimal = Decimal("0.0000")
    security_property_id: Optional[str] = None
    start_date: Optional[date] = None


class LoanUpdate(SQLModel):
    """Loan update request"""
    lender_name: Optional[str] = None
    loan_structure: Optional[LoanStructure] = None
    current_amount: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None
    remaining_term_years: Optional[int] = None
    repayment_frequency: Optional[Frequency] = None
    offset_balance: Optional[Decimal] = None


class LoanResponse(SQLModel):
    """Loan response"""
    id: int
    property_id: str
    lender_name: str
    loan_type: LoanType
    loan_structure: LoanStructure
    original_amount: Decimal
    current_amount: Decimal
    interest_rate: Decimal
    loan_term_years: int
    remaining_term_years: int
    interest_only_period_years: int
    repayment_frequency: Frequency
    offset_balance: Decimal
    security_property_id: Optional[str]
    start_date: date
    created_at: datetime
    updated_at: datetime


class ValuationCreate(SQLModel):
    """Valuation creation request"""
    property_id: str
    valuation_date: date
    value: Decimal
    valuation_source: str = "manual"


class ValuationResponse(SQLModel):
    """Valuation response"""
    id: int
    property_id: str
    valuation_date: date
    value: Decimal
    valuation_source: str
    created_at: datetime


class ProjectionYearData(SQLModel):
    """Single year projection data"""
    year: int
    property_value: Decimal
    total_debt: Decimal
    equity: Decimal
    lvr: Decimal  # Loan-to-Value Ratio as percentage
    rental_income: Decimal
    expenses: Decimal
    loan_repayments: Decimal
    depreciation: Decimal
    net_cashflow: Decimal


class PropertyProjectionResponse(SQLModel):
    """Property projection response"""
    property_id: str
    property_address: str
    start_year: int
    end_year: int
    projections: List[ProjectionYearData]


class PortfolioProjectionResponse(SQLModel):
    """Portfolio projection response"""
    portfolio_id: str
    portfolio_name: str
    start_year: int
    end_year: int
    properties: List[PropertyProjectionResponse]
    totals: List[ProjectionYearData]  # Aggregated totals per year
