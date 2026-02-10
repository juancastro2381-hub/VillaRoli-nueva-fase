$base = "http://localhost:8003"

function Test-Endpoint {
    param ($name, $method, $url, $body, $expectedStatus)
    Write-Host "--- Testing $name ---"
    try {
        if ($method -eq "POST") {
            $response = Invoke-WebRequest -Uri "$base$url" -Method POST -Body $body -ContentType "application/json" -SkipHttpErrorCheck
        } else {
            $response = Invoke-WebRequest -Uri "$base$url" -Method GET -SkipHttpErrorCheck
        }
        
        if ($response.StatusCode -eq $expectedStatus) {
            Write-Host "✅ PASS: Got $($response.StatusCode)"
        } else {
            Write-Host "❌ FAIL: Expected $expectedStatus, Got $($response.StatusCode)"
            Write-Host "Response: $($response.Content)"
        }
    } catch {
        Write-Host "❌ CRITICAL FAIL: $_"
    }
}

# Login
$login = @{ username="admin@villaroli.com"; password="admin123" } | ConvertTo-Json
$tokenResp = Invoke-WebRequest -Uri "$base/auth/token" -Method POST -Body "username=admin@villaroli.com&password=admin123" -ContentType "application/x-www-form-urlencoded"
$token = ($tokenResp.Content | ConvertFrom-Json).access_token
$headers = @{ Authorization="Bearer $token" }

# 1. Day Pass Overnight (Expect 422)
$t1 = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$t2 = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
$body = @{
    check_in=$t1
    check_out=$t2
    guest_count=5
    policy_type="day_pass"
    property_id=1
} | ConvertTo-Json

# Using curl for simple non-auth first, but standard Invoke-WebRequest is easier for headers.
# Let's use Invoke-RestMethod/WebRequest with headers.

# Update function to use headers
function Test-Endpoint-Auth {
    param ($name, $method, $url, $body, $expectedStatus)
    Write-Host "--- Testing $name ---"
    try {
        if ($method -eq "POST") {
             $jsonBody = $body | ConvertTo-Json -Depth 5
             $response = Invoke-WebRequest -Uri "$base$url" -Method POST -Body $jsonBody -ContentType "application/json" -Headers $headers -SkipHttpErrorCheck
        } else {
             $response = Invoke-WebRequest -Uri "$base$url" -Method GET -Headers $headers -SkipHttpErrorCheck
        }
        
        if ($response.StatusCode -eq $expectedStatus) {
            Write-Host "✅ PASS: Got $($response.StatusCode)"
        } else {
            Write-Host "❌ FAIL: Expected $expectedStatus, Got $($response.StatusCode)"
            Write-Host "Response: $($response.Content)"
        }
    } catch {
        Write-Host "❌ CRITICAL FAIL: $_"
    }
}

# 1. Day Pass Overnight (Expect 422)
$body = @{ check_in=$t1; check_out=$t2; guest_count=5; policy_type="day_pass"; property_id=1; payment_method="ONLINE_GATEWAY" }
Test-Endpoint-Auth "Day Pass Overnight" "POST" "/payments/checkout" $body 422

# 2. Day Pass 0 Nights (Expect 200)
$body = @{ check_in=$t1; check_out=$t1; guest_count=5; policy_type="day_pass"; property_id=1; payment_method="ONLINE_GATEWAY" }
Test-Endpoint-Auth "Day Pass 0 Nights" "POST" "/payments/checkout" $body 200

# 3. Full Prop Min People (Expect 422) - Just mock dates
$body = @{ check_in=$t1; check_out=$t2; guest_count=5; policy_type="full_property_weekday"; property_id=1; payment_method="ONLINE_GATEWAY" }
Test-Endpoint-Auth "Full Prop Min People" "POST" "/payments/checkout" $body 422

# 4. Admin Override (Expect 200)
$body = @{ check_in=$t1; check_out=$t2; guest_count=5; policy_type="full_property_weekday"; property_id=1; is_override=$true; override_reason="PowerShell Test" }
Test-Endpoint-Auth "Admin Override" "POST" "/admin/bookings" $body 200

# 5. Availability Constraint (Expect 409) - Same dates
Test-Endpoint-Auth "Availability Check" "POST" "/admin/bookings" $body 409

# 6. Reporting (Expect 200)
Test-Endpoint-Auth "Reporting PDF" "GET" "/admin/reports/bookings?format=pdf" $null 200
