#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ApartmentAPITester:
    def __init__(self, base_url="https://condo-fee-app.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.resident_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.admin_user_id = None
        self.resident_user_id = None
        self.test_flat_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_admin_registration(self):
        """Test admin user registration"""
        admin_data = {
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "AdminPass123!",
            "name": "Test Admin",
            "role": "admin",
            "phone": "1234567890"
        }
        
        success, response = self.run_test(
            "Admin Registration",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_user_id = response['user']['id']
            return True
        return False

    def test_resident_registration(self):
        """Test resident user registration"""
        resident_data = {
            "email": f"resident_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "ResidentPass123!",
            "name": "Test Resident",
            "role": "resident",
            "flat_number": "101",
            "phone": "0987654321"
        }
        
        success, response = self.run_test(
            "Resident Registration",
            "POST",
            "auth/register",
            200,
            data=resident_data
        )
        
        if success and 'token' in response:
            self.resident_token = response['token']
            self.resident_user_id = response['user']['id']
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "AdminPass123!"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_get_current_user(self):
        """Test get current user endpoint"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            token=self.admin_token
        )
        return success

    def test_create_flat(self):
        """Test creating a flat"""
        flat_data = {
            "flat_number": "101",
            "owner_name": "Test Owner",
            "owner_email": "owner@test.com",
            "owner_phone": "1234567890",
            "flat_size": "2BHK",
            "custom_charge": 500.00
        }
        
        success, response = self.run_test(
            "Create Flat",
            "POST",
            "flats",
            200,
            data=flat_data,
            token=self.admin_token
        )
        
        if success and 'id' in response:
            self.test_flat_id = response['id']
            return True
        return False

    def test_get_flats(self):
        """Test getting flats list"""
        success, response = self.run_test(
            "Get Flats",
            "GET",
            "flats",
            200,
            token=self.admin_token
        )
        return success

    def test_update_flat(self):
        """Test updating a flat"""
        if not self.test_flat_id:
            self.log_test("Update Flat", False, "No flat ID available")
            return False
            
        update_data = {
            "flat_number": "101",
            "owner_name": "Updated Owner",
            "owner_email": "updated@test.com",
            "owner_phone": "9876543210",
            "flat_size": "3BHK",
            "custom_charge": 600.00
        }
        
        success, response = self.run_test(
            "Update Flat",
            "PUT",
            f"flats/{self.test_flat_id}",
            200,
            data=update_data,
            token=self.admin_token
        )
        return success

    def test_set_monthly_charges(self):
        """Test setting monthly charges"""
        current_date = datetime.now()
        charge_data = {
            "month": current_date.month,
            "year": current_date.year,
            "base_charge": 500.00,
            "breakdown": {
                "water": 100.00,
                "security": 150.00,
                "maintenance": 200.00,
                "repairs": 50.00
            }
        }
        
        success, response = self.run_test(
            "Set Monthly Charges",
            "POST",
            "charges",
            200,
            data=charge_data,
            token=self.admin_token
        )
        return success

    def test_get_charges(self):
        """Test getting monthly charges"""
        success, response = self.run_test(
            "Get Monthly Charges",
            "GET",
            "charges",
            200,
            token=self.admin_token
        )
        return success

    def test_record_payment(self):
        """Test recording a payment"""
        if not self.test_flat_id:
            self.log_test("Record Payment", False, "No flat ID available")
            return False
            
        current_date = datetime.now()
        payment_data = {
            "flat_id": self.test_flat_id,
            "month": current_date.month,
            "year": current_date.year,
            "amount": 500.00,
            "payment_method": "cash"
        }
        
        success, response = self.run_test(
            "Record Payment",
            "POST",
            "payments",
            200,
            data=payment_data,
            token=self.admin_token
        )
        return success

    def test_get_payments(self):
        """Test getting payments list"""
        success, response = self.run_test(
            "Get Payments",
            "GET",
            "payments",
            200,
            token=self.admin_token
        )
        return success

    def test_admin_dashboard_stats(self):
        """Test admin dashboard stats"""
        success, response = self.run_test(
            "Admin Dashboard Stats",
            "GET",
            "dashboard/stats",
            200,
            token=self.admin_token
        )
        return success

    def test_resident_dashboard(self):
        """Test resident dashboard"""
        success, response = self.run_test(
            "Resident Dashboard",
            "GET",
            "dashboard/resident",
            200,
            token=self.resident_token
        )
        return success

    def test_stripe_checkout_creation(self):
        """Test Stripe checkout session creation"""
        if not self.test_flat_id:
            self.log_test("Stripe Checkout Creation", False, "No flat ID available")
            return False
            
        current_date = datetime.now()
        checkout_data = {
            "flat_id": self.test_flat_id,
            "month": current_date.month,
            "year": current_date.year,
            "origin_url": "https://condo-fee-app.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Stripe Checkout Creation",
            "POST",
            "payments/checkout",
            200,
            data=checkout_data,
            token=self.resident_token
        )
        return success

    def test_role_based_access(self):
        """Test role-based access control"""
        # Test resident trying to access admin-only endpoints
        success, response = self.run_test(
            "Role Access Control - Resident to Admin Endpoint",
            "GET",
            "dashboard/stats",
            403,
            token=self.resident_token
        )
        return success

    def test_delete_flat(self):
        """Test deleting a flat"""
        if not self.test_flat_id:
            self.log_test("Delete Flat", False, "No flat ID available")
            return False
            
        success, response = self.run_test(
            "Delete Flat",
            "DELETE",
            f"flats/{self.test_flat_id}",
            200,
            token=self.admin_token
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Apartment Management API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Authentication Tests
        print("\n📝 Authentication Tests")
        if not self.test_admin_registration():
            print("❌ Admin registration failed, stopping tests")
            return False
            
        if not self.test_resident_registration():
            print("❌ Resident registration failed, stopping tests")
            return False

        self.test_get_current_user()

        # Flats Management Tests
        print("\n🏠 Flats Management Tests")
        self.test_create_flat()
        self.test_get_flats()
        self.test_update_flat()

        # Charges Tests
        print("\n💰 Monthly Charges Tests")
        self.test_set_monthly_charges()
        self.test_get_charges()

        # Payments Tests
        print("\n💳 Payments Tests")
        self.test_record_payment()
        self.test_get_payments()

        # Dashboard Tests
        print("\n📊 Dashboard Tests")
        self.test_admin_dashboard_stats()
        self.test_resident_dashboard()

        # Stripe Integration Tests
        print("\n🔒 Stripe Integration Tests")
        self.test_stripe_checkout_creation()

        # Security Tests
        print("\n🔐 Security Tests")
        self.test_role_based_access()

        # Cleanup
        print("\n🧹 Cleanup Tests")
        self.test_delete_flat()

        # Print Results
        print("\n" + "=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = ApartmentAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())