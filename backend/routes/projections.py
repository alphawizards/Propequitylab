"""
Projections Routes - Financial Forecasting API
Generate multi-year financial projections for properties and portfolios.

⚠️ CRITICAL: All queries include .where(Property.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import logging

from models.property import Property
from models.portfolio import Portfolio
from models.user import User
from models.financials import (
    Loan,
    PropertyValuation,
    GrowthRatePeriod,
    RentalIncome,
    ExpenseLog,
    DepreciationSchedule,
    ProjectionYearData,
    PropertyProjectionResponse,
    PortfolioProjectionResponse,
)
from utils.database_sql import get_session
from utils.auth import get_current_user
from utils.calculations import (
    calculate_property_value,
    calculate_property_equity,
    calculate_rental_income_for_year,
    calculate_expenses_for_year,
    calculate_property_cashflow,
    generate_portfolio_projections,
    to_decimal,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projections", tags=["projections"])


def _get_property_data(property_id: str, session: Session) -> dict:
    """
    Fetch all financial data for a property.
    Returns a dict with property, loans, valuations, growth_rates, etc.
    """
    # Get loans
    loans_stmt = select(Loan).where(Loan.property_id == property_id)
    loans = session.exec(loans_stmt).all()
    
    # Get valuations
    valuations_stmt = select(PropertyValuation).where(PropertyValuation.property_id == property_id)
    valuations = session.exec(valuations_stmt).all()
    
    # Get growth rates
    growth_stmt = select(GrowthRatePeriod).where(GrowthRatePeriod.property_id == property_id)
    growth_rates = session.exec(growth_stmt).all()
    
    # Get rental income
    rental_stmt = select(RentalIncome).where(RentalIncome.property_id == property_id)
    rental_incomes = session.exec(rental_stmt).all()
    
    # Get expenses
    expense_stmt = select(ExpenseLog).where(ExpenseLog.property_id == property_id)
    expenses = session.exec(expense_stmt).all()
    
    # Get depreciation
    depr_stmt = select(DepreciationSchedule).where(DepreciationSchedule.property_id == property_id)
    depreciation = session.exec(depr_stmt).all()
    
    # Convert to dicts for calculation engine
    return {
        "loans": [
            {
                "original_amount": loan.original_amount,
                "current_amount": loan.current_amount,
                "interest_rate": loan.interest_rate,
                "loan_structure": loan.loan_structure.value if hasattr(loan.loan_structure, 'value') else loan.loan_structure,
                "remaining_term_years": loan.remaining_term_years,
                "repayment_frequency": loan.repayment_frequency.value if hasattr(loan.repayment_frequency, 'value') else loan.repayment_frequency,
                "offset_balance": loan.offset_balance,
            }
            for loan in loans
        ],
        "valuations": [
            {
                "valuation_date": val.valuation_date,
                "value": val.value,
            }
            for val in valuations
        ],
        "growth_rates": [
            {
                "start_year": gr.start_year,
                "end_year": gr.end_year,
                "growth_rate": gr.growth_rate,
            }
            for gr in growth_rates
        ],
        "rental_incomes": [
            {
                "amount": ri.amount,
                "frequency": ri.frequency.value if hasattr(ri.frequency, 'value') else ri.frequency,
                "growth_rate": ri.growth_rate,
                "vacancy_weeks_per_year": ri.vacancy_weeks_per_year,
            }
            for ri in rental_incomes
        ],
        "expenses": [
            {
                "amount": exp.amount,
                "frequency": exp.frequency.value if hasattr(exp.frequency, 'value') else exp.frequency,
                "growth_rate": exp.growth_rate,
            }
            for exp in expenses
        ],
        "depreciation": depreciation,
    }


def _generate_property_projections(
    property_obj: Property,
    property_data: dict,
    years: int,
    expense_growth_override: Optional[float] = None,
    interest_rate_offset: Optional[float] = None,
) -> List[ProjectionYearData]:
    """
    Generate projections for a single property.
    """
    current_year = datetime.now().year
    end_year = current_year + years
    
    # Get base value
    base_value = to_decimal(property_obj.current_value or property_obj.purchase_price)
    
    # Default growth rates if none defined
    growth_rates = property_data.get("growth_rates", [])
    if not growth_rates and property_obj.growth_assumptions:
        rate = property_obj.growth_assumptions.get("capital_growth_rate", 5.0)
        growth_rates = [{"start_year": current_year, "end_year": None, "growth_rate": rate}]
    
    exp_override = Decimal(str(expense_growth_override)) if expense_growth_override else None
    rate_offset = Decimal(str(interest_rate_offset)) if interest_rate_offset else Decimal("0")
    
    projections = []
    
    for year in range(current_year, end_year + 1):
        years_elapsed = year - current_year
        
        # Calculate property value
        projected_value = calculate_property_value(
            base_value, current_year, year, growth_rates, property_data.get("valuations", [])
        )
        
        # Calculate equity
        equity_data = calculate_property_equity(
            projected_value, 
            property_data.get("loans", []), 
            year, 
            current_year, 
            rate_offset
        )
        
        # Calculate income and expenses
        rental_income = calculate_rental_income_for_year(
            property_data.get("rental_incomes", []), year, current_year
        )
        
        # Fall back to JSON rental details if no RentalIncome records
        if rental_income == 0 and property_obj.rental_details:
            weekly_rent = to_decimal(property_obj.rental_details.get("income", 0))
            rental_growth = to_decimal(property_obj.growth_assumptions.get("rental_growth_rate", 3) if property_obj.growth_assumptions else 3)
            rental_income = weekly_rent * 52 * ((Decimal("1") + rental_growth / 100) ** years_elapsed)
        
        annual_expenses = calculate_expenses_for_year(
            property_data.get("expenses", []), year, current_year, exp_override
        )
        
        # Fall back to JSON expenses if no ExpenseLog records
        if annual_expenses == 0 and property_obj.expenses:
            annual_expenses = sum(to_decimal(v) for v in property_obj.expenses.values())
        
        # Get depreciation for this year
        depr = Decimal("0")
        for d in property_data.get("depreciation", []):
            if d.year == year:
                depr = d.building_depreciation + d.plant_and_equipment
                break
        
        # Calculate cashflow
        cashflow_data = calculate_property_cashflow(
            property_data.get("loans", []),
            rental_income,
            annual_expenses,
            depr,
            rate_offset
        )
        
        projections.append(ProjectionYearData(
            year=year,
            property_value=equity_data["property_value"],
            total_debt=equity_data["total_debt"],
            equity=equity_data["equity"],
            lvr=equity_data["lvr"],
            rental_income=cashflow_data["rental_income"],
            expenses=cashflow_data["expenses"],
            loan_repayments=cashflow_data["loan_repayments"],
            depreciation=cashflow_data["depreciation"],
            net_cashflow=cashflow_data["net_cashflow"],
        ))
    
    return projections


@router.get("/{property_id}", response_model=PropertyProjectionResponse)
async def get_property_projections(
    property_id: str,
    years: int = 10,
    expense_growth_override: Optional[float] = None,
    interest_rate_offset: Optional[float] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generate multi-year financial projections for a single property.
    
    Args:
        property_id: Property ID
        years: Number of years to project (default 10, max 50)
        expense_growth_override: Override expense growth rate (percentage)
        interest_rate_offset: Interest rate adjustment for stress testing (percentage points)
    
    Returns:
        PropertyProjectionResponse with year-by-year projections
    """
    # Validate years
    if years < 1 or years > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Years must be between 1 and 50"
        )
    
    # Get property with data isolation
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    # Fetch all related financial data
    property_data = _get_property_data(property_id, session)
    
    # Generate projections
    projections = _generate_property_projections(
        property_obj,
        property_data,
        years,
        expense_growth_override,
        interest_rate_offset
    )
    
    current_year = datetime.now().year
    
    return PropertyProjectionResponse(
        property_id=property_id,
        property_address=property_obj.address,
        start_year=current_year,
        end_year=current_year + years,
        projections=projections
    )


@router.get("/portfolio/{portfolio_id}", response_model=PortfolioProjectionResponse)
async def get_portfolio_projections(
    portfolio_id: str,
    years: int = 10,
    expense_growth_override: Optional[float] = None,
    interest_rate_offset: Optional[float] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generate multi-year projections for an entire portfolio.
    
    Args:
        portfolio_id: Portfolio ID
        years: Number of years to project (default 10, max 50)
        expense_growth_override: Override expense growth rate
        interest_rate_offset: Interest rate adjustment for stress testing
    
    Returns:
        PortfolioProjectionResponse with per-property and aggregated projections
    """
    # Validate years
    if years < 1 or years > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Years must be between 1 and 50"
        )
    
    # Verify portfolio access
    portfolio_stmt = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    )
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Get all properties in portfolio
    properties_stmt = select(Property).where(
        Property.portfolio_id == portfolio_id,
        Property.user_id == current_user.id  # CRITICAL: Data isolation
    )
    properties = session.exec(properties_stmt).all()
    
    if not properties:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No properties found in this portfolio"
        )
    
    current_year = datetime.now().year
    
    # Generate projections for each property
    property_projections = []
    
    for property_obj in properties:
        property_data = _get_property_data(property_obj.id, session)
        projections = _generate_property_projections(
            property_obj,
            property_data,
            years,
            expense_growth_override,
            interest_rate_offset
        )
        
        property_projections.append(PropertyProjectionResponse(
            property_id=property_obj.id,
            property_address=property_obj.address,
            start_year=current_year,
            end_year=current_year + years,
            projections=projections
        ))
    
    # Calculate portfolio totals by aggregating across properties
    totals = []
    for year_idx in range(years + 1):
        year = current_year + year_idx
        
        total_value = Decimal("0")
        total_debt = Decimal("0")
        total_equity = Decimal("0")
        total_rental = Decimal("0")
        total_expenses = Decimal("0")
        total_repayments = Decimal("0")
        total_depreciation = Decimal("0")
        total_cashflow = Decimal("0")
        
        for prop_proj in property_projections:
            if year_idx < len(prop_proj.projections):
                year_data = prop_proj.projections[year_idx]
                total_value += year_data.property_value
                total_debt += year_data.total_debt
                total_equity += year_data.equity
                total_rental += year_data.rental_income
                total_expenses += year_data.expenses
                total_repayments += year_data.loan_repayments
                total_depreciation += year_data.depreciation
                total_cashflow += year_data.net_cashflow
        
        portfolio_lvr = (total_debt / total_value * 100) if total_value > 0 else Decimal("0")
        
        totals.append(ProjectionYearData(
            year=year,
            property_value=total_value,
            total_debt=total_debt,
            equity=total_equity,
            lvr=portfolio_lvr.quantize(Decimal("0.01")),
            rental_income=total_rental,
            expenses=total_expenses,
            loan_repayments=total_repayments,
            depreciation=total_depreciation,
            net_cashflow=total_cashflow,
        ))
    
    return PortfolioProjectionResponse(
        portfolio_id=portfolio_id,
        portfolio_name=portfolio.name,
        start_year=current_year,
        end_year=current_year + years,
        properties=property_projections,
        totals=totals
    )


@router.get("/property/{property_id}/summary")
async def get_property_projection_summary(
    property_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a quick summary of current property financial status.
    
    Returns current value, equity, LVR, and annual cashflow.
    """
    # Get property with data isolation
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == current_user.id
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    # Fetch financial data
    property_data = _get_property_data(property_id, session)
    
    current_year = datetime.now().year
    base_value = to_decimal(property_obj.current_value or property_obj.purchase_price)
    
    # Calculate current equity
    equity_data = calculate_property_equity(
        base_value,
        property_data.get("loans", []),
        current_year,
        current_year,
        Decimal("0")
    )
    
    # Calculate annual cashflow
    rental_income = calculate_rental_income_for_year(
        property_data.get("rental_incomes", []), current_year, current_year
    )
    expenses = calculate_expenses_for_year(
        property_data.get("expenses", []), current_year, current_year
    )
    
    cashflow_data = calculate_property_cashflow(
        property_data.get("loans", []),
        rental_income,
        expenses,
    )
    
    return {
        "property_id": property_id,
        "address": property_obj.address,
        "current_value": equity_data["property_value"],
        "total_debt": equity_data["total_debt"],
        "equity": equity_data["equity"],
        "lvr": equity_data["lvr"],
        "annual_rental_income": cashflow_data["rental_income"],
        "annual_expenses": cashflow_data["expenses"],
        "annual_loan_repayments": cashflow_data["loan_repayments"],
        "annual_net_cashflow": cashflow_data["net_cashflow"],
    }
