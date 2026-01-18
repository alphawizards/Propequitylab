"""
Financial Calculation Engine - Python (Translated from TypeScript)
Property portfolio financial forecasting calculations.

⚠️ CRITICAL: All calculations use Python's decimal.Decimal for financial precision
Never use float for currency calculations.

Reference: AI_AGENT_IMPLEMENTATION_PROMPT.md Phase 2
"""

from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from typing import List, Dict, Optional, Any
from enum import Enum


# ============================================================================
# CONSTANTS
# ============================================================================

# Frequency multipliers for annualization
FREQUENCY_MULTIPLIERS = {
    "Weekly": Decimal("52"),
    "Fortnightly": Decimal("26"),
    "Monthly": Decimal("12"),
    "Quarterly": Decimal("4"),
    "Annually": Decimal("1"),
    "OneTime": Decimal("1"),
}

# Currency precision
CURRENCY_PRECISION = Decimal("0.01")
RATE_PRECISION = Decimal("0.0001")


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def to_decimal(value: Any) -> Decimal:
    """Safely convert any value to Decimal"""
    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def round_currency(value: Decimal) -> Decimal:
    """Round to 2 decimal places for currency display"""
    return value.quantize(CURRENCY_PRECISION, rounding=ROUND_HALF_UP)


def annualize_amount(amount: Decimal, frequency: str) -> Decimal:
    """Convert any frequency amount to annual amount"""
    multiplier = FREQUENCY_MULTIPLIERS.get(frequency, Decimal("12"))
    return amount * multiplier


def monthly_rate(annual_rate: Decimal) -> Decimal:
    """Convert annual rate (as percentage) to monthly rate (as decimal)"""
    return to_decimal(annual_rate) / Decimal("100") / Decimal("12")


def annual_rate_decimal(annual_rate: Decimal) -> Decimal:
    """Convert annual rate (as percentage) to decimal"""
    return to_decimal(annual_rate) / Decimal("100")


# ============================================================================
# LOAN CALCULATIONS
# ============================================================================

def calculate_interest_only_repayment(
    principal: Decimal,
    annual_interest_rate: Decimal,
    frequency: str = "Monthly",
    rate_offset: Decimal = Decimal("0")
) -> Dict[str, Decimal]:
    """
    Calculate Interest-Only loan repayment.
    
    Args:
        principal: Current loan balance
        annual_interest_rate: Annual interest rate as percentage (e.g., 6.25 for 6.25%)
        frequency: Payment frequency
        rate_offset: Rate adjustment for scenario modeling (e.g., +2 for stress test)
    
    Returns:
        Dict with monthly_payment, annual_payment, principal_portion, interest_portion
    """
    principal = to_decimal(principal)
    rate = to_decimal(annual_interest_rate) + to_decimal(rate_offset)
    
    # Annual interest
    annual_interest = principal * (rate / Decimal("100"))
    
    # Convert to payment frequency
    multiplier = FREQUENCY_MULTIPLIERS.get(frequency, Decimal("12"))
    payment = annual_interest / multiplier
    
    return {
        "monthly_payment": round_currency(annual_interest / Decimal("12")),
        "annual_payment": round_currency(annual_interest),
        "principal_portion": Decimal("0"),
        "interest_portion": round_currency(payment),
        "payment_per_frequency": round_currency(payment),
    }


def calculate_principal_and_interest_repayment(
    principal: Decimal,
    annual_interest_rate: Decimal,
    term_years: int,
    frequency: str = "Monthly",
    rate_offset: Decimal = Decimal("0")
) -> Dict[str, Decimal]:
    """
    Calculate Principal & Interest loan repayment using standard amortization formula.
    
    Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
    
    Args:
        principal: Current loan balance
        annual_interest_rate: Annual interest rate as percentage
        term_years: Remaining loan term in years
        frequency: Payment frequency
        rate_offset: Rate adjustment for scenario modeling
    
    Returns:
        Dict with monthly_payment, annual_payment, principal_portion, interest_portion
    """
    principal = to_decimal(principal)
    rate = to_decimal(annual_interest_rate) + to_decimal(rate_offset)
    term_years = int(term_years) if term_years > 0 else 1
    
    # Get periods based on frequency
    multiplier = FREQUENCY_MULTIPLIERS.get(frequency, Decimal("12"))
    total_periods = Decimal(str(term_years)) * multiplier
    
    # Calculate periodic interest rate
    periodic_rate = rate / Decimal("100") / multiplier
    
    # Handle zero interest rate edge case
    if periodic_rate <= 0:
        periodic_payment = principal / total_periods
        monthly_payment = principal / (Decimal(str(term_years)) * Decimal("12"))
        return {
            "monthly_payment": round_currency(monthly_payment),
            "annual_payment": round_currency(monthly_payment * Decimal("12")),
            "principal_portion": round_currency(periodic_payment),
            "interest_portion": Decimal("0"),
            "payment_per_frequency": round_currency(periodic_payment),
        }
    
    # Standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
    one_plus_r = Decimal("1") + periodic_rate
    one_plus_r_to_n = one_plus_r ** int(total_periods)
    
    numerator = principal * periodic_rate * one_plus_r_to_n
    denominator = one_plus_r_to_n - Decimal("1")
    
    periodic_payment = numerator / denominator
    
    # Calculate first payment breakdown (interest portion decreases over time)
    first_interest = principal * periodic_rate
    first_principal = periodic_payment - first_interest
    
    # Convert to monthly/annual for consistent reporting
    periods_per_year = multiplier
    annual_payment = periodic_payment * periods_per_year
    monthly_payment = annual_payment / Decimal("12")
    
    return {
        "monthly_payment": round_currency(monthly_payment),
        "annual_payment": round_currency(annual_payment),
        "principal_portion": round_currency(first_principal),
        "interest_portion": round_currency(first_interest),
        "payment_per_frequency": round_currency(periodic_payment),
    }


def calculate_loan_repayment(
    principal: Decimal,
    annual_interest_rate: Decimal,
    loan_structure: str,
    term_years: int = 30,
    frequency: str = "Monthly",
    rate_offset: Decimal = Decimal("0")
) -> Dict[str, Decimal]:
    """
    Wrapper function that calls appropriate calculation based on loan structure.
    
    Args:
        principal: Current loan balance
        annual_interest_rate: Annual interest rate as percentage
        loan_structure: "InterestOnly" or "PrincipalAndInterest"
        term_years: Remaining loan term in years
        frequency: Payment frequency
        rate_offset: Rate adjustment for scenario modeling
    """
    if loan_structure == "InterestOnly":
        return calculate_interest_only_repayment(
            principal, annual_interest_rate, frequency, rate_offset
        )
    else:
        return calculate_principal_and_interest_repayment(
            principal, annual_interest_rate, term_years, frequency, rate_offset
        )


def calculate_remaining_balance(
    original_principal: Decimal,
    annual_interest_rate: Decimal,
    total_term_years: int,
    years_elapsed: int,
    loan_structure: str = "PrincipalAndInterest",
    rate_offset: Decimal = Decimal("0")
) -> Decimal:
    """
    Calculate remaining loan balance after specified years.
    
    Formula: B = A(1 + r)^n - P[(1 + r)^n - 1] / r
    
    For Interest-Only: Balance remains constant (no principal reduction)
    
    Args:
        original_principal: Original loan amount
        annual_interest_rate: Annual interest rate as percentage
        total_term_years: Total loan term in years
        years_elapsed: Number of years since loan started
        loan_structure: "InterestOnly" or "PrincipalAndInterest"
        rate_offset: Rate adjustment for scenario modeling
    
    Returns:
        Remaining balance as Decimal
    """
    original_principal = to_decimal(original_principal)
    rate = to_decimal(annual_interest_rate) + to_decimal(rate_offset)
    
    # Interest-only loans don't reduce principal
    if loan_structure == "InterestOnly":
        return round_currency(original_principal)
    
    # Handle edge cases
    if years_elapsed <= 0:
        return round_currency(original_principal)
    
    if years_elapsed >= total_term_years:
        return Decimal("0")
    
    # Calculate monthly rate
    monthly_rate = rate / Decimal("100") / Decimal("12")
    
    if monthly_rate <= 0:
        # No interest: simple linear paydown
        monthly_principal = original_principal / (Decimal(str(total_term_years)) * Decimal("12"))
        months_elapsed = Decimal(str(years_elapsed)) * Decimal("12")
        remaining = original_principal - (monthly_principal * months_elapsed)
        return round_currency(max(Decimal("0"), remaining))
    
    # Calculate monthly payment (amortization formula)
    total_months = Decimal(str(total_term_years)) * Decimal("12")
    one_plus_r = Decimal("1") + monthly_rate
    one_plus_r_to_n = one_plus_r ** int(total_months)
    
    monthly_payment = original_principal * (monthly_rate * one_plus_r_to_n) / (one_plus_r_to_n - Decimal("1"))
    
    # Calculate remaining balance formula: B = A(1 + r)^n - P[(1 + r)^n - 1] / r
    months_elapsed = Decimal(str(years_elapsed)) * Decimal("12")
    one_plus_r_elapsed = one_plus_r ** int(months_elapsed)
    
    balance = (original_principal * one_plus_r_elapsed) - (monthly_payment * (one_plus_r_elapsed - Decimal("1")) / monthly_rate)
    
    return round_currency(max(Decimal("0"), balance))


# ============================================================================
# PROPERTY VALUE PROJECTIONS
# ============================================================================

def get_growth_rate_for_year(
    year: int,
    growth_rates: List[Dict[str, Any]],
    default_rate: Decimal = Decimal("5.0")
) -> Decimal:
    """
    Determine applicable growth rate for a given year.
    
    Args:
        year: Target year
        growth_rates: List of dicts with start_year, end_year, growth_rate
        default_rate: Default rate if no matching period found
    
    Returns:
        Growth rate as percentage (e.g., 5.0 for 5%)
    """
    if not growth_rates:
        return to_decimal(default_rate)
    
    for period in growth_rates:
        start = period.get("start_year", 0)
        end = period.get("end_year")
        
        if year >= start and (end is None or year <= end):
            return to_decimal(period.get("growth_rate", default_rate))
    
    # Use the last defined rate if year is beyond all periods
    return to_decimal(growth_rates[-1].get("growth_rate", default_rate))


def calculate_property_value(
    base_value: Decimal,
    base_year: int,
    target_year: int,
    growth_rates: List[Dict[str, Any]],
    valuations: Optional[List[Dict[str, Any]]] = None
) -> Decimal:
    """
    Project property value to future year using growth rates.
    
    Uses most recent valuation as base if available, otherwise purchase value.
    Applies compound growth: FV = PV × (1 + r)^n
    
    Args:
        base_value: Starting property value
        base_year: Year of base value
        target_year: Target year for projection
        growth_rates: List of growth rate periods
        valuations: Optional list of historical valuations
    
    Returns:
        Projected property value
    """
    base_value = to_decimal(base_value)
    
    # If we have valuations, use the most recent one as base
    if valuations:
        sorted_vals = sorted(valuations, key=lambda v: v.get("valuation_date", ""))
        if sorted_vals:
            last_val = sorted_vals[-1]
            base_value = to_decimal(last_val.get("value", base_value))
            # Extract year from valuation date
            val_date = last_val.get("valuation_date")
            if isinstance(val_date, date):
                base_year = val_date.year
            elif isinstance(val_date, str):
                base_year = int(val_date[:4])
    
    # Project year by year applying growth rates
    current_value = base_value
    for year in range(base_year, target_year):
        growth_rate = get_growth_rate_for_year(year, growth_rates)
        growth_multiplier = Decimal("1") + (growth_rate / Decimal("100"))
        current_value = current_value * growth_multiplier
    
    return round_currency(current_value)


# ============================================================================
# INCOME & EXPENSE PROJECTIONS
# ============================================================================

def calculate_rental_income_for_year(
    rental_incomes: List[Dict[str, Any]],
    target_year: int,
    base_year: Optional[int] = None
) -> Decimal:
    """
    Calculate annual rental income for a given year with growth.
    
    Args:
        rental_incomes: List of rental income records
        target_year: Target year
        base_year: Base year for growth calculation (defaults to current year)
    
    Returns:
        Annual rental income
    """
    if not rental_incomes:
        return Decimal("0")
    
    if base_year is None:
        base_year = date.today().year
    
    years_elapsed = max(0, target_year - base_year)
    total_income = Decimal("0")
    
    for rental in rental_incomes:
        amount = to_decimal(rental.get("amount", 0))
        frequency = rental.get("frequency", "Weekly")
        growth_rate = to_decimal(rental.get("growth_rate", 3))
        vacancy_weeks = to_decimal(rental.get("vacancy_weeks_per_year", 2))
        
        # Annualize the amount
        annual_amount = annualize_amount(amount, frequency)
        
        # Apply growth
        growth_multiplier = (Decimal("1") + growth_rate / Decimal("100")) ** years_elapsed
        projected_amount = annual_amount * growth_multiplier
        
        # Apply vacancy adjustment (reduce by vacancy weeks / 52)
        vacancy_factor = Decimal("1") - (vacancy_weeks / Decimal("52"))
        adjusted_amount = projected_amount * vacancy_factor
        
        total_income += adjusted_amount
    
    return round_currency(total_income)


def calculate_expenses_for_year(
    expenses: List[Dict[str, Any]],
    target_year: int,
    base_year: Optional[int] = None,
    expense_growth_override: Optional[Decimal] = None
) -> Decimal:
    """
    Calculate annual expenses for a given year with growth.
    
    Args:
        expenses: List of expense records
        target_year: Target year
        base_year: Base year for growth calculation
        expense_growth_override: Optional override for all expense growth rates
    
    Returns:
        Total annual expenses
    """
    if not expenses:
        return Decimal("0")
    
    if base_year is None:
        base_year = date.today().year
    
    years_elapsed = max(0, target_year - base_year)
    total_expenses = Decimal("0")
    
    for expense in expenses:
        amount = to_decimal(expense.get("amount", 0))
        frequency = expense.get("frequency", "Monthly")
        growth_rate = to_decimal(expense.get("growth_rate", 2.5))
        
        if expense_growth_override is not None:
            growth_rate = to_decimal(expense_growth_override)
        
        # Annualize the amount
        annual_amount = annualize_amount(amount, frequency)
        
        # Apply growth
        growth_multiplier = (Decimal("1") + growth_rate / Decimal("100")) ** years_elapsed
        projected_amount = annual_amount * growth_multiplier
        
        total_expenses += projected_amount
    
    return round_currency(total_expenses)


# ============================================================================
# EQUITY CALCULATIONS
# ============================================================================

def calculate_property_equity(
    property_value: Decimal,
    loans: List[Dict[str, Any]],
    target_year: int,
    base_year: Optional[int] = None,
    interest_rate_offset: Decimal = Decimal("0")
) -> Dict[str, Decimal]:
    """
    Calculate property equity at a given year.
    
    Equity = Property Value - Total Debt
    LVR = Total Debt / Property Value × 100
    
    Args:
        property_value: Projected property value at target year
        loans: List of loan records
        target_year: Target year
        base_year: Base year for calculations
        interest_rate_offset: Rate adjustment for scenario modeling
    
    Returns:
        Dict with property_value, total_debt, equity, lvr
    """
    property_value = to_decimal(property_value)
    
    if base_year is None:
        base_year = date.today().year
    
    years_elapsed = max(0, target_year - base_year)
    total_debt = Decimal("0")
    
    for loan in loans:
        original_amount = to_decimal(loan.get("original_amount", 0))
        current_amount = to_decimal(loan.get("current_amount", original_amount))
        interest_rate = to_decimal(loan.get("interest_rate", 6))
        loan_structure = loan.get("loan_structure", "PrincipalAndInterest")
        term_years = int(loan.get("remaining_term_years", 30))
        offset_balance = to_decimal(loan.get("offset_balance", 0))
        
        # Calculate remaining balance
        remaining = calculate_remaining_balance(
            current_amount - offset_balance,
            interest_rate,
            term_years,
            years_elapsed,
            loan_structure,
            interest_rate_offset
        )
        
        total_debt += remaining
    
    equity = property_value - total_debt
    lvr = (total_debt / property_value * Decimal("100")) if property_value > 0 else Decimal("0")
    
    return {
        "property_value": round_currency(property_value),
        "total_debt": round_currency(total_debt),
        "equity": round_currency(equity),
        "lvr": lvr.quantize(Decimal("0.01")),
    }


# ============================================================================
# CASHFLOW CALCULATIONS
# ============================================================================

def calculate_property_cashflow(
    loans: List[Dict[str, Any]],
    rental_income: Decimal,
    expenses: Decimal,
    depreciation: Decimal = Decimal("0"),
    interest_rate_offset: Decimal = Decimal("0")
) -> Dict[str, Decimal]:
    """
    Calculate property cashflow for a given year.
    
    Net Cashflow = Rental Income - Loan Repayments - Expenses
    (Depreciation is a non-cash deduction for tax purposes)
    
    Args:
        loans: List of loan records
        rental_income: Annual rental income
        expenses: Annual expenses
        depreciation: Annual depreciation (for reporting)
        interest_rate_offset: Rate adjustment for scenario modeling
    
    Returns:
        Dict with rental_income, loan_repayments, expenses, depreciation, net_cashflow
    """
    total_repayments = Decimal("0")
    
    for loan in loans:
        current_amount = to_decimal(loan.get("current_amount", loan.get("original_amount", 0)))
        interest_rate = to_decimal(loan.get("interest_rate", 6))
        loan_structure = loan.get("loan_structure", "PrincipalAndInterest")
        term_years = int(loan.get("remaining_term_years", 30))
        frequency = loan.get("repayment_frequency", "Monthly")
        offset_balance = to_decimal(loan.get("offset_balance", 0))
        
        # Calculate on net balance (after offset)
        net_balance = current_amount - offset_balance
        
        repayment = calculate_loan_repayment(
            net_balance,
            interest_rate,
            loan_structure,
            term_years,
            frequency,
            interest_rate_offset
        )
        
        total_repayments += repayment["annual_payment"]
    
    net_cashflow = rental_income - total_repayments - expenses
    
    return {
        "rental_income": round_currency(rental_income),
        "loan_repayments": round_currency(total_repayments),
        "expenses": round_currency(expenses),
        "depreciation": round_currency(depreciation),
        "net_cashflow": round_currency(net_cashflow),
    }


# ============================================================================
# PORTFOLIO-LEVEL CALCULATIONS
# ============================================================================

def calculate_portfolio_summary(
    properties_data: List[Dict[str, Any]],
    target_year: int,
    base_year: Optional[int] = None,
    expense_growth_override: Optional[Decimal] = None,
    interest_rate_offset: Decimal = Decimal("0")
) -> Dict[str, Decimal]:
    """
    Calculate aggregated portfolio metrics for a single year.
    
    Args:
        properties_data: List of property data dicts containing property, loans, etc.
        target_year: Target year for projection
        base_year: Base year for calculations
        expense_growth_override: Optional expense growth rate override
        interest_rate_offset: Interest rate adjustment for scenarios
    
    Returns:
        Aggregated portfolio metrics
    """
    if base_year is None:
        base_year = date.today().year
    
    totals = {
        "total_value": Decimal("0"),
        "total_debt": Decimal("0"),
        "total_equity": Decimal("0"),
        "total_rental_income": Decimal("0"),
        "total_expenses": Decimal("0"),
        "total_loan_repayments": Decimal("0"),
        "total_net_cashflow": Decimal("0"),
        "portfolio_lvr": Decimal("0"),
    }
    
    for prop_data in properties_data:
        prop = prop_data.get("property", {})
        loans = prop_data.get("loans", [])
        rental_incomes = prop_data.get("rental_incomes", [])
        expenses = prop_data.get("expenses", [])
        growth_rates = prop_data.get("growth_rates", [])
        valuations = prop_data.get("valuations", [])
        
        # Get base value
        base_value = to_decimal(prop.get("current_value", prop.get("purchase_price", 0)))
        
        # Calculate property value
        projected_value = calculate_property_value(
            base_value, base_year, target_year, growth_rates, valuations
        )
        
        # Calculate equity
        equity_data = calculate_property_equity(
            projected_value, loans, target_year, base_year, interest_rate_offset
        )
        
        # Calculate income and expenses
        rental_income = calculate_rental_income_for_year(rental_incomes, target_year, base_year)
        annual_expenses = calculate_expenses_for_year(
            expenses, target_year, base_year, expense_growth_override
        )
        
        # Calculate cashflow
        cashflow_data = calculate_property_cashflow(
            loans, rental_income, annual_expenses, Decimal("0"), interest_rate_offset
        )
        
        # Aggregate
        totals["total_value"] += equity_data["property_value"]
        totals["total_debt"] += equity_data["total_debt"]
        totals["total_equity"] += equity_data["equity"]
        totals["total_rental_income"] += cashflow_data["rental_income"]
        totals["total_expenses"] += cashflow_data["expenses"]
        totals["total_loan_repayments"] += cashflow_data["loan_repayments"]
        totals["total_net_cashflow"] += cashflow_data["net_cashflow"]
    
    # Calculate portfolio LVR
    if totals["total_value"] > 0:
        totals["portfolio_lvr"] = (
            totals["total_debt"] / totals["total_value"] * Decimal("100")
        ).quantize(Decimal("0.01"))
    
    return totals


def generate_portfolio_projections(
    properties_data: List[Dict[str, Any]],
    start_year: int,
    end_year: int,
    expense_growth_override: Optional[Decimal] = None,
    interest_rate_offset: Decimal = Decimal("0")
) -> List[Dict[str, Any]]:
    """
    Generate multi-year projections for entire portfolio.
    
    Args:
        properties_data: List of property data dicts
        start_year: First year of projection
        end_year: Last year of projection (inclusive)
        expense_growth_override: Optional expense growth rate override
        interest_rate_offset: Interest rate adjustment for scenarios
    
    Returns:
        List of yearly projection dicts
    """
    projections = []
    
    for year in range(start_year, end_year + 1):
        summary = calculate_portfolio_summary(
            properties_data,
            year,
            start_year,
            expense_growth_override,
            interest_rate_offset
        )
        
        projections.append({
            "year": year,
            "total_value": summary["total_value"],
            "total_debt": summary["total_debt"],
            "total_equity": summary["total_equity"],
            "portfolio_lvr": summary["portfolio_lvr"],
            "total_rental_income": summary["total_rental_income"],
            "total_expenses": summary["total_expenses"],
            "total_loan_repayments": summary["total_loan_repayments"],
            "total_net_cashflow": summary["total_net_cashflow"],
        })
    
    return projections
