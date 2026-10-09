// Enterprise Office, Lab & Equipment Constants and Metadata Map

export const LAB_REQUIREMENTS_MAP = {
  'Chemistry Lab': [
    'I have completed the annual chemical safety induction (Level 2).',
    'Certified PPE (lab coat, safety splash goggles, nitrile gloves) will be worn.',
    'Lab manager / safety officer has been notified of the protocol.',
    'Hazardous materials list & MSDS are acknowledged in the booking note.'
  ],
  'Chemistry & Materials Testing Lab': [
    'Certified PPE (acid-resistant lab coat, splash goggles, nitrile gloves) required.',
    'Fume hood operational face-velocity certification tag verified.',
    'Chemical waste neutralization protocol prepared.',
    'Safety shower and eyewash stations unobstructed.'
  ],
  'Quantum Computing Lab': [
    'Cryostat and helium gas pressure purge safety protocol verified.',
    'ESD (Electrostatic Discharge) grounding strap and footwear worn.',
    'Liquid nitrogen handling certification active.',
    'Superconducting magnetic field warning lights activated.'
  ],
  'Hardware Prototyping Lab': [
    'I have completed the rapid fabrication & machinery workshop induction.',
    'Eye protection and closed-toe footwear will be worn during tool operation.',
    '3D printer / CNC spool materials are verified compatible.',
    'Equipment will be inspected and cleaned before leaving the station.'
  ],
  'Silicon Validation Lab': [
    'Class 100 ESD protection equipment verified prior to wafer handling.',
    'Probe station micromanipulator training certificate verified.',
    'Logic analyzer and thermal chamber calibration checked.',
    'Test logs and cleanroom protocol recorded.'
  ],
  'Robotics & Drone Flight Testbed': [
    'Safety netting perimeter sealed before propeller spin-up.',
    'Emergency remote kill-switch paired and tested.',
    'Flight telemetry recording system initialized.',
    'LiPo battery charging and fire-safe containment observed.'
  ],
  'RF & Microwave Anechoic Chamber': [
    'Chamber door RF absorber seal verified tight.',
    'Transmitter power limited to maximum permissible radiation safety limits.',
    'Personnel clearance inside chamber verified before high-power sweep.'
  ],
  'AI GPU Supercluster Lab Bench': [
    'Liquid-cooling loop coolant levels and pump pressure verified.',
    'Workload adheres to high-performance enterprise compute guidelines.',
    'Memory cleanup scripts scheduled for execution upon session completion.'
  ],
  'Bio-Sensors & Cleanroom Facility': [
    'Cleanroom bunny suit, hair net, and mask donned in anteroom.',
    'Air shower de-dusting cycle completed before entry.',
    'HEPA laminar flow hood verified active.'
  ],
  'GPU Workstation': [
    'Compute workload adheres to high-performance usage policy (no unauthorized scraping).',
    'Dataset and storage directories comply with data confidentiality tier 3.',
    'Processes will be terminated or scripted to release GPU memory upon end time.'
  ],
  'Keysight 40GHz Spectrum Analyzer': [
    'RF input attenuator set to safe initial level to prevent front-end burnout.',
    'Calibration certificate verified valid.',
    'Returned to locked cage immediately after measurement session.'
  ],
  'Dual RTX A6000 GPU Mobile Rig': [
    'Flight-case cooling fans and thermal exhaust unobstructed.',
    'Dedicated 20A circuit power cord connected.',
    'Hardware asset tracking tag verified at checkout.'
  ],
  'FLIR High-Speed Thermal Imaging Rig': [
    'Radiometric lens cap and germanium optics inspected for debris.',
    'Camera calibration profile loaded for target temperature window.'
  ]
};

export const DEFAULT_LAB_REQUIREMENTS = [
  'I have completed the relevant workplace safety induction for this facility.',
  'Standard safety PPE and operational protocols will be maintained.',
  'Area supervisor or facilities lead has been informed of this reservation.'
];

// Fallback / enhanced feature list icons & categories
export const FEATURE_INFO = {
  'Projector': { label: '4K Laser Projector', icon: 'Tv' },
  'Whiteboard': { label: 'Magnetic Whiteboard', icon: 'Edit3' },
  'Smart Whiteboard': { label: 'Interactive Digital Whiteboard', icon: 'Edit3' },
  'Magnetic Whiteboard': { label: 'Magnetic Whiteboard', icon: 'Edit3' },
  'Video conferencing': { label: '4K Video Conf Bar', icon: 'Video' },
  '4K Video Conference': { label: 'Dual 4K Video Conf Bar', icon: 'Video' },
  '4K Video Conf': { label: 'Dual 4K Video Conf Bar', icon: 'Video' },
  'Fume hood': { label: 'Certified Fume Hood', icon: 'Wind' },
  'Safety shower': { label: 'Emergency Shower & Eyewash', icon: 'ShieldCheck' },
  '3D printer': { label: 'Industrial 3D Printer', icon: 'Printer' },
  '3D Printers': { label: 'Dual-Extrusion 3D Printers', icon: 'Printer' },
  'Oscilloscope': { label: 'Digital Storage Oscilloscope', icon: 'Activity' },
  'Oscilloscopes': { label: 'High-Bandwidth Oscilloscopes', icon: 'Activity' },
  'Soldering station': { label: 'ESD Soldering Workstation', icon: 'Zap' },
  'Soldering Stations': { label: 'ESD Soldering Workstations', icon: 'Zap' },
  'GPU workstation': { label: 'Dual RTX A6000 GPU Workstation', icon: 'Cpu' },
  'High-Performance Compute': { label: 'HPC Dedicated Cluster', icon: 'Cpu' },
  'Network switch': { label: 'Managed 10GbE Switch Test Bench', icon: 'Network' },
  'Power backup': { label: 'Dedicated UPS Backup', icon: 'BatteryCharging' },
  'Wi-Fi': { label: 'Wi-Fi 6E High-Density', icon: 'Wifi' },
  'Dual Display': { label: 'Dual Color-Calibrated Displays', icon: 'Monitor' },
  'Dual Displays': { label: 'Dual Color-Calibrated Displays', icon: 'Monitor' },
  'Sound Isolation': { label: 'Acoustic Sound Isolation', icon: 'VolumeX' },
  'Conference Phone': { label: 'Polycom Conference Audio', icon: 'Phone' },
  'Catering Station': { label: 'Beverage & Catering Station', icon: 'Coffee' },
  'Surround Audio': { label: 'Ceiling Array Audio', icon: 'Speaker' },
  'Wireless Mics': { label: 'Shure Wireless Microphones', icon: 'Mic' },
  'Stage Lighting': { label: 'Dynamic Stage Lighting Rig', icon: 'Sun' },
  'Dual Cinema Projectors': { label: 'Dual 4K Cinema Projectors', icon: 'Tv' },
  'Live Broadcast Deck': { label: 'Live Broadcast Switcher Deck', icon: 'Video' },
};

// Realistic mock images / gradients for all 36 enterprise demo resources
export const RESOURCE_IMAGE_MAP = {
  // Boardrooms & Suites
  'Executive Boardroom Alpha': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
  'Executive Boardroom Beta': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
  'Seattle Sky Boardroom': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
  'Mountain View Pavilion': 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
  'Turing Council Chamber': 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',

  // Keynote Auditoriums
  'Grand Auditorium': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  'Kepler Amphitheater': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  'Apollo Town Hall': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'Aurora Showcase Theater': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'Ada Lovelace Keynote Hall': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',

  // Collaboration Huddles
  'Innovation Huddle 1': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'Innovation Huddle 2': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  'Dynamo Pod 3A': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'Dynamo Pod 3B': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  'Lambda Brainstorming Studio': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
  'Pixel Creative Huddle': 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80',
  'Prime Collaboration Space': 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80',
  'Nexus Sprint Room': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  'Matrix Strategy Pod': 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
  'Synergy Huddle 4C': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',

  // Labs
  'Quantum Computing Lab': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'Hardware Prototyping Lab': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  'Silicon Validation Lab': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  'Robotics & Drone Flight Testbed': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
  'RF & Microwave Anechoic Chamber': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  'Chemistry & Materials Testing Lab': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  'AI GPU Supercluster Lab Bench': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  'Bio-Sensors & Cleanroom Facility': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',

  // Equipment
  'Sony 4K Laser Cinema Projector': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  'Meta Quest Pro Studio Kit': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
  'Keysight 40GHz Spectrum Analyzer': 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
  'Dual RTX A6000 GPU Mobile Rig': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
  'Studio Telepresence Broadcast Cart': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80',
  'FLIR High-Speed Thermal Imaging Rig': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'Mobile Podcast & Audio Studio Kit': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
  // New Keynote Auditoriums & Halls
  'Olympus All-Hands Amphitheater': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'Grace Hopper Keynote Stage': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  'Shannon Information Hall': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  'Curie Colloquium Auditorium': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',

  // New Executive Boardrooms & Suites
  'Rainier Vision Boardroom': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
  'Sun Valley Summit Room': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
  'Charleston Executive Suite': 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',

  // New Tech War Rooms, Studios & Focus Pods
  'Android Collaboration Studio': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'Kubernetes Cluster Room': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  'TensorFlow Deep Learning Suite': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
  'Day One Innovation War Room': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  'Borg Platform Strategy Room': 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
  'DeepMind Think Tank 5': 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80',
  'Chromium Sprint Hub 2B': 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80',
  'Pixel Design Critique Room': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'Apollo Focus Pod 1A': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
};
