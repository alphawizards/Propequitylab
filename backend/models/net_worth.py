from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid


class AssetBreakdown(BaseModel):
    properties: float = 0
    super: float = 0
    shares: float = 0
    etf: float = 0
    crypto: float = 0
    cash: float = 0
    bonds: float = 0
    other: float = 0


class LiabilityBreakdown(BaseModel):
    property_loans: float = 0
    car_loans: float = 0
    credit_cards: float = 0
    hecs: float = 0
    personal_loans: float = 0
    other: float = 0


class NetWorthSnapshot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    # Snapshot date
    date: str  # ISO date string (YYYY-MM-DD)
    
    # Totals
    total_assets: float = 0
    total_liabilities: float = 0
    net_worth: float = 0
    
    # Breakdowns
    asset_breakdown: AssetBreakdown = Field(default_factory=AssetBreakdown)
    liability_breakdown: LiabilityBreakdown = Field(default_factory=LiabilityBreakdown)
    
    # Income/Expense snapshot
    monthly_income: float = 0
    monthly_expenses: float = 0
    monthly_cashflow: float = 0
    savings_rate: float = 0  # percentage
    
    # Property specific
    property_equity: float = 0
    property_ltv: float = 0  # Loan to Value ratio
    
    # Change from previous
    change_from_previous: float = 0
    change_percentage: float = 0
    
    # Metadata
    is_manual: bool = False  # true if manually entered vs calculated
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# This model is typically auto-generated, not manually created
# But we provide a create model for manual snapshots
class NetWorthSnapshotCreate(BaseModel):
    portfolio_id: str
    date: str
    total_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    notes: str = ""
