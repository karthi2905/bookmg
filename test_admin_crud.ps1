$login = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body (@{ email = "admin@bookmg.com"; password = "admin123" } | ConvertTo-Json) -ContentType "application/json"
$token = $login.accessToken
$headers = @{ "Authorization" = "Bearer $token" }

Write-Host "Admin Login Successful. Token obtained."

# 1. Create a new test space
$newRoom = @{
  name = "Test Campus Lab Beta"
  type = "MEETING_ROOM"
  capacity = 8
  location = "Silicon Valley Campus, Floor 4"
  restricted = $false
  description = "A dynamic test space to verify admin add and delete operations"
  features = @("Whiteboard", "TV Screen")
}

$created = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/resources" -Method POST -Body ($newRoom | ConvertTo-Json) -ContentType "application/json" -Headers $headers
Write-Host "Successfully Created Room ID: $($created.id), Name: $($created.name)"

# 2. Verify it exists
$check1 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/resources/$($created.id)"
Write-Host "Room Exists: $($check1.name), Active: $($check1.active)"

# 3. Delete the space (admin delete action)
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/resources/$($created.id)" -Method DELETE -Headers $headers
Write-Host "Admin DELETE successfully executed on ID: $($created.id)"

# 4. Verify soft delete (active: false)
$check2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/resources/$($created.id)"
Write-Host "After Delete, Room Active Status: $($check2.active) (Expected: False)"
