"""
Unit Tests for Financial Calculation Engine
Tests all calculation functions with known inputs and expected outputs.
Validates decimal precision and edge cases.
"""

import pytest
from decimal import Decimal
from datetime import date
import sys
import os

# Add project paths for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from utils.calculations import (
    to_decimal,
    round_currency,
    annualize_amount,
    calculate_interest_only_repayment,
    calculate_principal_and_interest_repayment,
    calculate_loan_repayment,
    calculate_remaining_balance,
    get_growth_rate_for_year,
    calculate_property_value,
    calculate_rental_income_for_year,
    calculate_expenses_for_year,
    calculate_property_equity,
    calculate_property_cashflow,
    calculate_portfolio_summary,
    generate_portfolio_projections,
)


# ============================================================================
# UTILITY FUNCTION TESTS
# ============================================================================

class TestUtilityFunctions:
    """Tests for utility functions"""
    
    def test_to_decimal_from_int(self):
        assert to_decimal(100) == Decimal("100")
    
    def test_to_decimal_from_float(self):
        result = to_decimal(100.50)
        assert result == Decimal("100.5")
    
    def test_to_decimal_from_string(self):
        assert to_decimal("1000.25") == Decimal("1000.25")
    
    def test_to_decimal_from_none(self):
        assert to_decimal(None) == Decimal("0")
    
    def test_round_currency(self):
        assert round_currency(Decimal("100.456")) == Decimal("100.46")
        assert round_currency(Decimal("100.454")) == Decimal("100.45")
    
    def test_annualize_weekly(self):
        assert annualize_amount(Decimal("500"), "Weekly") == Decimal("26000")
    
    def test_annualize_monthly(self):
        assert annualize_amount(Decimal("2000"), "Monthly") == Decimal("24000")
    
    def test_annualize_fortnightly(self):
        assert annualize_amount(Decimal("1000"), "Fortnightly") == Decimal("26000")


# ============================================================================
# LOAN CALCULATION TESTS
# ============================================================================

class TestInterestOnlyCalculations:
    """Tests for Interest-Only loan calculations"""
    
    def test_basic_io_calculation(self):
        """$500,000 loan at 6% = $30,000/year = $2,500/month"""
        result = calculate_interest_only_repayment(
            principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            frequency="Monthly"
        )
        
        assert result["annual_payment"] == Decimal("30000.00")
        assert result["monthly_payment"] == Decimal("2500.00")
        assert result["principal_portion"] == Decimal("0")
    
    def test_io_with_rate_offset(self):
        """$500,000 loan at 6% + 2% offset = $40,000/year"""
        result = calculate_interest_only_repayment(
            principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            frequency="Monthly",
            rate_offset=Decimal("2.0")
        )
        
        assert result["annual_payment"] == Decimal("40000.00")
    
    def test_io_weekly_frequency(self):
        """$500,000 loan at 6%, weekly payments"""
        result = calculate_interest_only_repayment(
            principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            frequency="Weekly"
        )
        
        # $30,000 / 52 weeks ≈ $576.92
        assert result["payment_per_frequency"] == Decimal("576.92")


class TestPrincipalAndInterestCalculations:
    """Tests for P&I loan calculations"""
    
    def test_basic_pi_calculation(self):
        """$500,000 loan at 6% for 30 years ≈ $2,998/month"""
        result = calculate_principal_and_interest_repayment(
            principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            term_years=30,
            frequency="Monthly"
        )
        
        # Expected monthly payment is approximately $2,997.75
        monthly = result["monthly_payment"]
        assert Decimal("2990") < monthly < Decimal("3010")
    
    def test_pi_zero_interest(self):
        """$120,000 loan at 0% for 10 years = $1,000/month"""
        result = calculate_principal_and_interest_repayment(
            principal=Decimal("120000"),
            annual_interest_rate=Decimal("0"),
            term_years=10,
            frequency="Monthly"
        )
        
        assert result["monthly_payment"] == Decimal("1000.00")
    
    def test_pi_short_term(self):
        """$100,000 loan at 5% for 5 years"""
        result = calculate_principal_and_interest_repayment(
            principal=Decimal("100000"),
            annual_interest_rate=Decimal("5.0"),
            term_years=5,
            frequency="Monthly"
        )
        
        # Expected approximately $1,887/month
        monthly = result["monthly_payment"]
        assert Decimal("1880") < monthly < Decimal("1900")


class TestRemainingBalanceCalculations:
    """Tests for remaining balance calculations"""
    
    def test_io_balance_unchanged(self):
        """Interest-only loans don't reduce principal"""
        balance = calculate_remaining_balance(
            original_principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            total_term_years=30,
            years_elapsed=10,
            loan_structure="InterestOnly"
        )
        
        assert balance == Decimal("500000.00")
    
    def test_pi_balance_reduces(self):
        """P&I loans reduce principal over time"""
        balance = calculate_remaining_balance(
            original_principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            total_term_years=30,
            years_elapsed=10,
            loan_structure="PrincipalAndInterest"
        )
        
        # After 10 years of 30-year loan, should be roughly 75-80% of original
        assert Decimal("350000") < balance < Decimal("420000")
    
    def test_fully_paid_after_term(self):
        """Loan should be $0 after full term"""
        balance = calculate_remaining_balance(
            original_principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            total_term_years=30,
            years_elapsed=30,
            loan_structure="PrincipalAndInterest"
        )
        
        assert balance == Decimal("0")
    
    def test_zero_years_elapsed(self):
        """Balance should equal principal at year 0"""
        balance = calculate_remaining_balance(
            original_principal=Decimal("500000"),
            annual_interest_rate=Decimal("6.0"),
            total_term_years=30,
            years_elapsed=0,
            loan_structure="PrincipalAndInterest"
        )
        
        assert balance == Decimal("500000.00")


# ============================================================================
# PROPERTY VALUE TESTS
# ============================================================================

class TestPropertyValueProjections:
    """Tests for property value projections"""
    
    def test_compound_growth(self):
        """$1,000,000 at 5% for 10 years = $1,628,894.63"""
        growth_rates = [{"start_year": 2024, "end_year": None, "growth_rate": Decimal("5.0")}]
        
        result = calculate_property_value(
            base_value=Decimal("1000000"),
            base_year=2024,
            target_year=2034,
            growth_rates=growth_rates
        )
        
        # 1,000,000 × (1.05)^10 = 1,628,894.63
        expected = Decimal("1628894.63")
        assert abs(result - expected) < Decimal("1")
    
    def test_get_growth_rate_default(self):
        """Should return default rate when no periods defined"""
        rate = get_growth_rate_for_year(2025, [], Decimal("5.0"))
        assert rate == Decimal("5.0")
    
    def test_get_growth_rate_matching_period(self):
        """Should return rate from matching period"""
        growth_rates = [
            {"start_year": 2024, "end_year": 2026, "growth_rate": Decimal("7.0")},
            {"start_year": 2027, "end_year": None, "growth_rate": Decimal("4.0")},
        ]
        
        assert get_growth_rate_for_year(2025, growth_rates) == Decimal("7.0")
        assert get_growth_rate_for_year(2028, growth_rates) == Decimal("4.0")


# ============================================================================
# INCOME/EXPENSE TESTS
# ============================================================================

class TestRentalIncomeCalculations:
    """Tests for rental income calculations"""
    
    def test_weekly_rent_annualized(self):
        """$600/week rent = $31,200/year (no growth, no vacancy)"""
        rental_incomes = [{
            "amount": Decimal("600"),
            "frequency": "Weekly",
            "growth_rate": Decimal("0"),
            "vacancy_weeks_per_year": 0,
        }]
        
        result = calculate_rental_income_for_year(
            rental_incomes, 
            target_year=2024, 
            base_year=2024
        )
        
        assert result == Decimal("31200.00")
    
    def test_rental_with_vacancy(self):
        """$600/week rent with 2 weeks vacancy"""
        rental_incomes = [{
            "amount": Decimal("600"),
            "frequency": "Weekly",
            "growth_rate": Decimal("0"),
            "vacancy_weeks_per_year": 2,
        }]
        
        result = calculate_rental_income_for_year(
            rental_incomes, 
            target_year=2024, 
            base_year=2024
        )
        
        # $31,200 × (1 - 2/52) = $30,000
        expected = Decimal("30000.00")
        assert result == expected
    
    def test_rental_with_growth(self):
        """$600/week with 3% growth over 5 years"""
        rental_incomes = [{
            "amount": Decimal("600"),
            "frequency": "Weekly",
            "growth_rate": Decimal("3.0"),
            "vacancy_weeks_per_year": 0,
        }]
        
        result = calculate_rental_income_for_year(
            rental_incomes, 
            target_year=2029, 
            base_year=2024
        )
        
        # $31,200 × (1.03)^5 ≈ $36,173.51 (allow small rounding difference)
        expected = Decimal("36173.51")
        assert abs(result - expected) < Decimal("10")  # Allow $10 tolerance for rounding


class TestExpenseCalculations:
    """Tests for expense calculations"""
    
    def test_annual_expense(self):
        """$5,000 annual council rates (no growth)"""
        expenses = [{
            "amount": Decimal("5000"),
            "frequency": "Annually",
            "growth_rate": Decimal("0"),
        }]
        
        result = calculate_expenses_for_year(
            expenses, 
            target_year=2024, 
            base_year=2024
        )
        
        assert result == Decimal("5000.00")
    
    def test_multiple_expenses(self):
        """Multiple expense categories"""
        expenses = [
            {"amount": Decimal("4000"), "frequency": "Annually", "growth_rate": Decimal("0")},
            {"amount": Decimal("200"), "frequency": "Monthly", "growth_rate": Decimal("0")},
        ]
        
        result = calculate_expenses_for_year(
            expenses, 
            target_year=2024, 
            base_year=2024
        )
        
        # $4,000 + ($200 × 12) = $6,400
        assert result == Decimal("6400.00")


# ============================================================================
# EQUITY TESTS
# ============================================================================

class TestEquityCalculations:
    """Tests for equity calculations"""
    
    def test_basic_equity(self):
        """Property $1,000,000, Loan $600,000 = Equity $400,000"""
        loans = [{
            "original_amount": Decimal("600000"),
            "current_amount": Decimal("600000"),
            "interest_rate": Decimal("6.0"),
            "loan_structure": "InterestOnly",
            "remaining_term_years": 30,
            "offset_balance": Decimal("0"),
        }]
        
        result = calculate_property_equity(
            property_value=Decimal("1000000"),
            loans=loans,
            target_year=2024,
            base_year=2024
        )
        
        assert result["property_value"] == Decimal("1000000.00")
        assert result["total_debt"] == Decimal("600000.00")
        assert result["equity"] == Decimal("400000.00")
        assert result["lvr"] == Decimal("60.00")
    
    def test_equity_with_offset(self):
        """Offset account reduces effective debt"""
        loans = [{
            "original_amount": Decimal("600000"),
            "current_amount": Decimal("600000"),
            "interest_rate": Decimal("6.0"),
            "loan_structure": "InterestOnly",
            "remaining_term_years": 30,
            "offset_balance": Decimal("100000"),
        }]
        
        result = calculate_property_equity(
            property_value=Decimal("1000000"),
            loans=loans,
            target_year=2024,
            base_year=2024
        )
        
        # Debt should be reduced by offset
        assert result["total_debt"] == Decimal("500000.00")
        assert result["equity"] == Decimal("500000.00")


# ============================================================================
# CASHFLOW TESTS
# ============================================================================

class TestCashflowCalculations:
    """Tests for cashflow calculations"""
    
    def test_positive_cashflow(self):
        """Rental income exceeds costs"""
        loans = [{
            "current_amount": Decimal("400000"),
            "interest_rate": Decimal("6.0"),
            "loan_structure": "InterestOnly",
            "remaining_term_years": 30,
            "repayment_frequency": "Monthly",
            "offset_balance": Decimal("0"),
        }]
        
        result = calculate_property_cashflow(
            loans=loans,
            rental_income=Decimal("36000"),  # $36k/year
            expenses=Decimal("8000"),  # $8k/year
            depreciation=Decimal("5000")
        )
        
        # Loan repayment = $400k × 6% = $24k/year
        # Net = $36k - $24k - $8k = $4k positive
        assert result["rental_income"] == Decimal("36000.00")
        assert result["loan_repayments"] == Decimal("24000.00")
        assert result["expenses"] == Decimal("8000.00")
        assert result["net_cashflow"] == Decimal("4000.00")
    
    def test_negative_cashflow(self):
        """Costs exceed rental income"""
        loans = [{
            "current_amount": Decimal("800000"),
            "interest_rate": Decimal("7.0"),
            "loan_structure": "InterestOnly",
            "remaining_term_years": 30,
            "repayment_frequency": "Monthly",
            "offset_balance": Decimal("0"),
        }]
        
        result = calculate_property_cashflow(
            loans=loans,
            rental_income=Decimal("30000"),
            expenses=Decimal("10000"),
        )
        
        # Loan repayment = $800k × 7% = $56k/year
        # Net = $30k - $56k - $10k = -$36k negative
        assert result["net_cashflow"] == Decimal("-36000.00")


# ============================================================================
# PORTFOLIO TESTS
# ============================================================================

class TestPortfolioProjections:
    """Tests for portfolio-level calculations"""
    
    def test_single_property_portfolio(self):
        """Portfolio with single property"""
        properties_data = [{
            "property": {
                "current_value": Decimal("1000000"),
                "purchase_price": Decimal("900000"),
            },
            "loans": [{
                "original_amount": Decimal("600000"),
                "current_amount": Decimal("600000"),
                "interest_rate": Decimal("6.0"),
                "loan_structure": "InterestOnly",
                "remaining_term_years": 30,
                "offset_balance": Decimal("0"),
            }],
            "rental_incomes": [{
                "amount": Decimal("600"),
                "frequency": "Weekly",
                "growth_rate": Decimal("3.0"),
                "vacancy_weeks_per_year": 2,
            }],
            "expenses": [{
                "amount": Decimal("8000"),
                "frequency": "Annually",
                "growth_rate": Decimal("2.5"),
            }],
            "growth_rates": [{
                "start_year": 2024,
                "end_year": None,
                "growth_rate": Decimal("5.0"),
            }],
            "valuations": [],
        }]
        
        summary = calculate_portfolio_summary(
            properties_data,
            target_year=2024,
            base_year=2024
        )
        
        assert summary["total_value"] == Decimal("1000000.00")
        assert summary["total_debt"] == Decimal("600000.00")
        assert summary["total_equity"] == Decimal("400000.00")
        assert summary["portfolio_lvr"] == Decimal("60.00")
    
    def test_multi_year_projections(self):
        """Generate 10-year projections"""
        properties_data = [{
            "property": {"current_value": Decimal("1000000")},
            "loans": [{
                "original_amount": Decimal("600000"),
                "current_amount": Decimal("600000"),
                "interest_rate": Decimal("6.0"),
                "loan_structure": "PrincipalAndInterest",
                "remaining_term_years": 30,
                "offset_balance": Decimal("0"),
            }],
            "rental_incomes": [],
            "expenses": [],
            "growth_rates": [{"start_year": 2024, "end_year": None, "growth_rate": Decimal("5.0")}],
            "valuations": [],
        }]
        
        projections = generate_portfolio_projections(
            properties_data,
            start_year=2024,
            end_year=2034
        )
        
        # Should have 11 years (2024-2034 inclusive)
        assert len(projections) == 11
        
        # Year 2024 should be base values
        assert projections[0]["year"] == 2024
        
        # Year 2034 should show growth
        year_10 = projections[-1]
        assert year_10["year"] == 2034
        assert year_10["total_value"] > Decimal("1600000")  # ~$1.63M with 5% growth
        assert year_10["total_debt"] < Decimal("510000")  # Reduced by P&I payments (allow margin)


# ============================================================================
# EDGE CASES AND DECIMAL PRECISION
# ============================================================================

class TestEdgeCases:
    """Tests for edge cases and decimal precision"""
    
    def test_zero_loan_amount(self):
        """Handle zero loan amount gracefully"""
        result = calculate_interest_only_repayment(
            principal=Decimal("0"),
            annual_interest_rate=Decimal("6.0")
        )
        assert result["monthly_payment"] == Decimal("0")
    
    def test_empty_loans_list(self):
        """Handle empty loans list"""
        result = calculate_property_equity(
            property_value=Decimal("1000000"),
            loans=[],
            target_year=2024
        )
        assert result["total_debt"] == Decimal("0")
        assert result["equity"] == Decimal("1000000.00")
        assert result["lvr"] == Decimal("0")
    
    def test_decimal_precision_no_float_errors(self):
        """Ensure no floating point errors accumulate"""
        # This test ensures we don't get results like 0.30000000000000004
        loans = [{
            "current_amount": Decimal("333333.33"),
            "interest_rate": Decimal("6.66"),
            "loan_structure": "InterestOnly",
            "remaining_term_years": 30,
            "repayment_frequency": "Monthly",
            "offset_balance": Decimal("0"),
        }]
        
        result = calculate_property_cashflow(
            loans=loans,
            rental_income=Decimal("33333.33"),
            expenses=Decimal("3333.33"),
        )
        
        # All results should be clean decimals, not float-ish
        cashflow_str = str(result["net_cashflow"])
        assert "e" not in cashflow_str.lower()  # No scientific notation
        assert len(cashflow_str.split(".")[-1]) <= 2  # Max 2 decimal places


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
