$today = (Get-Date).ToString("yyyy-MM-dd")
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")

# Get Tokens
$adminResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body (@{ email = "admin@bookmg.com"; password = "admin123" } | ConvertTo-Json) -ContentType "application/json"
$userResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body (@{ email = "user@bookmg.com"; password = "user123" } | ConvertTo-Json) -ContentType "application/json"
$mgrResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body (@{ email = "manager@bookmg.com"; password = "manager123" } | ConvertTo-Json) -ContentType "application/json"

$adminHeaders = @{ "Authorization" = "Bearer $($adminResp.accessToken)" }
$userHeaders = @{ "Authorization" = "Bearer $($userResp.accessToken)" }
$mgrHeaders = @{ "Authorization" = "Bearer $($mgrResp.accessToken)" }

$bookings = @(
  @{
    headers = $adminHeaders
    body = @{
      title = "Global Cloud Infrastructure Sync"
      description = "AWS/GCP multi-region architecture and latency review"
      resourceId = 10 # Seattle Sky Boardroom
      startTime = "${today}T09:00:00"
      endTime = "${today}T10:30:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $mgrHeaders
    body = @{
      title = "Quarterly All-Hands Rehearsal"
      description = "Executive briefing & AV soundcheck"
      resourceId = 37 # Olympus All-Hands Amphitheater
      startTime = "${today}T11:00:00"
      endTime = "${today}T12:30:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $userHeaders
    body = @{
      title = "TensorFlow Optimization Workshop"
      description = "Model quantization and tensorrt benchmark review"
      resourceId = 46 # TensorFlow Deep Learning Suite
      startTime = "${today}T13:00:00"
      endTime = "${today}T14:30:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $mgrHeaders
    body = @{
      title = "Product Launch War Room"
      description = "Cross-functional go-to-market checkpoint"
      resourceId = 47 # Day One Innovation War Room
      startTime = "${today}T15:00:00"
      endTime = "${today}T16:30:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $userHeaders
    body = @{
      title = "Platform Kubernetes Post-Mortem"
      description = "Cluster ingress failover retrospective"
      resourceId = 45 # Kubernetes Cluster Room
      startTime = "${today}T16:30:00"
      endTime = "${today}T18:00:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $adminHeaders
    body = @{
      title = "C-Suite Executive Alignment"
      description = "Annual operating plan review"
      resourceId = 42 # Sun Valley Summit Room
      startTime = "${tomorrow}T09:30:00"
      endTime = "${tomorrow}T11:30:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $userHeaders
    body = @{
      title = "Silicon Validation Test Run"
      description = "Thermal cycling on new ASIC rev 2"
      resourceId = 25 # Silicon Validation Lab
      startTime = "${tomorrow}T13:00:00"
      endTime = "${tomorrow}T15:00:00"
      recurrenceType = "NONE"
    }
  },
  @{
    headers = $mgrHeaders
    body = @{
      title = "Developer Keynote & Demo"
      description = "Open source developer meetup and livestream"
      resourceId = 38 # Grace Hopper Keynote Stage
      startTime = "${tomorrow}T14:00:00"
      endTime = "${tomorrow}T16:30:00"
      recurrenceType = "NONE"
    }
  }
)

foreach ($b in $bookings) {
  $json = $b.body | ConvertTo-Json
  try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bookings" -Method POST -Body $json -ContentType "application/json" -Headers $b.headers
    Write-Host "Created Booking: $($b.body.title) (ID: $($resp.id), Status: $($resp.status))"
  } catch {
    Write-Host "Failed Booking: $($b.body.title) - $($_.Exception.Message)"
  }
}
