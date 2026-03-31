import { useState, forwardRef, useImperativeHandle, useMemo, useRef, useEffect } from 'react';
import { roundToTwo } from '../utils/formatters';
import './ServiceCalculator.css';

/**
 * Construction & Renovation service catalog
 * Granular service types with default rates + presets keyed by `value`.
 */
const SERVICE_TYPES = [
  // Painting
  { value: 'paint-interior', label: 'Interior Painting', rate: 65, group: 'Painting' },
  { value: 'paint-exterior', label: 'Exterior Painting', rate: 70, group: 'Painting' },
  { value: 'paint-cabinet', label: 'Cabinet & Furniture Painting', rate: 75, group: 'Painting' },
  { value: 'paint-deck', label: 'Deck & Fence Staining / Painting', rate: 65, group: 'Painting' },
  { value: 'paint-epoxy', label: 'Epoxy Floor Coating', rate: 80, group: 'Painting' },

  // Drywall & Plastering
  { value: 'drywall-install', label: 'Drywall Installation', rate: 70, group: 'Drywall & Plastering' },
  { value: 'drywall-tape', label: 'Drywall Taping & Mudding', rate: 65, group: 'Drywall & Plastering' },
  { value: 'drywall-repair', label: 'Drywall Repair & Patching', rate: 60, group: 'Drywall & Plastering' },
  { value: 'plaster-repair', label: 'Plaster Repair & Skim Coat', rate: 75, group: 'Drywall & Plastering' },
  { value: 'texture-apply', label: 'Texture Application', rate: 70, group: 'Drywall & Plastering' },

  // Framing & Structural
  { value: 'frame-interior', label: 'Interior Framing', rate: 75, group: 'Framing & Structural' },
  { value: 'frame-exterior', label: 'Exterior Framing', rate: 80, group: 'Framing & Structural' },
  { value: 'frame-basement', label: 'Basement Framing', rate: 75, group: 'Framing & Structural' },
  { value: 'frame-addition', label: 'Addition / Extension Framing', rate: 85, group: 'Framing & Structural' },
  { value: 'steel-stud', label: 'Steel Stud Framing', rate: 80, group: 'Framing & Structural' },

  // Flooring
  { value: 'floor-hardwood', label: 'Hardwood Flooring Installation', rate: 70, group: 'Flooring' },
  { value: 'floor-laminate', label: 'Laminate Flooring Installation', rate: 55, group: 'Flooring' },
  { value: 'floor-vinyl', label: 'Vinyl Plank / LVP Installation', rate: 55, group: 'Flooring' },
  { value: 'floor-tile', label: 'Floor Tile Installation', rate: 75, group: 'Flooring' },
  { value: 'floor-carpet', label: 'Carpet Installation', rate: 50, group: 'Flooring' },
  { value: 'floor-subfloor', label: 'Subfloor Repair & Leveling', rate: 65, group: 'Flooring' },
  { value: 'floor-refinish', label: 'Hardwood Sanding & Refinishing', rate: 75, group: 'Flooring' },

  // Tiling
  { value: 'tile-bathroom', label: 'Bathroom Tile Installation', rate: 80, group: 'Tiling' },
  { value: 'tile-kitchen', label: 'Kitchen Backsplash Tile', rate: 75, group: 'Tiling' },
  { value: 'tile-shower', label: 'Shower / Tub Surround Tile', rate: 85, group: 'Tiling' },
  { value: 'tile-repair', label: 'Tile Repair & Regrouting', rate: 65, group: 'Tiling' },
  { value: 'tile-outdoor', label: 'Outdoor / Patio Tile', rate: 80, group: 'Tiling' },

  // Demolition
  { value: 'demo-interior', label: 'Interior Demolition', rate: 75, group: 'Demolition' },
  { value: 'demo-drywall', label: 'Drywall Removal', rate: 65, group: 'Demolition' },
  { value: 'demo-flooring', label: 'Flooring / Tile Removal', rate: 60, group: 'Demolition' },
  { value: 'demo-kitchen', label: 'Kitchen / Bathroom Demolition', rate: 80, group: 'Demolition' },
  { value: 'demo-concrete', label: 'Concrete Breaking & Removal', rate: 95, group: 'Demolition' },

  // Decking & Fencing
  { value: 'deck-build', label: 'Deck Construction', rate: 80, group: 'Decking & Fencing' },
  { value: 'deck-repair', label: 'Deck Repair & Refinishing', rate: 70, group: 'Decking & Fencing' },
  { value: 'fence-install', label: 'Fence Installation', rate: 70, group: 'Decking & Fencing' },
  { value: 'fence-repair', label: 'Fence Repair', rate: 65, group: 'Decking & Fencing' },
  { value: 'pergola', label: 'Pergola / Gazebo Construction', rate: 85, group: 'Decking & Fencing' },

  // Roofing & Eavestroughs
  { value: 'roof-shingles', label: 'Shingle Roof Installation', rate: 90, group: 'Roofing & Eavestroughs' },
  { value: 'roof-repair', label: 'Roof Repair & Patching', rate: 85, group: 'Roofing & Eavestroughs' },
  { value: 'roof-flat', label: 'Flat Roof / Membrane', rate: 95, group: 'Roofing & Eavestroughs' },
  { value: 'eaves-install', label: 'Eavestrough Installation', rate: 75, group: 'Roofing & Eavestroughs' },
  { value: 'eaves-repair', label: 'Eavestrough Repair & Cleaning', rate: 65, group: 'Roofing & Eavestroughs' },
  { value: 'soffit-fascia', label: 'Soffit & Fascia Installation', rate: 75, group: 'Roofing & Eavestroughs' },

  // Windows & Doors
  { value: 'window-install', label: 'Window Installation / Replacement', rate: 80, group: 'Windows & Doors' },
  { value: 'door-install', label: 'Door Installation / Replacement', rate: 75, group: 'Windows & Doors' },
  { value: 'door-trim', label: 'Door & Window Trim / Casing', rate: 65, group: 'Windows & Doors' },
  { value: 'caulk-seal', label: 'Caulking & Weather Sealing', rate: 60, group: 'Windows & Doors' },

  // Insulation
  { value: 'insul-batt', label: 'Batt Insulation Installation', rate: 65, group: 'Insulation' },
  { value: 'insul-spray', label: 'Spray Foam Insulation', rate: 90, group: 'Insulation' },
  { value: 'insul-rigid', label: 'Rigid Board Insulation', rate: 70, group: 'Insulation' },
  { value: 'vapour-barrier', label: 'Vapour Barrier Installation', rate: 60, group: 'Insulation' },

  // Concrete & Masonry
  { value: 'concrete-pour', label: 'Concrete Pouring & Forming', rate: 95, group: 'Concrete & Masonry' },
  { value: 'concrete-repair', label: 'Concrete Repair & Resurfacing', rate: 85, group: 'Concrete & Masonry' },
  { value: 'brick-install', label: 'Brick / Block Laying', rate: 90, group: 'Concrete & Masonry' },
  { value: 'mortar-repair', label: 'Mortar / Tuckpointing Repair', rate: 80, group: 'Concrete & Masonry' },
  { value: 'interlock', label: 'Interlock / Paving Stone', rate: 85, group: 'Concrete & Masonry' },

  // Trim & Millwork
  { value: 'trim-baseboard', label: 'Baseboard & Casing Installation', rate: 60, group: 'Trim & Millwork' },
  { value: 'trim-crown', label: 'Crown Moulding Installation', rate: 70, group: 'Trim & Millwork' },
  { value: 'trim-wainscot', label: 'Wainscoting & Wall Panels', rate: 75, group: 'Trim & Millwork' },
  { value: 'shelving', label: 'Custom Shelving & Built-ins', rate: 80, group: 'Trim & Millwork' },
  { value: 'stair-rail', label: 'Stair Railing & Baluster', rate: 85, group: 'Trim & Millwork' },

  // General Labour
  { value: 'labour-general', label: 'General Labour', rate: 55, group: 'General Labour' },
  { value: 'labour-cleanup', label: 'Site Cleanup & Waste Removal', rate: 55, group: 'General Labour' },
  { value: 'labour-supervision', label: 'Site Supervision / Project Management', rate: 95, group: 'General Labour' },
  { value: 'labour-emergency', label: 'Emergency / Rush Response', rate: 130, group: 'General Labour' },
];

/** Preset line wording per service type */
const DESCRIPTION_OPTIONS = {
  'paint-interior': [
    'Interior wall painting (single room)',
    'Interior wall painting (full unit)',
    'Ceiling painting',
    'Trim & baseboard painting',
    'Doors & frames painting',
    'Accent wall — feature colour',
    'Touch-up & repairs after drywall',
  ],
  'paint-exterior': [
    'Exterior siding painting',
    'Exterior trim & soffit painting',
    'Garage door painting',
    'Foundation & basement exterior',
    'Full exterior repaint',
  ],
  'paint-cabinet': [
    'Kitchen cabinet painting (full set)',
    'Upper cabinets only',
    'Lower cabinets only',
    'Furniture refinishing',
    'Cabinet door & drawer face painting',
  ],
  'paint-deck': [
    'Deck staining (full deck)',
    'Fence staining / painting',
    'Deck sealing & waterproofing',
    'Pergola & outdoor structure staining',
  ],
  'paint-epoxy': [
    'Garage floor epoxy coating',
    'Basement floor epoxy coating',
    'Commercial floor epoxy',
  ],
  'drywall-install': [
    'Drywall installation (full room)',
    'Drywall installation (basement)',
    'Ceiling drywall installation',
    'Drywall on new framing',
    'Moisture-resistant drywall (bathroom)',
    'Fire-rated drywall installation',
  ],
  'drywall-tape': [
    'Taping & mudding (full room)',
    'Taping & mudding (basement)',
    'Ceiling taping & finishing',
    'Corner bead & finishing',
    'Level 4 / Level 5 finish',
  ],
  'drywall-repair': [
    'Small hole repair (under 6")',
    'Large hole repair (over 6")',
    'Water damage drywall repair',
    'Corner damage repair',
    'Ceiling crack repair',
    'Multiple patch repairs',
  ],
  'plaster-repair': [
    'Skim coat over existing plaster',
    'Plaster crack repair',
    'Plaster resurfacing (full wall)',
    'Venetian plaster application',
  ],
  'texture-apply': [
    'Orange peel texture',
    'Skip trowel texture',
    'Knockdown texture',
    'Smooth finish',
    'Popcorn ceiling removal & retexture',
  ],
  'frame-interior': [
    'Interior partition wall framing',
    'Closet framing',
    'Soffit / bulkhead framing',
    'Bathroom framing',
    'Home office partition',
  ],
  'frame-exterior': [
    'Exterior load-bearing wall framing',
    'Garage framing',
    'Shed framing',
    'Exterior addition framing',
  ],
  'frame-basement': [
    'Full basement framing',
    'Basement bedroom framing',
    'Basement bathroom framing',
    'Utility room framing',
  ],
  'frame-addition': [
    'Room addition framing',
    'Second storey addition framing',
    'Sunroom / extension framing',
  ],
  'steel-stud': [
    'Steel stud partition wall',
    'Commercial steel stud framing',
    'Ceiling grid / drop ceiling framing',
  ],
  'floor-hardwood': [
    'Solid hardwood installation',
    'Engineered hardwood installation',
    'Floating hardwood installation',
    'Glue-down hardwood installation',
    'Stair nosing & landing',
  ],
  'floor-laminate': [
    'Laminate flooring installation (room)',
    'Laminate flooring installation (full unit)',
    'Laminate stair installation',
    'Underlay & laminate installation',
  ],
  'floor-vinyl': [
    'Vinyl plank / LVP installation (room)',
    'Vinyl plank / LVP installation (full unit)',
    'Waterproof LVP (bathroom / kitchen)',
    'Glue-down vinyl installation',
  ],
  'floor-tile': [
    'Ceramic floor tile installation',
    'Porcelain floor tile installation',
    'Large format tile installation',
    'Heated floor tile installation',
    'Mudroom / entryway tile',
  ],
  'floor-carpet': [
    'Carpet installation (room)',
    'Carpet installation (basement)',
    'Carpet installation (stairs)',
    'Carpet stretching & repair',
  ],
  'floor-subfloor': [
    'Subfloor repair & replacement',
    'Floor leveling compound',
    'Squeaky floor repair',
    'Plywood subfloor installation',
  ],
  'floor-refinish': [
    'Hardwood sanding & refinishing',
    'Hardwood staining & refinishing',
    'Spot refinishing & blending',
    'Screen & recoat',
  ],
  'tile-bathroom': [
    'Full bathroom floor & wall tile',
    'Bathroom floor tile only',
    'Bathroom wall tile only',
    'Vanity backsplash tile',
  ],
  'tile-kitchen': [
    'Kitchen backsplash tile installation',
    'Full kitchen wall tile',
    'Island backsplash tile',
  ],
  'tile-shower': [
    'Full shower tile installation',
    'Tub surround tile installation',
    'Walk-in shower tile',
    'Niche & bench tile',
    'Steam shower tile',
  ],
  'tile-repair': [
    'Cracked tile replacement',
    'Grout repair & regrouting',
    'Grout cleaning & sealing',
    'Loose tile re-adhesion',
  ],
  'tile-outdoor': [
    'Outdoor patio tile installation',
    'Pool surround tile',
    'Front walkway tile',
    'Frost-resistant outdoor tile',
  ],
  'demo-interior': [
    'Full interior room demolition',
    'Kitchen demolition',
    'Bathroom demolition',
    'Basement demolition',
  ],
  'demo-drywall': [
    'Drywall removal (single room)',
    'Drywall removal (full unit)',
    'Ceiling drywall removal',
    'Drywall removal & haul away',
  ],
  'demo-flooring': [
    'Hardwood flooring removal',
    'Tile flooring removal',
    'Carpet removal & disposal',
    'Vinyl / linoleum removal',
    'Subfloor removal',
  ],
  'demo-kitchen': [
    'Full kitchen demo & haul away',
    'Cabinet removal',
    'Countertop removal',
    'Kitchen appliance disconnection & removal',
  ],
  'demo-concrete': [
    'Concrete floor breaking',
    'Concrete wall removal',
    'Concrete driveway breaking',
    'Concrete haul away',
  ],
  'deck-build': [
    'Pressure treated deck build',
    'Composite deck build',
    'Cedar deck build',
    'Multi-level deck construction',
    'Deck with stairs & railing',
    'Ground-level deck build',
  ],
  'deck-repair': [
    'Deck board replacement',
    'Deck stringer / joist repair',
    'Deck post & footing repair',
    'Full deck refinishing & seal',
    'Railing repair & replacement',
  ],
  'fence-install': [
    'Wood privacy fence installation',
    'Chain link fence installation',
    'Vinyl fence installation',
    'Aluminum fence installation',
    'Gate installation',
  ],
  'fence-repair': [
    'Fence board replacement',
    'Post replacement',
    'Gate repair',
    'Fence straightening & re-leveling',
  ],
  'pergola': [
    'Freestanding pergola build',
    'Attached pergola build',
    'Gazebo construction',
    'Shade structure / awning framing',
  ],
  'roof-shingles': [
    'Full shingle roof replacement',
    'Partial shingle replacement',
    'Shingle roof installation (new build)',
    'Ice & water shield installation',
  ],
  'roof-repair': [
    'Leak repair',
    'Flashing repair & replacement',
    'Shingle repair (blown / damaged)',
    'Skylight flashing repair',
    'Valley repair',
  ],
  'roof-flat': [
    'Flat roof membrane installation',
    'TPO membrane installation',
    'Rubber roof installation',
    'Flat roof repair & patching',
  ],
  'eaves-install': [
    'Full eavestrough replacement',
    'Seamless eavestrough installation',
    'Downspout installation',
    'Leaf guard / gutter guard installation',
  ],
  'eaves-repair': [
    'Eavestrough cleaning',
    'Eavestrough leak repair',
    'Downspout repair & reattachment',
    'Eavestrough realignment',
  ],
  'soffit-fascia': [
    'Soffit installation (vented)',
    'Fascia board replacement',
    'Full soffit & fascia replacement',
    'Aluminum soffit & fascia cladding',
  ],
  'window-install': [
    'Single window installation',
    'Multiple window replacement',
    'Bay / bow window installation',
    'Egress window installation',
    'Window trim & casing finishing',
  ],
  'door-install': [
    'Interior door installation',
    'Exterior entry door installation',
    'Sliding patio door installation',
    'French door installation',
    'Pocket door installation',
    'Barn door installation',
  ],
  'door-trim': [
    'Door casing & trim installation',
    'Window casing & apron installation',
    'Threshold & weatherstrip installation',
  ],
  'caulk-seal': [
    'Window & door caulking',
    'Bathroom caulking & resealing',
    'Exterior caulking & weatherproofing',
    'Expansion joint sealing',
  ],
  'insul-batt': [
    'Wall batt insulation (full room)',
    'Attic batt insulation',
    'Basement wall insulation',
    'Crawl space insulation',
  ],
  'insul-spray': [
    'Spray foam rim joist insulation',
    'Spray foam wall cavities',
    'Spray foam attic sealing',
    'Open cell spray foam application',
    'Closed cell spray foam application',
  ],
  'insul-rigid': [
    'Rigid board exterior insulation',
    'Basement rigid board insulation',
    'Under-slab rigid insulation',
  ],
  'vapour-barrier': [
    'Vapour barrier installation (walls)',
    'Vapour barrier installation (ceiling)',
    'Crawl space vapour barrier',
    'Basement vapour barrier',
  ],
  'concrete-pour': [
    'Concrete slab pour',
    'Driveway concrete pour',
    'Sidewalk / walkway pour',
    'Garage floor pour',
    'Footing pour',
  ],
  'concrete-repair': [
    'Concrete crack repair',
    'Driveway resurfacing',
    'Concrete leveling',
    'Spalling concrete repair',
  ],
  'brick-install': [
    'Brick veneer installation',
    'Retaining wall block installation',
    'Garden wall / raised bed',
    'Exterior brick laying',
  ],
  'mortar-repair': [
    'Tuckpointing (repointing)',
    'Chimney mortar repair',
    'Foundation mortar repair',
    'Brick & mortar restoration',
  ],
  'interlock': [
    'Interlock driveway installation',
    'Interlock patio installation',
    'Interlock walkway installation',
    'Paving stone repair & resetting',
  ],
  'trim-baseboard': [
    'Baseboard installation (room)',
    'Baseboard installation (full unit)',
    'Door & window casing installation',
    'Baseboard removal & replacement',
  ],
  'trim-crown': [
    'Crown moulding installation (room)',
    'Crown moulding installation (full unit)',
    'Crown moulding on kitchen cabinets',
    'Coffered ceiling trim',
  ],
  'trim-wainscot': [
    'Wainscoting installation',
    'Shiplap wall panel installation',
    'Board & batten installation',
    'Feature wall paneling',
  ],
  'shelving': [
    'Custom closet shelving',
    'Pantry shelving',
    'Garage shelving',
    'Built-in bookcase',
    'Floating shelf installation',
  ],
  'stair-rail': [
    'Stair railing installation',
    'Baluster replacement',
    'Handrail installation',
    'Glass railing installation',
    'Newel post installation',
  ],
  'labour-general': [
    'General renovation labour',
    'Material handling & staging',
    'Site preparation',
    'Miscellaneous labour',
  ],
  'labour-cleanup': [
    'Post-renovation cleanup',
    'Debris removal & haul away',
    'Dumpster loading',
    'Final site broom clean',
  ],
  'labour-supervision': [
    'Project management & scheduling',
    'Subcontractor coordination',
    'Site inspection & quality control',
    'Permit application coordination',
  ],
  'labour-emergency': [
    'Emergency water damage response',
    'Emergency structural repair',
    'Emergency roof repair',
    'After-hours emergency call',
  ],
};

// ── Material presets for line-item autocomplete ───────────────────────────────
const MATERIAL_PRESETS = [
  // Drywall
  { label: 'Drywall Sheet 4x8', price: 18 },
  { label: 'Drywall Sheet 4x12', price: 22 },
  { label: 'Moisture-Resistant Drywall 4x8', price: 28 },
  { label: 'Fire-Rated Drywall 4x8', price: 32 },
  { label: 'Drywall Screws (1 lb box)', price: 14 },
  { label: 'Joint Compound (pail)', price: 28 },
  { label: 'Drywall Tape (roll)', price: 9 },
  { label: 'Corner Bead', price: 12 },
  { label: 'Metal Corner Bead', price: 8 },

  // Painting
  { label: 'Interior Paint (1 gallon)', price: 55 },
  { label: 'Exterior Paint (1 gallon)', price: 65 },
  { label: 'Primer (1 gallon)', price: 45 },
  { label: 'Deck Stain (1 gallon)', price: 60 },
  { label: 'Cabinet Paint (1 quart)', price: 45 },
  { label: 'Epoxy Floor Paint (kit)', price: 120 },
  { label: 'Caulking Tube', price: 7 },
  { label: "Painter's Tape", price: 8 },
  { label: 'Paint Roller Kit', price: 18 },
  { label: 'Brush Set', price: 15 },
  { label: 'Drop Sheets', price: 12 },
  { label: 'Paint Tray & Liners', price: 10 },

  // Flooring
  { label: 'Hardwood Flooring (sq ft)', price: 8 },
  { label: 'Engineered Hardwood (sq ft)', price: 6 },
  { label: 'Laminate Flooring (sq ft)', price: 4 },
  { label: 'Vinyl Plank / LVP (sq ft)', price: 5 },
  { label: 'Carpet (sq ft)', price: 4 },
  { label: 'Carpet Underlay (sq ft)', price: 1 },
  { label: 'Flooring Underlay (roll)', price: 45 },
  { label: 'Transition Strip', price: 18 },
  { label: 'Floor Leveler (bag)', price: 40 },
  { label: 'Subfloor Plywood (sheet)', price: 38 },

  // Tile
  { label: 'Ceramic Tile (sq ft)', price: 6 },
  { label: 'Porcelain Tile (sq ft)', price: 9 },
  { label: 'Large Format Tile (sq ft)', price: 14 },
  { label: 'Mosaic Tile (sheet)', price: 22 },
  { label: 'Subway Tile (sq ft)', price: 8 },
  { label: 'Outdoor / Frost-Resistant Tile (sq ft)', price: 12 },
  { label: 'Tile Adhesive / Thinset (bag)', price: 35 },
  { label: 'Grout (bag)', price: 25 },
  { label: 'Tile Spacers (bag)', price: 8 },
  { label: 'Grout Sealer', price: 18 },
  { label: 'Waterproof Membrane (roll)', price: 65 },
  { label: 'Schluter / Edge Trim', price: 20 },

  // Lumber & Framing
  { label: '2x4 Lumber (8 ft)', price: 7 },
  { label: '2x4 Lumber (10 ft)', price: 9 },
  { label: '2x6 Lumber (8 ft)', price: 10 },
  { label: '2x6 Lumber (10 ft)', price: 13 },
  { label: '2x8 Lumber', price: 16 },
  { label: '2x10 Lumber', price: 20 },
  { label: 'Pressure Treated Lumber (2x4)', price: 12 },
  { label: 'Pressure Treated Lumber (2x6)', price: 16 },
  { label: 'Plywood Sheet (3/4")', price: 55 },
  { label: 'Plywood Sheet (1/2")', price: 42 },
  { label: 'OSB Board (7/16")', price: 30 },
  { label: 'LVL Beam', price: 85 },
  { label: 'Steel Stud (10 ft)', price: 10 },
  { label: 'Track / Runner (10 ft)', price: 8 },

  // Trim & Moulding
  { label: 'Baseboard Moulding (8 ft)', price: 12 },
  { label: 'Crown Moulding (8 ft)', price: 18 },
  { label: 'Door Casing (set)', price: 22 },
  { label: 'Window Casing (set)', price: 20 },
  { label: 'Shiplap / Board (8 ft)', price: 14 },
  { label: 'Quarter Round (8 ft)', price: 6 },

  // Decking & Fencing
  { label: 'Composite Decking (sq ft)', price: 12 },
  { label: 'Pressure Treated Decking (sq ft)', price: 6 },
  { label: 'Cedar Decking (sq ft)', price: 9 },
  { label: 'Deck Post (4x4 PT)', price: 18 },
  { label: 'Deck Post (6x6 PT)', price: 28 },
  { label: 'Joist Hanger', price: 4 },
  { label: 'Deck Screws (box)', price: 22 },
  { label: 'Post Base / Bracket', price: 18 },
  { label: 'Fence Board (6 ft)', price: 8 },
  { label: 'Fence Post (4x4)', price: 14 },

  // Roofing
  { label: 'Shingles Bundle', price: 55 },
  { label: 'Ice & Water Shield (roll)', price: 85 },
  { label: 'Roofing Felt / Underlayment (roll)', price: 40 },
  { label: 'Roofing Nails', price: 14 },
  { label: 'Ridge Cap (bundle)', price: 45 },
  { label: 'Drip Edge (10 ft)', price: 12 },
  { label: 'Flashing (roll)', price: 25 },
  { label: 'Eavestrough (10 ft)', price: 18 },
  { label: 'Downspout (10 ft)', price: 14 },
  { label: 'Downspout Elbow', price: 8 },
  { label: 'Gutter Guard (10 ft)', price: 12 },

  // Insulation
  { label: 'Batt Insulation R20 (bag)', price: 55 },
  { label: 'Batt Insulation R12 (bag)', price: 40 },
  { label: 'Rigid Foam Board 2" (sheet)', price: 28 },
  { label: 'Vapour Barrier (roll)', price: 45 },

  // Concrete & Masonry
  { label: 'Concrete Mix (bag)', price: 8 },
  { label: 'Mortar Mix (bag)', price: 10 },
  { label: 'Rebar (10 ft)', price: 12 },
  { label: 'Wire Mesh (sheet)', price: 18 },
  { label: 'Interlock Paving Stone (each)', price: 3 },
  { label: 'Retaining Wall Block (each)', price: 5 },

  // Fasteners & Adhesives
  { label: 'Nails (box)', price: 12 },
  { label: 'Wood Screws (box)', price: 15 },
  { label: 'Drywall Screws (box)', price: 14 },
  { label: 'Lag Bolts / Structural Screws', price: 22 },
  { label: 'Anchors / Fasteners', price: 18 },
  { label: 'Construction Adhesive', price: 9 },
  { label: 'Silicone Sealant', price: 8 },
  { label: 'Expanding Foam', price: 14 },
  { label: 'Acoustic Sealant', price: 12 },

  // Electrical (supply only)
  { label: 'Electrical Wire (roll)', price: 60 },
  { label: 'Outlet / Receptacle', price: 6 },
  { label: 'Light Switch', price: 5 },
  { label: 'Junction Box', price: 8 },
  { label: 'LED Light Fixture', price: 45 },
  { label: 'Pot Light (each)', price: 25 },
  { label: 'Breaker / Panel Part', price: 35 },

  // Plumbing (supply only)
  { label: 'PVC Pipe (10 ft)', price: 12 },
  { label: 'PEX Pipe (10 ft)', price: 15 },
  { label: 'Pipe Fittings', price: 10 },
  { label: 'Plumbing Sealant / Tape', price: 6 },
  { label: 'Shutoff Valve', price: 18 },
  { label: 'P-Trap', price: 14 },

  // Cleanup & Misc
  { label: 'Cleaning Supplies', price: 30 },
  { label: 'Garbage Bags (Contractor box)', price: 25 },
  { label: 'Shop Towels', price: 15 },
  { label: 'Safety Equipment (PPE)', price: 35 },
  { label: 'Equipment Rental (per day)', price: 150 },
  { label: 'Tool Consumables', price: 30 },
  { label: 'Delivery / Pickup', price: 75 },
  { label: 'Dump Fees', price: 110 },
  { label: 'Permit Fees', price: 200 },
  { label: 'Labour Adjustment / Misc', price: 50 },
];

const RECENTS_KEY = 'materialRecents';
const MAX_RECENTS = 10;

function loadRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecent(preset) {
  try {
    const prev = loadRecents().filter((r) => r.label !== preset.label);
    localStorage.setItem(RECENTS_KEY, JSON.stringify([preset, ...prev].slice(0, MAX_RECENTS)));
  } catch {
    // localStorage unavailable — silently skip
  }
}

// ── Autocomplete dropdown for a single line-item description field ────────────
function DescriptionAutocomplete({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState(loadRecents);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const query = value.trim().toLowerCase();

  const filteredPresets = query.length >= 2
    ? MATERIAL_PRESETS.filter((p) => p.label.toLowerCase().includes(query)).slice(0, 8)
    : [];

  const showRecents = open && query.length < 2 && recents.length > 0;
  const showMatches = open && filteredPresets.length > 0;
  const isOpen = showRecents || showMatches;

  const handleSelect = (preset) => {
    onSelect(preset);
    saveRecent(preset);
    setRecents(loadRecents());
    setOpen(false);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="desc-autocomplete-wrap" ref={wrapRef}>
      <input
        type="text"
        className="form-input"
        placeholder="Materials, fixed fee, rental, etc."
        value={value}
        autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {isOpen && (
        <div className="material-suggestions">
          {showRecents && (
            <>
              <div className="suggestions-group-label">
                <i className="fas fa-history"></i> Recently used
              </div>
              {recents.map((r) => (
                <button
                  key={r.label}
                  className="suggestion-item"
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                >
                  <span className="suggestion-label">{r.label}</span>
                  <span className="suggestion-price">{formatCurrency(r.price)}</span>
                </button>
              ))}
            </>
          )}
          {showMatches && (
            <>
              {showRecents && <div className="suggestions-divider" />}
              <div className="suggestions-group-label">
                <i className="fas fa-box"></i> Materials & Supplies
              </div>
              {filteredPresets.map((p) => (
                <button
                  key={p.label}
                  className="suggestion-item"
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                >
                  <span className="suggestion-label">{p.label}</span>
                  <span className="suggestion-price">{formatCurrency(p.price)}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const SERVICE_TYPE_GROUPS = [...new Set(SERVICE_TYPES.map((t) => t.group))];

const newHourly = () => ({
  id: Date.now() + Math.random(),
  serviceType: '',
  description: '',
  notes: '',
  hours: '',
  rate: '',
});
const newLineItem = () => ({ id: Date.now() + Math.random(), description: '', quantity: 1, price: '' });

const ServiceCalculator = forwardRef(function ServiceCalculator(_, ref) {
  const [hourlyServices, setHourlyServices] = useState([newHourly()]);
  const [lineItems, setLineItems] = useState([]);

  const hourlyTotal = roundToTwo(
    hourlyServices.reduce(
      (s, r) => s + roundToTwo((parseFloat(r.hours) || 0) * (parseFloat(r.rate) || 0)),
      0
    )
  );
  const lineItemsTotal = roundToTwo(
    lineItems.reduce(
      (s, i) => s + roundToTwo((parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0)),
      0
    )
  );
  const subtotal = roundToTwo(hourlyTotal + lineItemsTotal);

  const updateHourly = (id, field, value) => {
    setHourlyServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (field === 'serviceType') {
          const found = SERVICE_TYPES.find((t) => t.value === value);
          return {
            ...s,
            serviceType: value,
            rate: found ? String(found.rate) : '',
            description: '',
          };
        }
        return { ...s, [field]: value };
      })
    );
  };

  const updateLineItem = (id, field, value) =>
    setLineItems((p) => p.map((i) => (i.id !== id ? i : { ...i, [field]: value })));

  const applyMaterialPreset = (id, preset) => {
    setLineItems((p) =>
      p.map((i) =>
        i.id !== id ? i : { ...i, description: preset.label, price: String(preset.price) }
      )
    );
  };

  const presetsForType = (serviceTypeValue) =>
    serviceTypeValue && DESCRIPTION_OPTIONS[serviceTypeValue]
      ? DESCRIPTION_OPTIONS[serviceTypeValue]
      : [];

  const serviceTypeOptions = useMemo(
    () =>
      SERVICE_TYPE_GROUPS.map((groupName) => (
        <optgroup key={groupName} label={groupName}>
          {SERVICE_TYPES.filter((t) => t.group === groupName).map((t) => (
            <option key={t.value} value={t.value}>
              {t.label} — ${t.rate}/hr
            </option>
          ))}
        </optgroup>
      )),
    []
  );

  useImperativeHandle(ref, () => ({
    getTotals: (chargeHST) => {
      const taxAmount = chargeHST ? roundToTwo(subtotal * 0.13) : 0;
      return {
        hourlyTotal,
        lineItemsTotal,
        subtotal,
        taxAmount,
        finalTotal: roundToTwo(subtotal + taxAmount),
      };
    },
    getData: (chargeHST) => {
      const hourly = hourlyServices
        .filter((s) => s.serviceType && parseFloat(s.hours) > 0)
        .map((s) => {
          const label = SERVICE_TYPES.find((t) => t.value === s.serviceType)?.label || '';
          let description = (s.description && s.description.trim()) || label;
          if (s.notes.trim()) description += ` - ${s.notes.trim()}`;
          return {
            serviceType: label,
            description,
            hours: parseFloat(s.hours),
            rate: parseFloat(s.rate) || 0,
            total: roundToTwo(parseFloat(s.hours) * (parseFloat(s.rate) || 0)),
          };
        });
      const items = lineItems
        .filter(
          (i) =>
            i.description.trim() &&
            parseFloat(i.quantity) > 0 &&
            parseFloat(i.price) > 0
        )
        .map((i) => ({
          description: i.description.trim(),
          quantity: parseFloat(i.quantity),
          price: parseFloat(i.price),
          total: roundToTwo(parseFloat(i.quantity) * parseFloat(i.price)),
        }));
      const taxAmount = chargeHST ? roundToTwo(subtotal * 0.13) : 0;
      return {
        hourlyServices: hourly,
        lineItems: items,
        totals: {
          subtotal,
          taxAmount,
          finalTotal: roundToTwo(subtotal + taxAmount),
          taxRate: chargeHST ? 0.13 : 0,
        },
      };
    },
    validate: () => {
      const errors = [];
      const hasHourly = hourlyServices.some(
        (s) => s.serviceType && parseFloat(s.hours) > 0
      );
      const hasItems = lineItems.some(
        (i) =>
          i.description.trim() &&
          parseFloat(i.quantity) > 0 &&
          parseFloat(i.price) > 0
      );
      if (!hasHourly && !hasItems) {
        errors.push('Please add at least one service or line item');
        return errors;
      }
      hourlyServices.forEach((s, i) => {
        if (s.serviceType) {
          if (!(parseFloat(s.hours) > 0))
            errors.push(`Hourly service ${i + 1}: Hours must be greater than 0`);
          if (!(parseFloat(s.rate) > 0))
            errors.push(`Hourly service ${i + 1}: Rate must be greater than 0`);
        }
      });
      return errors;
    },
    reset: () => {
      setHourlyServices([newHourly()]);
      setLineItems([]);
    },
  }));

  return (
    <div className="service-calc-card">
      <div className="card-title">
        <i className="fas fa-hard-hat"></i> Services
      </div>

      <div className="services-sublabel">
        <i className="fas fa-clock"></i> Hourly Services
      </div>

      {hourlyServices.map((s) => {
        const presets = presetsForType(s.serviceType);
        const presetDisabled = !s.serviceType;

        return (
          <div className="hourly-service-block" key={s.id}>
            <div className="service-row">
              <div className="form-group">
                <label className="form-label">Service type</label>
                <select
                  className="form-select"
                  value={s.serviceType}
                  onChange={(e) => updateHourly(s.id, 'serviceType', e.target.value)}
                >
                  <option value="">Select type</option>
                  {serviceTypeOptions}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Line item (preset)</label>
                <select
                  className="form-select"
                  value={presetDisabled ? '' : s.description}
                  disabled={presetDisabled}
                  onChange={(e) => updateHourly(s.id, 'description', e.target.value)}
                >
                  <option value="">
                    {presetDisabled
                      ? 'Select service type first'
                      : 'Choose preset or leave for service name only'}
                  </option>
                  {presets.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hours</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="0.25"
                  placeholder="0.00"
                  value={s.hours}
                  onChange={(e) => updateHourly(s.id, 'hours', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rate/hr</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="1"
                  placeholder="Auto"
                  value={s.rate}
                  onChange={(e) => updateHourly(s.id, 'rate', e.target.value)}
                />
              </div>
            </div>

            <div className="notes-row">
              <div className="form-group">
                <label className="form-label">
                  Additional details{' '}
                  <span className="optional">(optional — appended on PDF)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. room name, floor level, scope notes"
                  value={s.notes}
                  onChange={(e) => updateHourly(s.id, 'notes', e.target.value)}
                />
              </div>
            </div>

            <div className="hourly-service-footer">
              <button
                className="btn-remove"
                onClick={() => setHourlyServices((p) => p.filter((r) => r.id !== s.id))}
                type="button"
                aria-label="Remove this hourly service"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        );
      })}

      <div className="services-sublabel" style={{ marginTop: '28px' }}>
        <i className="fas fa-list"></i> Line Items (Materials & Fixed Costs)
      </div>

      {lineItems.map((item) => (
        <div className="lineitem-row" key={item.id}>
          <div className="form-group desc-col">
            <label className="form-label">Description</label>
            <DescriptionAutocomplete
              value={item.description}
              onChange={(val) => updateLineItem(item.id, 'description', val)}
              onSelect={(preset) => applyMaterialPreset(item.id, preset)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Qty</label>
            <input
              type="number"
              className="form-input"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Price</label>
            <input
              type="number"
              className="form-input"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={item.price}
              onChange={(e) => updateLineItem(item.id, 'price', e.target.value)}
            />
          </div>
          <div className="form-group remove-col">
            <label className="form-label">&nbsp;</label>
            <button
              className="btn-remove"
              onClick={() => setLineItems((p) => p.filter((i) => i.id !== item.id))}
              type="button"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      ))}

      <div className="add-btns">
        <button
          className="btn-add-service"
          onClick={() => setHourlyServices((p) => [...p, newHourly()])}
          type="button"
        >
          <i className="fas fa-plus"></i> Add Hourly Service
        </button>
        <button
          className="btn-add-line"
          onClick={() => setLineItems((p) => [...p, newLineItem()])}
          type="button"
        >
          <i className="fas fa-plus"></i> Add Line Item
        </button>
      </div>
    </div>
  );
});

export default ServiceCalculator;
