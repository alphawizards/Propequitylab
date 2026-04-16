#!/usr/bin/env python3
"""
Backend API Test Suite for PropEquityLab Financial Planning App
Tests Phase 4: Assets & Liabilities API endpoints
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://8ed6ce0a-a567-4e35-a121-0e1572dabac7.preview.emergentagent.com/api"
DEV_USER_ID = "dev-user-01"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        self.portfolio_id = None
        self.created_asset_id = None
        self.created_liability_id = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> tuple[bool, Any, str]:
        """Make HTTP request and return success, response data, and error message"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                return False, None, f"Unsupported method: {method}"
            
            if response.status_code in [200, 201]:
                return True, response.json(), ""
            else:
                return False, response.text, f"HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.RequestException as e:
            return False, None, f"Request failed: {str(e)}"
        except json.JSONDecodeError as e:
            return False, response.text, f"JSON decode error: {str(e)}"
    
    def test_health_check(self):
        """Test basic API health"""
        success, data, error = self.make_request("GET", "/health")
        
        if success and data.get("status") == "healthy":
            self.log_test("Health Check", True, f"API is healthy, dev_user_id: {data.get('dev_user_id')}")
        else:
            self.log_test("Health Check", False, error, data)
    
    def test_get_portfolios(self):
        """Test getting portfolios and store portfolio_id for later tests"""
        success, data, error = self.make_request("GET", "/portfolios")
        
        if success:
            if isinstance(data, list) and len(data) > 0:
                self.portfolio_id = data[0]["id"]
                self.log_test("GET /portfolios", True, f"Found {len(data)} portfolios, using portfolio_id: {self.portfolio_id}")
            else:
                self.log_test("GET /portfolios", True, "No existing portfolios found, will create one")
        else:
            self.log_test("GET /portfolios", False, error, data)
    
    def test_create_portfolio(self):
        """Create a test portfolio if none exists"""
        if self.portfolio_id:
            return  # Already have a portfolio
            
        portfolio_data = {
            "name": "Test Portfolio for Assets & Liabilities",
            "type": "personal"
        }
        
        success, data, error = self.make_request("POST", "/portfolios", portfolio_data)
        
        if success and "id" in data:
            self.portfolio_id = data["id"]
            self.log_test("POST /portfolios (create)", True, f"Created portfolio with id: {self.portfolio_id}")
        else:
            self.log_test("POST /portfolios (create)", False, error, data)
    
    def test_asset_types(self):
        """Test getting asset types"""
        success, data, error = self.make_request("GET", "/assets/types")
        
        if success and "types" in data and isinstance(data["types"], list):
            types = data["types"]
            expected_types = ["super", "shares", "etf", "managed_fund", "crypto", "cash", "bonds", "term_deposit", "other"]
            
            if all(t in types for t in expected_types):
                self.log_test("GET /assets/types", True, f"Found {len(types)} asset types: {', '.join(types)}")
            else:
                self.log_test("GET /assets/types", False, f"Missing expected asset types. Got: {types}")
        else:
            self.log_test("GET /assets/types", False, error, data)
    
    def test_get_portfolio_assets_empty(self):
        """Test getting assets for portfolio (should be empty initially)"""
        if not self.portfolio_id:
            self.log_test("GET /assets/portfolio/{id} (empty)", False, "No portfolio_id available")
            return
            
        success, data, error = self.make_request("GET", f"/assets/portfolio/{self.portfolio_id}")
        
        if success and isinstance(data, list):
            self.log_test("GET /assets/portfolio/{id} (empty)", True, f"Found {len(data)} existing assets")
        else:
            self.log_test("GET /assets/portfolio/{id} (empty)", False, error, data)
    
    def test_create_asset(self):
        """Test creating a new asset"""
        if not self.portfolio_id:
            self.log_test("POST /assets", False, "No portfolio_id available")
            return
            
        asset_data = {
            "portfolio_id": self.portfolio_id,
            "name": "Test Superannuation Fund",
            "type": "super",
            "owner": "you",
            "institution": "AustralianSuper",
            "current_value": 150000,
            "purchase_value": 100000,
            "expected_return": 8.0,
            "tax_environment": "tax_deferred",
            "contributions": {
                "amount": 500,
                "frequency": "monthly",
                "employer_contribution": 800,
                "growth_rate": 3
            }
        }
        
        success, data, error = self.make_request("POST", "/assets", asset_data)
        
        if success and "id" in data:
            self.created_asset_id = data["id"]
            # Verify the created asset has correct data
            if (data.get("name") == asset_data["name"] and 
                data.get("type") == asset_data["type"] and
                data.get("current_value") == asset_data["current_value"]):
                self.log_test("POST /assets", True, f"Created asset with id: {self.created_asset_id}")
            else:
                self.log_test("POST /assets", False, "Asset created but data doesn't match", data)
        else:
            self.log_test("POST /assets", False, error, data)
    
    def test_get_specific_asset(self):
        """Test getting a specific asset by ID"""
        if not self.created_asset_id:
            self.log_test("GET /assets/{id}", False, "No asset_id available")
            return
            
        success, data, error = self.make_request("GET", f"/assets/{self.created_asset_id}")
        
        if success and data.get("id") == self.created_asset_id:
            self.log_test("GET /assets/{id}", True, f"Retrieved asset: {data.get('name')}")
        else:
            self.log_test("GET /assets/{id}", False, error, data)
    
    def test_update_asset(self):
        """Test updating an asset"""
        if not self.created_asset_id:
            self.log_test("PUT /assets/{id}", False, "No asset_id available")
            return
            
        update_data = {
            "current_value": 160000
        }
        
        success, data, error = self.make_request("PUT", f"/assets/{self.created_asset_id}", update_data)
        
        if success and data.get("current_value") == 160000:
            self.log_test("PUT /assets/{id}", True, f"Updated asset current_value to {data.get('current_value')}")
        else:
            self.log_test("PUT /assets/{id}", False, error, data)
    
    def test_get_portfolio_assets_with_data(self):
        """Test getting assets for portfolio (should have our created asset)"""
        if not self.portfolio_id:
            self.log_test("GET /assets/portfolio/{id} (with data)", False, "No portfolio_id available")
            return
            
        success, data, error = self.make_request("GET", f"/assets/portfolio/{self.portfolio_id}")
        
        if success and isinstance(data, list) and len(data) > 0:
            # Check if our created asset is in the list
            asset_found = any(asset.get("id") == self.created_asset_id for asset in data)
            if asset_found:
                self.log_test("GET /assets/portfolio/{id} (with data)", True, f"Found {len(data)} assets including our created asset")
            else:
                self.log_test("GET /assets/portfolio/{id} (with data)", False, f"Created asset not found in portfolio assets list")
        else:
            self.log_test("GET /assets/portfolio/{id} (with data)", False, error, data)
    
    def test_liability_types(self):
        """Test getting liability types"""
        success, data, error = self.make_request("GET", "/liabilities/types")
        
        if success and "types" in data and isinstance(data["types"], list):
            types = data["types"]
            expected_types = ["car_loan", "credit_card", "hecs", "personal_loan", "margin_loan", "buy_now_pay_later", "other"]
            
            if all(t in types for t in expected_types):
                self.log_test("GET /liabilities/types", True, f"Found {len(types)} liability types: {', '.join(types)}")
            else:
                self.log_test("GET /liabilities/types", False, f"Missing expected liability types. Got: {types}")
        else:
            self.log_test("GET /liabilities/types", False, error, data)
    
    def test_get_portfolio_liabilities_empty(self):
        """Test getting liabilities for portfolio (should be empty initially)"""
        if not self.portfolio_id:
            self.log_test("GET /liabilities/portfolio/{id} (empty)", False, "No portfolio_id available")
            return
            
        success, data, error = self.make_request("GET", f"/liabilities/portfolio/{self.portfolio_id}")
        
        if success and isinstance(data, list):
            self.log_test("GET /liabilities/portfolio/{id} (empty)", True, f"Found {len(data)} existing liabilities")
        else:
            self.log_test("GET /liabilities/portfolio/{id} (empty)", False, error, data)
    
    def test_create_liability(self):
        """Test creating a new liability"""
        if not self.portfolio_id:
            self.log_test("POST /liabilities", False, "No portfolio_id available")
            return
            
        liability_data = {
            "portfolio_id": self.portfolio_id,
            "name": "Car Loan",
            "type": "car_loan",
            "owner": "you",
            "lender": "ANZ Bank",
            "original_amount": 35000,
            "current_balance": 28000,
            "interest_rate": 7.5,
            "minimum_payment": 650,
            "payment_frequency": "monthly",
            "payoff_strategy": "minimum"
        }
        
        success, data, error = self.make_request("POST", "/liabilities", liability_data)
        
        if success and "id" in data:
            self.created_liability_id = data["id"]
            # Verify the created liability has correct data
            if (data.get("name") == liability_data["name"] and 
                data.get("type") == liability_data["type"] and
                data.get("current_balance") == liability_data["current_balance"]):
                self.log_test("POST /liabilities", True, f"Created liability with id: {self.created_liability_id}")
            else:
                self.log_test("POST /liabilities", False, "Liability created but data doesn't match", data)
        else:
            self.log_test("POST /liabilities", False, error, data)
    
    def test_get_specific_liability(self):
        """Test getting a specific liability by ID"""
        if not self.created_liability_id:
            self.log_test("GET /liabilities/{id}", False, "No liability_id available")
            return
            
        success, data, error = self.make_request("GET", f"/liabilities/{self.created_liability_id}")
        
        if success and data.get("id") == self.created_liability_id:
            self.log_test("GET /liabilities/{id}", True, f"Retrieved liability: {data.get('name')}")
        else:
            self.log_test("GET /liabilities/{id}", False, error, data)
    
    def test_update_liability(self):
        """Test updating a liability"""
        if not self.created_liability_id:
            self.log_test("PUT /liabilities/{id}", False, "No liability_id available")
            return
            
        update_data = {
            "current_balance": 27000
        }
        
        success, data, error = self.make_request("PUT", f"/liabilities/{self.created_liability_id}", update_data)
        
        if success and data.get("current_balance") == 27000:
            self.log_test("PUT /liabilities/{id}", True, f"Updated liability current_balance to {data.get('current_balance')}")
        else:
            self.log_test("PUT /liabilities/{id}", False, error, data)
    
    def test_get_portfolio_liabilities_with_data(self):
        """Test getting liabilities for portfolio (should have our created liability)"""
        if not self.portfolio_id:
            self.log_test("GET /liabilities/portfolio/{id} (with data)", False, "No portfolio_id available")
            return
            
        success, data, error = self.make_request("GET", f"/liabilities/portfolio/{self.portfolio_id}")
        
        if success and isinstance(data, list) and len(data) > 0:
            # Check if our created liability is in the list
            liability_found = any(liability.get("id") == self.created_liability_id for liability in data)
            if liability_found:
                self.log_test("GET /liabilities/portfolio/{id} (with data)", True, f"Found {len(data)} liabilities including our created liability")
            else:
                self.log_test("GET /liabilities/portfolio/{id} (with data)", False, f"Created liability not found in portfolio liabilities list")
        else:
            self.log_test("GET /liabilities/portfolio/{id} (with data)", False, error, data)
    
    def test_delete_asset(self):
        """Test deleting an asset"""
        if not self.created_asset_id:
            self.log_test("DELETE /assets/{id}", False, "No asset_id available")
            return
            
        success, data, error = self.make_request("DELETE", f"/assets/{self.created_asset_id}")
        
        if success and isinstance(data, dict) and "message" in data:
            self.log_test("DELETE /assets/{id}", True, f"Deleted asset: {data.get('message')}")
        else:
            self.log_test("DELETE /assets/{id}", False, error, data)
    
    def test_delete_liability(self):
        """Test deleting a liability"""
        if not self.created_liability_id:
            self.log_test("DELETE /liabilities/{id}", False, "No liability_id available")
            return
            
        success, data, error = self.make_request("DELETE", f"/liabilities/{self.created_liability_id}")
        
        if success and isinstance(data, dict) and "message" in data:
            self.log_test("DELETE /liabilities/{id}", True, f"Deleted liability: {data.get('message')}")
        else:
            self.log_test("DELETE /liabilities/{id}", False, error, data)
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 80)
        print("PROPEQUITYLAB BACKEND API TEST SUITE - PHASE 4: ASSETS & LIABILITIES")
        print("=" * 80)
        print(f"Testing backend at: {self.base_url}")
        print(f"Dev User ID: {DEV_USER_ID}")
        print()
        
        # Basic health check
        self.test_health_check()
        
        # Portfolio setup
        self.test_get_portfolios()
        self.test_create_portfolio()
        
        # Assets API tests
        print("ASSETS API TESTS")
        print("-" * 40)
        self.test_asset_types()
        self.test_get_portfolio_assets_empty()
        self.test_create_asset()
        self.test_get_specific_asset()
        self.test_update_asset()
        self.test_get_portfolio_assets_with_data()
        
        # Liabilities API tests
        print("LIABILITIES API TESTS")
        print("-" * 40)
        self.test_liability_types()
        self.test_get_portfolio_liabilities_empty()
        self.test_create_liability()
        self.test_get_specific_liability()
        self.test_update_liability()
        self.test_get_portfolio_liabilities_with_data()
        
        # Cleanup tests
        print("CLEANUP TESTS")
        print("-" * 40)
        self.test_delete_asset()
        self.test_delete_liability()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("FAILED TESTS:")
            print("-" * 40)
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}")
                    if result["details"]:
                        print(f"   {result['details']}")
            print()
        
        return failed_tests == 0


def main():
    """Main test runner"""
    tester = APITester(BACKEND_URL)
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()