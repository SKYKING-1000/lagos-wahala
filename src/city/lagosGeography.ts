import { ZoneInfo, RoadNode, Landmark } from '../types/game';

export const LAGOS_ZONES: ZoneInfo[] = [
  {
    id: 'ikeja',
    name: 'Ikeja',
    subtitle: 'State Capital & Mainland Hub',
    center: { x: 0, y: 0, z: -400 },
    description: 'Bustling capital of Lagos State. Home to Allen Avenue, residential GRA, government secretariat, and computer village.',
    color: '#3b82f6',
  },
  {
    id: 'yaba',
    name: 'Yaba',
    subtitle: 'Tech Hub & Educational Center',
    center: { x: 30, y: 0, z: -50 },
    description: 'The Silicon Valley of West Africa. Bustling with startups, colleges, Tejuosho market, and vibrant street life along Herbert Macaulay Way.',
    color: '#10b981',
  },
  {
    id: 'vi',
    name: 'Victoria Island',
    subtitle: 'Financial & Corporate Center',
    center: { x: 140, y: 0, z: 340 },
    description: 'Premier business district. High-rise banking towers, Ozumba Mbadiwe waterfront, luxury dining, and consulate buildings.',
    color: '#8b5cf6',
  },
  {
    id: 'lekki',
    name: 'Lekki Phase 1',
    subtitle: 'Coastal Living & Expressway',
    center: { x: 320, y: 0, z: 420 },
    description: 'Fast-growing affluent corridor. Admiralty Way nightlife, modern residential estates, shopping malls, and the famous Lekki Toll Gate.',
    color: '#f59e0b',
  },
];

// Mapped road network nodes forming connected drivable expressways and avenues
export const LAGOS_ROAD_NODES: RoadNode[] = [
  // --- IKEJA ZONE ---
  { id: 'ik_home_gate', x: 40, z: -460, connections: ['ik_res_1'], zone: 'ikeja', name: 'GRA Residential Close' },
  { id: 'ik_res_1', x: 40, z: -420, connections: ['ik_home_gate', 'ik_allen_north'], zone: 'ikeja', name: 'Isaac John Street' },
  { id: 'ik_allen_north', x: 0, z: -420, connections: ['ik_res_1', 'ik_allen_mid', 'ik_airport_rd'], zone: 'ikeja', name: 'Allen Avenue North' },
  { id: 'ik_airport_rd', x: -80, z: -420, connections: ['ik_allen_north', 'ik_underbridge'], zone: 'ikeja', name: 'Airport Road Link' },
  { id: 'ik_allen_mid', x: 0, z: -350, connections: ['ik_allen_north', 'ik_allen_roundabout', 'ik_alausa_link'], zone: 'ikeja', name: 'Allen Avenue Central' },
  { id: 'ik_alausa_link', x: 80, z: -350, connections: ['ik_allen_mid', 'ik_alausa_sec'], zone: 'ikeja', name: 'Alausa Expressway Link' },
  { id: 'ik_alausa_sec', x: 120, z: -350, connections: ['ik_alausa_link', 'ik_exp_south_1'], zone: 'ikeja', name: 'Secretariat Road' },
  { id: 'ik_allen_roundabout', x: 0, z: -270, connections: ['ik_allen_mid', 'ik_underbridge', 'ik_exp_south_1'], zone: 'ikeja', name: 'Allen / Awolowo Roundabout' },
  { id: 'ik_underbridge', x: -60, z: -270, connections: ['ik_allen_roundabout', 'ik_airport_rd'], zone: 'ikeja', name: 'Ikeja Underbridge' },
  { id: 'ik_exp_south_1', x: 20, z: -200, connections: ['ik_allen_roundabout', 'ik_alausa_sec', 'ik_exp_south_2'], zone: 'ikeja', name: 'Ikorodu Road Mainland North' },
  { id: 'ik_exp_south_2', x: 25, z: -130, connections: ['ik_exp_south_1', 'yb_fadeyi'], zone: 'ikeja', name: 'Anthony / Maryland Corridor' },

  // --- YABA ZONE ---
  { id: 'yb_fadeyi', x: 30, z: -80, connections: ['ik_exp_south_2', 'yb_macaulay_north'], zone: 'yaba', name: 'Fadeyi / Jibowu Junction' },
  { id: 'yb_macaulay_north', x: 30, z: -40, connections: ['yb_fadeyi', 'yb_sabo_roundabout', 'yb_commercial_ave'], zone: 'yaba', name: 'Herbert Macaulay Way North' },
  { id: 'yb_commercial_ave', x: -30, z: -40, connections: ['yb_macaulay_north', 'yb_tejuosho'], zone: 'yaba', name: 'Commercial Avenue' },
  { id: 'yb_tejuosho', x: -40, z: 10, connections: ['yb_commercial_ave', 'yb_sabo_roundabout'], zone: 'yaba', name: 'Tejuosho Market Road' },
  { id: 'yb_sabo_roundabout', x: 30, z: 20, connections: ['yb_macaulay_north', 'yb_tejuosho', 'yb_tech_corridor', 'yb_tmb_ramp'], zone: 'yaba', name: 'Sabo Roundabout (Tech Hub)' },
  { id: 'yb_tech_corridor', x: 50, z: 50, connections: ['yb_sabo_roundabout', 'yb_unilag_link'], zone: 'yaba', name: 'Alagomeji Tech District' },
  { id: 'yb_unilag_link', x: 80, z: 40, connections: ['yb_tech_corridor', 'yb_tmb_ramp'], zone: 'yaba', name: 'University Road Link' },

  // --- THIRD MAINLAND BRIDGE CORRIDOR (Lagoon Crossing) ---
  { id: 'yb_tmb_ramp', x: 60, z: 80, connections: ['yb_sabo_roundabout', 'yb_unilag_link', 'tmb_span_1'], zone: 'yaba', name: 'Third Mainland Bridge Yaba Ramp' },
  { id: 'tmb_span_1', x: 85, z: 140, connections: ['yb_tmb_ramp', 'tmb_span_2'], zone: 'yaba', name: 'Third Mainland Bridge (Lagoon North)' },
  { id: 'tmb_span_2', x: 110, z: 210, connections: ['tmb_span_1', 'tmb_span_3'], zone: 'vi', name: 'Third Mainland Bridge (Lagoon Central)' },
  { id: 'tmb_span_3', x: 130, z: 280, connections: ['tmb_span_2', 'vi_adeniji_ramp'], zone: 'vi', name: 'Third Mainland Bridge (Island Approach)' },
  { id: 'vi_adeniji_ramp', x: 135, z: 320, connections: ['tmb_span_3', 'vi_ozumba_west'], zone: 'vi', name: 'Ring Road / VI Descent' },

  // --- VICTORIA ISLAND ZONE ---
  { id: 'vi_ozumba_west', x: 135, z: 350, connections: ['vi_adeniji_ramp', 'vi_ozumba_mid', 'vi_adeola_odeku'], zone: 'vi', name: 'Ozumba Mbadiwe Ave West' },
  { id: 'vi_adeola_odeku', x: 100, z: 380, connections: ['vi_ozumba_west', 'vi_ahmadu_bello'], zone: 'vi', name: 'Adeola Odeku Street' },
  { id: 'vi_ahmadu_bello', x: 130, z: 420, connections: ['vi_adeola_odeku', 'vi_ozumba_mid'], zone: 'vi', name: 'Ahmadu Bello Way' },
  { id: 'vi_ozumba_mid', x: 180, z: 360, connections: ['vi_ozumba_west', 'vi_ahmadu_bello', 'vi_lekki_link_ramp'], zone: 'vi', name: 'Ozumba Mbadiwe Ave East' },
  { id: 'vi_lekki_link_ramp', x: 230, z: 380, connections: ['vi_ozumba_mid', 'lekki_bridge_span'], zone: 'vi', name: 'Lekki-Ikoyi Link Bridge Approach' },

  // --- LEKKI CORRIDOR ---
  { id: 'lekki_bridge_span', x: 270, z: 400, connections: ['vi_lekki_link_ramp', 'lk_toll_plaza'], zone: 'lekki', name: 'Lekki-Ikoyi Cable Bridge' },
  { id: 'lk_toll_plaza', x: 300, z: 410, connections: ['lekki_bridge_span', 'lk_admiralty_way', 'lk_epe_exp_1'], zone: 'lekki', name: 'Lekki Admiralty Toll Plaza' },
  { id: 'lk_admiralty_way', x: 340, z: 390, connections: ['lk_toll_plaza', 'lk_admiralty_roundabout'], zone: 'lekki', name: 'Admiralty Way Phase 1' },
  { id: 'lk_admiralty_roundabout', x: 390, z: 390, connections: ['lk_admiralty_way', 'lk_waterfront'], zone: 'lekki', name: 'Admiralty Circle Roundabout' },
  { id: 'lk_waterfront', x: 390, z: 430, connections: ['lk_admiralty_roundabout', 'lk_epe_exp_1'], zone: 'lekki', name: 'Lekki Waterfront & Bukka Bay' },
  { id: 'lk_epe_exp_1', x: 340, z: 440, connections: ['lk_toll_plaza', 'lk_waterfront', 'lk_jakande_link'], zone: 'lekki', name: 'Lekki-Epe Expressway Corridor' },
  { id: 'lk_jakande_link', x: 420, z: 450, connections: ['lk_epe_exp_1'], zone: 'lekki', name: 'Jakande Roundabout East' },
];

export const LAGOS_LANDMARKS: Landmark[] = [
  // Ikeja
  {
    id: 'player_home',
    name: 'Your Residence (Home)',
    zone: 'ikeja',
    type: 'home',
    position: { x: 42, y: 0, z: -475 },
    description: 'Your 2-bedroom flat in Ikeja GRA compound. Bed, alarm clock, wardrobe, generator shed, and your sedan parked outside.',
  },
  {
    id: 'mama_ngozi_buka',
    name: "Mama Ngozi's Buka & Kitchen",
    zone: 'ikeja',
    type: 'buka',
    position: { x: 12, y: 0, z: -355 },
    description: 'Popular roadside buka on Allen Avenue. Hot smoky Jollof rice, fried chicken, fried plantain (dodo), and cold malt.',
  },
  {
    id: 'oando_ikeja',
    name: 'Oando Filling Station (Ikeja)',
    zone: 'ikeja',
    type: 'fuel',
    position: { x: -15, y: 0, z: -415 },
    description: 'Petrol station with working dispensing pumps. Refuel your vehicle and buy engine oil.',
  },
  {
    id: 'alausa_secretariat',
    name: 'Lagos State Secretariat Alausa',
    zone: 'ikeja',
    type: 'landmark',
    position: { x: 110, y: 0, z: -335 },
    description: 'Seat of Lagos State Government. High modern administrative complex.',
  },

  // Yaba
  {
    id: 'tech_office',
    name: 'PayLagos Tech Hub & Workstation',
    zone: 'yaba',
    type: 'office',
    position: { x: 45, y: 0, z: 25 },
    description: 'Your workplace in Sabo tech cluster. Clock in at your desk, resolve code bugs and financial transactions to earn daily salary.',
  },
  {
    id: 'tejuosho_market',
    name: 'Tejuosho Ultra Modern Market',
    zone: 'yaba',
    type: 'market',
    position: { x: -35, y: 0, z: 15 },
    description: 'Major multi-floor commercial market. Cheap electronics, clothing, fresh produce, and food hawkers.',
  },
  {
    id: 'mama_basira_amala',
    name: "Mama Basira's Amala Joint",
    zone: 'yaba',
    type: 'buka',
    position: { x: 20, y: 0, z: -35 },
    description: 'Legendary Yaba spot. Fresh steaming Amala with Ewedu, Gbegiri, assorted goat meat and shaki.',
  },

  // Victoria Island
  {
    id: 'zenith_financial_tower',
    name: 'VI Corporate Financial Center',
    zone: 'vi',
    type: 'office',
    position: { x: 150, y: 0, z: 365 },
    description: 'Luxury glass tower in Victoria Island. High-paying consultant meetings and ATM gallery.',
  },
  {
    id: 'ozumba_buka',
    name: 'Eko Shawarma & Suya Spot',
    zone: 'vi',
    type: 'buka',
    position: { x: 125, y: 0, z: 375 },
    description: 'Island favorite for spicy beef and chicken Suya with onions, cabbage and double-sausage shawarma.',
  },

  // Lekki
  {
    id: 'lekki_toll_gate',
    name: 'Lekki Admiralty Toll Gate',
    zone: 'lekki',
    type: 'landmark',
    position: { x: 295, y: 0, z: 410 },
    description: 'Iconic gateway into Lekki Phase 1 and the Peninsula.',
  },
  {
    id: 'total_lekki',
    name: 'TotalEnergies Lekki Station',
    zone: 'lekki',
    type: 'fuel',
    position: { x: 330, y: 0, z: 435 },
    description: 'Clean modern service station on Lekki-Epe Expressway.',
  },
  {
    id: 'admiralty_buka',
    name: 'Mega Bukka & Lounge (Admiralty)',
    zone: 'lekki',
    type: 'buka',
    position: { x: 380, y: 0, z: 395 },
    description: 'Air-conditioned modern restaurant serving gourmet Nigerian dishes, fish barbecue, and chilled drinks.',
  },
];
