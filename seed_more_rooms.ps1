$rooms = @(
  @{
    name = "Olympus All-Hands Amphitheater"
    type = "CONFERENCE_HALL"
    capacity = 250
    location = "Central Campus, East Concourse"
    restricted = $true
    active = $true
    description = "Tiered amphitheater for company-wide all-hands, product keynotes, and global town halls."
    features = @("Wireless Mics", "Dual Cinema Projectors", "Stage Lighting", "Surround Audio")
  },
  @{
    name = "Grace Hopper Keynote Stage"
    type = "CONFERENCE_HALL"
    capacity = 180
    location = "Tech Hub, Ground Floor"
    restricted = $true
    active = $true
    description = "Auditorium designed for technical conferences, hackathon finals, and developer symposia."
    features = @("Stage Lighting", "Surround Audio", "Dual Cinema Projectors", "Wireless Mics")
  },
  @{
    name = "Shannon Information Hall"
    type = "CONFERENCE_HALL"
    capacity = 140
    location = "Building 42, Floor 1"
    restricted = $true
    active = $true
    description = "Multi-purpose presentation hall for engineering seminars and global webinars."
    features = @("4K Video Conference", "Wireless Cast", "Surround Audio", "Smart Whiteboard")
  },
  @{
    name = "Curie Colloquium Auditorium"
    type = "CONFERENCE_HALL"
    capacity = 110
    location = "Research Complex, Floor 1"
    restricted = $true
    active = $true
    description = "Academic-style lecture and symposium hall for research breakthroughs and guest lectures."
    features = @("Dual Cinema Projectors", "Wireless Mics", "Surround Audio")
  },
  @{
    name = "Rainier Vision Boardroom"
    type = "MEETING_ROOM"
    capacity = 22
    location = "Tower 1, Floor 25"
    restricted = $true
    active = $true
    description = "High-floor executive boardroom overlooking the city with immersive telepresence."
    features = @("4K Video Conference", "Dual Display", "Smart Whiteboard", "Catering Station")
  },
  @{
    name = "Sun Valley Summit Room"
    type = "MEETING_ROOM"
    capacity = 18
    location = "Executive Wing, Floor 9"
    restricted = $true
    active = $true
    description = "Strategic planning suite for C-suite alignment and quarterly business reviews."
    features = @("Surround Audio", "Dual Display", "Smart Whiteboard", "Conference Phone")
  },
  @{
    name = "Charleston Executive Suite"
    type = "MEETING_ROOM"
    capacity = 16
    location = "Bay View Campus, Floor 5"
    restricted = $true
    active = $true
    description = "Modern sunlit boardroom with curved panoramic displays and private terrace."
    features = @("4K Video Conference", "Dual Display", "Wireless Cast", "Sound Isolation")
  },
  @{
    name = "Android Collaboration Studio"
    type = "MEETING_ROOM"
    capacity = 14
    location = "Building 40, Floor 2"
    restricted = $false
    active = $true
    description = "Flexible workshop space with movable whiteboard walls and collaborative touch displays."
    features = @("Smart Whiteboard", "TV Screen", "Wireless Cast")
  },
  @{
    name = "Kubernetes Cluster Room"
    type = "MEETING_ROOM"
    capacity = 12
    location = "Cloud Infra Wing, Floor 4"
    restricted = $false
    active = $true
    description = "Team war room configured for platform infrastructure syncs and incident post-mortems."
    features = @("Dual Display", "Conference Phone", "Whiteboard")
  },
  @{
    name = "TensorFlow Deep Learning Suite"
    type = "MEETING_ROOM"
    capacity = 12
    location = "AI Research Quad, Floor 3"
    restricted = $false
    active = $true
    description = "Dedicated meeting hub for deep learning algorithm and machine intelligence teams."
    features = @("4K Video Conference", "Dual Display", "Smart Whiteboard")
  },
  @{
    name = "Day One Innovation War Room"
    type = "MEETING_ROOM"
    capacity = 10
    location = "Amazonian Hub, Floor 6"
    restricted = $false
    active = $true
    description = "High-velocity product launch war room with 360-degree magnetic writable walls."
    features = @("Whiteboard", "Dual Display", "Conference Phone")
  },
  @{
    name = "Borg Platform Strategy Room"
    type = "MEETING_ROOM"
    capacity = 8
    location = "Data Center Ops, Floor 2"
    restricted = $false
    active = $true
    description = "Reliability engineering meeting space for operations reviews and architecture design."
    features = @("TV Screen", "Wireless Cast", "Whiteboard")
  },
  @{
    name = "DeepMind Think Tank 5"
    type = "MEETING_ROOM"
    capacity = 8
    location = "Research Complex, Floor 4"
    restricted = $false
    active = $true
    description = "Quiet ideation pod shielded for focused research discussions and whiteboard math."
    features = @("Sound Isolation", "Smart Whiteboard", "TV Screen")
  },
  @{
    name = "Chromium Sprint Hub 2B"
    type = "MEETING_ROOM"
    capacity = 6
    location = "Platform Engineering, Floor 3"
    restricted = $false
    active = $true
    description = "Scrum room optimized for daily standups, sprint reviews, and pair programming."
    features = @("TV Screen", "Whiteboard", "Conference Phone")
  },
  @{
    name = "Pixel Design Critique Room"
    type = "MEETING_ROOM"
    capacity = 6
    location = "Design Studio, Floor 3"
    restricted = $false
    active = $true
    description = "Studio space with color-accurate displays for industrial design and UX critiques."
    features = @("Dual Display", "Magnetic Whiteboard", "Wireless Cast")
  },
  @{
    name = "Apollo Focus Pod 1A"
    type = "MEETING_ROOM"
    capacity = 4
    location = "HQ Tower, Floor 5"
    restricted = $false
    active = $true
    description = "Compact acoustic soundproof pod for confidential 1-on-1s and video interviews."
    features = @("TV Screen", "Sound Isolation")
  }
)

$loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body (@{ email = "admin@bookmg.com"; password = "admin123" } | ConvertTo-Json) -ContentType "application/json"
$token = $loginResp.accessToken
$headers = @{ "Authorization" = "Bearer $token" }

foreach ($r in $rooms) {
  $json = $r | ConvertTo-Json -Depth 4
  try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/resources" -Method POST -Body $json -ContentType "application/json" -Headers $headers
    Write-Host "Created: $($r.name) (ID: $($resp.id))"
  } catch {
    Write-Host "Failed: $($r.name) - $($_.Exception.Message)"
  }
}
