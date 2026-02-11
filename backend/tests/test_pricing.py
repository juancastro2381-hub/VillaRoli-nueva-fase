import pytest
from datetime import date
from app.services.pricing import PricingService
from app.domain.models import BookingPolicy

def test_pasadia_pricing():
    # 5 People Pasadía
    guests = 5
    result = PricingService.calculate_total(
        check_in=date(2026, 6, 1),
        check_out=date(2026, 6, 1), # Same day
        guests=guests,
        policy_type=BookingPolicy.DAY_PASS
    )
    
    expected_subtotal = 5 * 25000
    assert result["subtotal"] == expected_subtotal
    assert result["cleaning_fee"] == 0
    assert result["total_amount"] == expected_subtotal
    assert len(result["breakdown"]) == 1

def test_full_property_weekday():
    # 10 People, 2 Nights (Mon-Wed)
    guests = 10
    check_in = date(2026, 6, 1) # Monday
    check_out = date(2026, 6, 3) # Wednesday
    
    result = PricingService.calculate_total(
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY
    )
    
    # Logic: 55,000 * 10 * 2 + 70,000 (Cleaning)
    expected_subtotal = 55000 * 10 * 2
    expected_cleaning = 70000
    
    assert result["subtotal"] == expected_subtotal
    assert result["cleaning_fee"] == expected_cleaning
    assert result["total_amount"] == expected_subtotal + expected_cleaning

def test_family_plan():
    # 1 Night, 4 People (Max 5)
    guests = 4
    check_in = date(2026, 6, 2)
    check_out = date(2026, 6, 3)
    
    result = PricingService.calculate_total(
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        policy_type=BookingPolicy.FAMILY_PLAN
    )
    
    # Logic: 420,000 Flat * 1 Night. Cleaning Included (0).
    expected_subtotal = 420000 * 1
    
    assert result["subtotal"] == expected_subtotal
    assert result["cleaning_fee"] == 0
    assert result["total_amount"] == expected_subtotal

def test_full_property_weekend():
    # 15 People, 2 Nights (Fri-Sun)
    guests = 15
    check_in = date(2026, 6, 5) # Friday
    check_out = date(2026, 6, 7) # Sunday
    
    result = PricingService.calculate_total(
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        policy_type=BookingPolicy.FULL_PROPERTY_WEEKEND
    )
    
    # Logic: 60,000 * 15 * 2 + 70,000 (Cleaning)
    expected_subtotal = 60000 * 15 * 2
    expected_cleaning = 70000
    
    assert result["subtotal"] == expected_subtotal
    assert result["cleaning_fee"] == expected_cleaning
    assert result["total_amount"] == expected_subtotal + expected_cleaning
