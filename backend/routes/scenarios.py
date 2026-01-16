"""
Scenarios Routes - Portfolio Scenario Management
Create, manage, and compare "what-if" scenario portfolios.

⚠️ CRITICAL: All queries include user_id filter for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import uuid
import logging

from models.portfolio import Portfolio, PortfolioResponse
from models.property import Property
from models.asset import Asset
from models.liability import Liability
from models.income import IncomeSource
from models.expense import Expense
from models.financials import (
    Loan, PropertyValuation, GrowthRatePeriod, 
    RentalIncome, ExpenseLog, DepreciationSchedule
)
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scenarios", tags=["scenarios"])

# Constants
MAX_SCENARIOS_PRO = 3


def generate_id() -> str:
    """Generate a short UUID for IDs"""
    return str(uuid.uuid4())[:8]


async def check_scenario_limit(user: User, session: Session) -> None:
    """
    Check if user can create more scenarios.
    Raises HTTPException if limit exceeded.
    """
    if user.subscription_tier == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Scenarios require a Pro subscription"
        )
    
    # Count existing scenarios
    count = session.exec(
        select(func.count(Portfolio.id))
        .where(Portfolio.user_id == user.id, Portfolio.type == "scenario")
    ).first()
    
    if count >= MAX_SCENARIOS_PRO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_SCENARIOS_PRO} scenarios allowed"
        )


async def deep_copy_portfolio(
    source_portfolio: Portfolio,
    scenario_name: str,
    scenario_description: Optional[str],
    user: User,
    session: Session
) -> Portfolio:
    """
    Create a deep copy of a portfolio and all its child records.
    
    Copies:
    - Portfolio (as type="scenario")
    - Properties → with new portfolio_id
    - Loans → with mapped property_id
    - RentalIncome, ExpenseLog, PropertyValuation → with mapped property_id
    - Assets, Liabilities, Income, Expenses → with new portfolio_id
    """
    # Create new scenario portfolio
    new_portfolio = Portfolio(
        id=generate_id(),
        user_id=user.id,
        name=f"{source_portfolio.name} - {scenario_name}",
        type="scenario",
        source_portfolio_id=source_portfolio.id,
        scenario_name=scenario_name,
        scenario_description=scenario_description,
        members=source_portfolio.members,
        settings=source_portfolio.settings,
        goal_settings=source_portfolio.goal_settings,
        total_property_value=source_portfolio.total_property_value,
        total_loan_amount=source_portfolio.total_loan_amount,
        total_equity=source_portfolio.total_equity,
        total_assets=source_portfolio.total_assets,
        total_liabilities=source_portfolio.total_liabilities,
        net_worth=source_portfolio.net_worth,
        annual_income=source_portfolio.annual_income,
        annual_expenses=source_portfolio.annual_expenses,
        annual_cashflow=source_portfolio.annual_cashflow,
    )
    session.add(new_portfolio)
    session.flush()  # Get the ID
    
    # ID mappings for FK relationships
    property_id_map = {}  # old_id -> new_id
    loan_id_map = {}  # old_id -> new_id
    
    # Copy Properties
    old_properties = session.exec(
        select(Property).where(Property.portfolio_id == source_portfolio.id)
    ).all()
    
    for old_prop in old_properties:
        new_prop_id = generate_id()
        property_id_map[old_prop.id] = new_prop_id
        
        new_prop = Property(
            id=new_prop_id,
            user_id=user.id,
            portfolio_id=new_portfolio.id,
            address=old_prop.address,
            suburb=old_prop.suburb,
            state=old_prop.state,
            postcode=old_prop.postcode,
            property_type=old_prop.property_type,
            bedrooms=old_prop.bedrooms,
            bathrooms=old_prop.bathrooms,
            car_spaces=old_prop.car_spaces,
            land_size=old_prop.land_size,
            building_size=old_prop.building_size,
            year_built=old_prop.year_built,
            purchase_price=old_prop.purchase_price,
            purchase_date=old_prop.purchase_date,
            stamp_duty=old_prop.stamp_duty,
            purchase_costs=old_prop.purchase_costs,
            current_value=old_prop.current_value,
            last_valuation_date=old_prop.last_valuation_date,
            loan_details=old_prop.loan_details,
            rental_details=old_prop.rental_details,
            expenses=old_prop.expenses,
            growth_assumptions=old_prop.growth_assumptions,
            notes=old_prop.notes,
        )
        session.add(new_prop)
    
    session.flush()
    
    # Copy Loans (using property_id_map)
    for old_prop_id, new_prop_id in property_id_map.items():
        old_loans = session.exec(
            select(Loan).where(Loan.property_id == old_prop_id)
        ).all()
        
        for old_loan in old_loans:
            new_loan = Loan(
                property_id=new_prop_id,
                lender_name=old_loan.lender_name,
                loan_type=old_loan.loan_type,
                loan_structure=old_loan.loan_structure,
                original_amount=old_loan.original_amount,
                current_amount=old_loan.current_amount,
                interest_rate=old_loan.interest_rate,
                loan_term_years=old_loan.loan_term_years,
                remaining_term_years=old_loan.remaining_term_years,
                interest_only_period_years=old_loan.interest_only_period_years,
                repayment_frequency=old_loan.repayment_frequency,
                offset_balance=old_loan.offset_balance,
                start_date=old_loan.start_date,
            )
            session.add(new_loan)
            session.flush()
            loan_id_map[old_loan.id] = new_loan.id
    
    # Copy Property-level records
    for old_prop_id, new_prop_id in property_id_map.items():
        # RentalIncome
        for old_rec in session.exec(select(RentalIncome).where(RentalIncome.property_id == old_prop_id)).all():
            new_rec = RentalIncome(
                property_id=new_prop_id,
                amount=old_rec.amount,
                frequency=old_rec.frequency,
                growth_rate=old_rec.growth_rate,
                vacancy_weeks_per_year=old_rec.vacancy_weeks_per_year,
                start_date=old_rec.start_date,
                end_date=old_rec.end_date,
            )
            session.add(new_rec)
        
        # ExpenseLog
        for old_rec in session.exec(select(ExpenseLog).where(ExpenseLog.property_id == old_prop_id)).all():
            new_rec = ExpenseLog(
                property_id=new_prop_id,
                category=old_rec.category,
                description=old_rec.description,
                amount=old_rec.amount,
                frequency=old_rec.frequency,
                growth_rate=old_rec.growth_rate,
                start_date=old_rec.start_date,
                end_date=old_rec.end_date,
            )
            session.add(new_rec)
        
        # PropertyValuation
        for old_rec in session.exec(select(PropertyValuation).where(PropertyValuation.property_id == old_prop_id)).all():
            new_rec = PropertyValuation(
                property_id=new_prop_id,
                valuation_date=old_rec.valuation_date,
                value=old_rec.value,
                valuation_source=old_rec.valuation_source,
            )
            session.add(new_rec)
        
        # GrowthRatePeriod
        for old_rec in session.exec(select(GrowthRatePeriod).where(GrowthRatePeriod.property_id == old_prop_id)).all():
            new_rec = GrowthRatePeriod(
                property_id=new_prop_id,
                start_year=old_rec.start_year,
                end_year=old_rec.end_year,
                growth_rate=old_rec.growth_rate,
            )
            session.add(new_rec)
    
    # Copy Portfolio-level records
    # Assets
    for old_rec in session.exec(select(Asset).where(Asset.portfolio_id == source_portfolio.id)).all():
        new_rec = Asset(
            id=generate_id(),
            user_id=user.id,
            portfolio_id=new_portfolio.id,
            name=old_rec.name,
            type=old_rec.type,
            institution=old_rec.institution,
            current_value=old_rec.current_value,
            purchase_value=old_rec.purchase_value,
            purchase_date=old_rec.purchase_date,
            expected_return=old_rec.expected_return,
            notes=old_rec.notes,
            is_active=old_rec.is_active,
        )
        session.add(new_rec)
    
    # Liabilities
    for old_rec in session.exec(select(Liability).where(Liability.portfolio_id == source_portfolio.id)).all():
        new_rec = Liability(
            id=generate_id(),
            user_id=user.id,
            portfolio_id=new_portfolio.id,
            name=old_rec.name,
            type=old_rec.type,
            lender=old_rec.lender,
            current_amount=old_rec.current_amount,
            original_amount=old_rec.original_amount,
            interest_rate=old_rec.interest_rate,
            minimum_payment=old_rec.minimum_payment,
            payment_frequency=old_rec.payment_frequency,
            start_date=old_rec.start_date,
            notes=old_rec.notes,
            is_active=old_rec.is_active,
        )
        session.add(new_rec)
    
    # Income
    for old_rec in session.exec(select(IncomeSource).where(IncomeSource.portfolio_id == source_portfolio.id)).all():
        new_rec = IncomeSource(
            id=generate_id(),
            user_id=user.id,
            portfolio_id=new_portfolio.id,
            name=old_rec.name,
            type=old_rec.type,
            owner=old_rec.owner,
            amount=old_rec.amount,
            frequency=old_rec.frequency,
            growth_rate=old_rec.growth_rate,
            is_taxable=old_rec.is_taxable,
            notes=old_rec.notes,
            is_active=old_rec.is_active,
        )
        session.add(new_rec)
    
    # Expenses
    for old_rec in session.exec(select(Expense).where(Expense.portfolio_id == source_portfolio.id)).all():
        new_rec = Expense(
            id=generate_id(),
            user_id=user.id,
            portfolio_id=new_portfolio.id,
            name=old_rec.name,
            category=old_rec.category,
            amount=old_rec.amount,
            frequency=old_rec.frequency,
            inflation_rate=old_rec.inflation_rate,
            notes=old_rec.notes,
            is_active=old_rec.is_active,
        )
        session.add(new_rec)
    
    session.commit()
    session.refresh(new_portfolio)
    
    logger.info(f"Created scenario '{scenario_name}' from portfolio {source_portfolio.id}")
    return new_portfolio


# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/create/{portfolio_id}", response_model=PortfolioResponse)
async def create_scenario(
    portfolio_id: str,
    scenario_name: str,
    scenario_description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new scenario from an existing portfolio.
    
    Deep copies all portfolio data (properties, loans, assets, etc.)
    for independent modification.
    
    Requires Pro subscription. Max 3 scenarios per user.
    """
    # Check subscription and limit
    await check_scenario_limit(current_user, session)
    
    # Get source portfolio
    source = session.exec(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.id,
            Portfolio.type == "actual"  # Can only create scenarios from actual portfolios
        )
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Create deep copy
    new_scenario = await deep_copy_portfolio(
        source, scenario_name, scenario_description, current_user, session
    )
    
    return new_scenario


@router.get("/portfolio/{portfolio_id}", response_model=List[PortfolioResponse])
async def list_scenarios(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all scenarios for a given source portfolio.
    """
    # Verify access to source portfolio
    source = session.exec(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.id
        )
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # Get scenarios
    scenarios = session.exec(
        select(Portfolio).where(
            Portfolio.source_portfolio_id == portfolio_id,
            Portfolio.user_id == current_user.id,
            Portfolio.type == "scenario"
        )
    ).all()
    
    return scenarios


@router.get("/{scenario_id}", response_model=PortfolioResponse)
async def get_scenario(
    scenario_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get scenario details.
    """
    scenario = session.exec(
        select(Portfolio).where(
            Portfolio.id == scenario_id,
            Portfolio.user_id == current_user.id,
            Portfolio.type == "scenario"
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    return scenario


@router.put("/{scenario_id}", response_model=PortfolioResponse)
async def update_scenario(
    scenario_id: str,
    scenario_name: Optional[str] = None,
    scenario_description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update scenario metadata (name, description).
    """
    scenario = session.exec(
        select(Portfolio).where(
            Portfolio.id == scenario_id,
            Portfolio.user_id == current_user.id,
            Portfolio.type == "scenario"
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    if scenario_name:
        scenario.scenario_name = scenario_name
        scenario.name = f"{scenario.name.split(' - ')[0]} - {scenario_name}"
    if scenario_description is not None:
        scenario.scenario_description = scenario_description
    
    scenario.updated_at = datetime.utcnow()
    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    
    return scenario


@router.delete("/{scenario_id}")
async def delete_scenario(
    scenario_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a scenario and all its child records.
    """
    scenario = session.exec(
        select(Portfolio).where(
            Portfolio.id == scenario_id,
            Portfolio.user_id == current_user.id,
            Portfolio.type == "scenario"
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    # Delete child records
    # Properties and their children
    properties = session.exec(select(Property).where(Property.portfolio_id == scenario_id)).all()
    for prop in properties:
        # Delete property children
        for loan in session.exec(select(Loan).where(Loan.property_id == prop.id)).all():
            session.delete(loan)
        for rec in session.exec(select(RentalIncome).where(RentalIncome.property_id == prop.id)).all():
            session.delete(rec)
        for rec in session.exec(select(ExpenseLog).where(ExpenseLog.property_id == prop.id)).all():
            session.delete(rec)
        for rec in session.exec(select(PropertyValuation).where(PropertyValuation.property_id == prop.id)).all():
            session.delete(rec)
        for rec in session.exec(select(GrowthRatePeriod).where(GrowthRatePeriod.property_id == prop.id)).all():
            session.delete(rec)
        session.delete(prop)
    
    # Portfolio-level records
    for rec in session.exec(select(Asset).where(Asset.portfolio_id == scenario_id)).all():
        session.delete(rec)
    for rec in session.exec(select(Liability).where(Liability.portfolio_id == scenario_id)).all():
        session.delete(rec)
    for rec in session.exec(select(IncomeSource).where(IncomeSource.portfolio_id == scenario_id)).all():
        session.delete(rec)
    for rec in session.exec(select(Expense).where(Expense.portfolio_id == scenario_id)).all():
        session.delete(rec)
    
    # Delete scenario
    session.delete(scenario)
    session.commit()
    
    logger.info(f"Deleted scenario {scenario_id}")
    return {"message": "Scenario deleted successfully"}


@router.get("/{scenario_id}/compare")
async def compare_scenario(
    scenario_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Compare scenario to its source portfolio.
    Returns current and projected metrics for both.
    """
    # Get scenario
    scenario = session.exec(
        select(Portfolio).where(
            Portfolio.id == scenario_id,
            Portfolio.user_id == current_user.id,
            Portfolio.type == "scenario"
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    # Get source portfolio
    source = session.exec(
        select(Portfolio).where(Portfolio.id == scenario.source_portfolio_id)
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source portfolio not found"
        )
    
    # Build comparison data
    def portfolio_metrics(p: Portfolio) -> dict:
        return {
            "id": p.id,
            "name": p.name,
            "type": p.type,
            "total_value": float(p.total_property_value + p.total_assets),
            "total_equity": float(p.total_equity),
            "total_debt": float(p.total_loan_amount + p.total_liabilities),
            "net_worth": float(p.net_worth),
            "annual_cashflow": float(p.annual_cashflow),
            "lvr": float((p.total_loan_amount / p.total_property_value * 100) if p.total_property_value > 0 else 0),
        }
    
    actual_metrics = portfolio_metrics(source)
    scenario_metrics = portfolio_metrics(scenario)
    
    # Calculate differences
    differences = {
        "total_value": scenario_metrics["total_value"] - actual_metrics["total_value"],
        "total_equity": scenario_metrics["total_equity"] - actual_metrics["total_equity"],
        "total_debt": scenario_metrics["total_debt"] - actual_metrics["total_debt"],
        "net_worth": scenario_metrics["net_worth"] - actual_metrics["net_worth"],
        "annual_cashflow": scenario_metrics["annual_cashflow"] - actual_metrics["annual_cashflow"],
        "lvr": scenario_metrics["lvr"] - actual_metrics["lvr"],
    }
    
    return {
        "actual": actual_metrics,
        "scenario": scenario_metrics,
        "differences": differences,
    }
