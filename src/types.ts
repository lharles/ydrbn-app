export interface HypeSticker {
  id: string;
  text: string;
  type: 'circle' | 'square' | 'rect';
  bg: string;
  color: string;
  border: string;
  rotation: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export type GagArchetype = 
  | 'atomic_pastry'        // The Atomic Pastry Orbit System
  | 'cards_cheese'         // Green felt poker table with fanned cards pinned by Swiss cheese
  | 'food_bowl'            // Textured soup bowl with spoons and steam ripples
  | 'cosmic_toilet'        // Zero-gravity porcelain fixture floating in cosmic deep space nebula
  | 'ear_bandage'          // Human ear silhouette on vintage parchment with oversized medical bandage
  | 'vortex_spiral'        // Optical swirling hypnotic vortex in vintage duotone
  | 'sunburst_delay'       // 24-spoke optical sunburst rays in vintage duotone
  | 'hazard_atlas'         // Classical caution / surreal monument horizon
  | 'abacus_blueprint'     // Cyanotype blueprint grid with technical calipers and abacus frame
  | 'laminated_cheese'     // Stacked cheese singles with glossy plastic wrap and specular reflections
  | 'grill_denial'         // Sizzling grill grates with frankfurters and denial bubble
  | 'clothesline_porch'    // Clothesline with cartoon trousers/pantaloons flapping over wooden porch planks
  | 'bed_insomnia'         // Wooden bed frame/headboard with tangled sheets and clock face
  | 'pack_dogs'            // Stylized silhouettes of dog pack howling under moon or shock collar
  | 'office_door'          // Office door with "CLONE RECOVERY COUNSELING" sign
  | 'atomic_pastry'        // The Atomic Pastry Orbit System
  | 'cards_cheese'         // Green felt poker table with fanned cards pinned by Swiss cheese
  | 'food_bowl'            // Textured soup bowl with spoons and steam ripples
  | 'cosmic_toilet'        // Zero-gravity porcelain fixture floating in cosmic deep space nebula
  | 'ear_bandage'          // Human ear silhouette on vintage parchment with oversized medical bandage
  | 'vortex_spiral'        // Optical swirling hypnotic vortex in vintage duotone
  | 'sunburst_delay'       // 24-spoke optical sunburst rays in vintage duotone
  | 'hazard_atlas'         // Classical caution / surreal monument horizon
  | 'abacus_blueprint'     // Cyanotype blueprint grid with technical calipers and abacus frame
  | 'laminated_cheese'     // Stacked cheese singles with glossy plastic wrap and specular reflections
  | 'grill_denial'         // Sizzling grill grates with frankfurters and denial bubble
  | 'clothesline_porch'    // Clothesline with cartoon trousers/pantaloons flapping over wooden porch planks
  | 'bed_insomnia'         // Wooden bed frame/headboard with tangled sheets and clock face
  | 'pack_dogs'            // Stylized silhouettes of dog pack howling under moon or shock collar
  | 'office_door'          // Office door with "CLONE RECOVERY COUNSELING" sign
  | 'bureaucratic_banana'  // Banana beneath a rubber stamp, forms, paperclips, and official approval markings
  | 'soup_machine'         // Overcomplicated industrial apparatus whose sole function is producing one bowl of soup
  | 'emergency_potato'     // Potato surrounded by hazard tape, warning placards, and flashing emergency lights
  | 'telephone_mustache'   // Old rotary telephone wearing an enormous curled mustache
  | 'committee_ducks'      // Serious ducks seated around a conference table covered in paperwork
  | 'subpoena_pancake'     // Pancake stack served with an oversized legal summons
  | 'scientific_yogurt'    // Laboratory apparatus devoted to the apparently rigorous study of yogurt
  | 'forbidden_toaster'    // Ordinary toaster isolated behind elaborate warning barriers and hazard symbols
  | 'municipal_cabbage'    // Cabbage presented like an official civic monument with plaques and ceremonial bunting
  | 'executive_waffle'     // Waffle on a corporate boardroom table surrounded by charts and presentation materials
  | 'sad_trebuchet'        // Medieval trebuchet loaded with an extremely ordinary household object
  | 'professional_hamster' // Hamster posed behind a desk wearing tiny business attire with paperwork
  | 'taxidermy_blimp'      // Vintage taxidermy-style specimen presentation of an inexplicable dirigible
  | 'orbital_hummus'       // Hummus container rendered as a planetary body with tiny orbiting objects
  | 'classified_burrito'   // Burrito wrapped in stamped classified documents and security markings
  | 'weatherproof_cake'    // Elaborate cake exposed to absurdly severe weather while remaining pristine
  | 'industrial_crumpet'   // Crumpet presented like a heavy industrial component in a technical catalog
  | 'ceremonial_spork'     // Ornate spork displayed like a sacred or royal artifact
  | 'missing_socks'        // Lonely sock surrounded by evidence markers, investigative notes, and clues
  | 'hostile_vegetables'   // Cheerfully colorful vegetables arranged like a threatening military formation
  | 'departmental_pie'     // Pie surrounded by filing cabinets, forms, rubber stamps, and bureaucratic clutter
  | 'quantum_meatloaf'     // Meatloaf depicted as an impossible scientific specimen with competing states
  | 'haunted_lunchbox'     // Vintage lunchbox emitting absurdly dramatic supernatural light
  | 'legal_gnome'          // Garden gnome standing beside an absurdly large legal contract
  | 'astronaut_custard'    // Astronaut helmet containing an inexplicably pristine bowl of custard
  | 'mechanical_pigeon'    // Elaborate clockwork pigeon rendered like an antique engineering illustration
  | 'premium_rocks'        // Ordinary rocks arranged as though displayed in an expensive luxury catalog
  | 'forensic_crumpet'     // Crumpet surrounded by magnifying glasses, evidence tags, and investigative equipment
  | 'royal_plunger'        // Toilet plunger displayed with the visual grandeur of a royal ceremonial object
  | 'existential_cereal'   // Bowl of cereal surrounded by ominous philosophical diagrams and unanswered questions
  | 'corporate_mushroom'   // Mushroom presented as the CEO of an impossibly serious organization
  | 'classified_toast'     // Slice of toast covered with redacted documents and security stamps
  | 'weather_report_pants' // Pair of trousers depicted as the subject of a formal meteorological chart
  | 'museum_hamster'       // Hamster presented inside an ornate museum display with descriptive placards
  | 'dangerous_cushion'    // Innocent couch cushion surrounded by elaborate industrial hazard infrastructure
  | 'ceremonial_corn'      // Single ear of corn presented in a grandiose ritual or state ceremony
  | 'astronomical_pickle'  // Pickle rendered as a celestial body in a vintage astronomical plate
  | 'bureaucratic_ghost'   // Cartoon ghost buried beneath forms, folders, stamps, and administrative paperwork
  | 'medical_tuba'         // Brass tuba presented as though undergoing an elaborate medical examination
  | 'suspicious_pudding'   // Pudding surrounded by surveillance equipment, warning labels, and investigative notes
  | 'retirement_laser'     // Futuristic laser apparatus presented with an oddly mundane retirement-office theme
  | 'municipal_mustache'   // Giant mustache treated as a civic landmark with official signage
  | 'archaeological_spork'  // Spork excavated from the ground and documented like an ancient artifact
  | 'classified_squirrel'  // Squirrel surrounded by redacted files, security tape, and government-style documents
  | 'emergency_crumpet'    // Crumpet treated as the subject of a full-scale emergency response
  | 'industrial_feather'   // Single feather rendered as massive engineered machinery
  | 'pharmaceutical_pizza'  // Pizza presented in a sterile pharmaceutical product-advertisement setting
  | 'cosmic_laundry'       // Domestic laundry floating weightlessly through an elaborate astronomical scene
  | 'judicial_meatball'    // Meatball seated at a miniature courtroom bench under solemn judicial lighting
  | 'corporate_ducks'      // Ducks arranged in a sterile corporate presentation with charts and diagrams
  | 'museum_butthole'      // Anatomical woodcut-style presentation treated as an absurdly prestigious museum artifact
  | 'scientific_fart'      // Fart represented through absurdly elaborate scientific diagrams and measurement apparatus
  | 'ornamental_toenail'   // Single toenail rendered as an ornate classical decorative object
  | 'philosophical_potato' // Potato surrounded by diagrams, quotation marks, and unnecessarily profound visual symbolism
  | 'government_cheese'    // Cheese presented as an official governmental object with seals and ceremonial documentation
  | 'military_yogurt'      // Yogurt container arranged with miniature military insignia and strategic diagrams
  | 'experimental_pants'   // Trousers surrounded by laboratory apparatus as though undergoing a scientific experiment
  | 'quantum_waffle'       // Waffle depicted simultaneously as several incompatible states of breakfast
  | 'forbidden_hummus'     // Hummus container isolated behind barriers, warning signs, and mysterious official notices
  | 'astronaut_lawnmower'  // Lawnmower floating in space with the visual treatment of a spacecraft
  | 'royal_toilet'         // Porcelain toilet depicted with absurdly elaborate royal ornamentation
  | 'bureaucratic_gnome'   // Garden gnome overwhelmed by forms, stamps, filing cabinets, and procedural notices
  | 'archival_hotdog'      // Hotdog documented as though it were a historically significant cultural artifact
  | 'meteorological_soup'  // Bowl of soup presented as a detailed weather map
  | 'industrial_marshmallow' // Marshmallow rendered as enormous heavy machinery
  | 'legal_chicken'        // Chicken surrounded by contracts, legal documents, and courtroom imagery
  | 'ceremonial_toothpaste' // Tube of toothpaste presented as a sacred ceremonial object
  | 'cosmic_abacus'        // Abacus floating through deep space amid stars, orbital diagrams, and mathematical notation
  | 'vintage_advertisement' // Bright mid-century commercial illustration with absurd product or slogan
  | 'technical_diagram'     // Dense labeled engineering diagram of an inexplicably mundane subject
  | 'museum_plate'          // Ornate archival specimen plate with formal captions and catalog markings
  | 'safety_poster'         // Cheerful instructional safety poster depicting an obviously ridiculous hazard
  | 'propaganda_poster'     // Bold vintage poster composition promoting an absurdly mundane objective
  | 'medical_plate'         // Anatomical textbook illustration of a completely inappropriate subject
  | 'product_catalog'       // Sterile catalog presentation of an ordinary object treated as premium equipment
  | 'courtroom_scene'       // Dramatic judicial composition centered on an absurd nonhuman defendant
  | 'corporate_diagram'     // Corporate presentation graphic explaining an entirely pointless process
  | 'archaeological_plate'  // Formal excavation documentation for an object that obviously does not warrant it
  | 'astronomical_plate'    // Vintage celestial chart depicting an absurd terrestrial object
  | 'instruction_manual'    // Cheerful illustrated manual explaining a bizarre and unnecessary procedure
  | 'field_guide'           // Naturalist-style specimen illustration of an impossible or mundane subject
  | 'bureaucratic_notice'   // Dense official notice, forms, stamps, seals, and one inexplicable central object
  | 'luxury_catalog'        // Excessively elegant commercial presentation of an utterly worthless object
  | 'instructional_fart'   // Cheerfully illustrated instructional diagram explaining an entirely unnecessary bodily procedure
  | 'luxury_cabbage'       // Cabbage photographed and composed like an extravagant luxury product
  | 'patriotic_spork'      // Spork presented in the visual language of a grand national emblem
  | 'album_cover_toaster'  // Toaster posed dramatically like a rock band portrait
  | 'renaissance_hamster'  // Hamster painted with the composition and gravitas of a Renaissance portrait
  | 'propaganda_pancake'   // Pancake depicted in colorful vintage propaganda-poster style
  | 'technical_burrito'    // Burrito rendered as an engineering schematic with labels and measurements
  | 'nature_documentary_sock' // Single sock photographed as though it were a rare wildlife specimen
  | 'astronomical_meatball' // Meatball treated as a newly discovered celestial object
  | 'corporate_pigeon'     // Pigeon presented in the visual language of a corporate annual report
  | 'classical_toaster'    // Toaster treated as a monumental subject in an old master painting
  | 'medical_potato'       // Potato presented as a clinical anatomical specimen
  | 'archaeological_pants' // Pair of pants excavated and documented as an ancient artifact
  | 'military_cucumber'    // Cucumber presented through an elaborate military briefing aesthetic
  | 'bureaucratic_pizza'   // Pizza buried beneath official forms, stamps, permits, and procedural diagrams
  | 'scientific_trousers'  // Trousers subjected to an unnecessarily elaborate scientific analysis
  | 'religious_meatloaf'   // Meatloaf surrounded by solemn iconographic and ceremonial imagery
  | 'museum_spork'         // Spork isolated in an ornate museum display with absurdly serious labeling
  // Compatibility aliases
  | 'kitchen_still_life'
  | 'cards_table'
  | 'atomic_orbit'
  | 'cosmic_deep_space'
  | 'anatomical_woodcut'
  | 'optical_hypnotic'
  | 'blueprint_drafting'
  | 'surreal_landscape'
  | 'literal_denial'
  | 'classical_hazard'
  | 'hypnotic_swirl'
  | 'absurd_blueprint'
  | 'cosmic_domestic'
  | 'trumped_by_cheese'
  | 'custom_photo'
    // Compatibility aliases
  | 'kitchen_still_life'
  | 'cards_table'
  | 'atomic_orbit'
  | 'cosmic_deep_space'
  | 'anatomical_woodcut'
  | 'optical_hypnotic'
  | 'blueprint_drafting'
  | 'surreal_landscape'
  | 'literal_denial'
  | 'classical_hazard'
  | 'hypnotic_swirl'
  | 'absurd_blueprint'
  | 'cosmic_domestic'
  | 'trumped_by_cheese'
  | 'vintage_advertisement'
  | 'technical_diagram'
  | 'museum_plate'
  | 'safety_poster'
  | 'propaganda_poster'
  | 'medical_plate'
  | 'product_catalog'
  | 'courtroom_scene'
  | 'corporate_diagram'
  | 'archaeological_plate'
  | 'astronomical_plate'
  | 'instruction_manual'
  | 'field_guide'
  | 'bureaucratic_notice'
  | 'luxury_catalog'
  | 'bureaucratic_object'
  | 'scientific_nonsense'
  | 'industrial_domestic'
  | 'cosmic_object'
  | 'ceremonial_object'
  | 'forbidden_object'
  | 'classified_object'
  | 'medical_object'
  | 'legal_object'
  | 'archaeological_object'
  | 'museum_object'
  | 'corporate_object'
  | 'military_object'
  | 'royal_object'
  | 'pharmaceutical_object'
  | 'meteorological_object'
  | 'astronomical_object'
  | 'experimental_object'
  | 'ordinary_object_grandeur'
  | 'mundane_scientific'
  | 'domestic_cosmic'
  | 'bureaucratic_surreal'
  | 'technical_absurdity'
  | 'ceremonial_nonsense'
  | 'officially_absurd'
  | 'scientifically_unnecessary'
  | 'historically_inappropriate'
  | 'professionally_serious'
  | 'dramatically_mundane'
  | 'elaborately_pointless'
  | 'unnecessarily_formal'
  | 'absurdly_official'
  | 'seriously_inconsequential'
  | 'emergency_food'
  | 'bureaucratic_food'
  | 'scientific_food'
  | 'legal_food'
  | 'cosmic_food'
  | 'industrial_food'
  | 'ceremonial_food'
  | 'museum_food'
  | 'classified_food'
  | 'forensic_food'
  | 'corporate_food'
  | 'dangerous_domestic'
  | 'luxury_domestic'
  | 'medical_domestic'
  | 'industrial_domestic'
  | 'archaeological_domestic'
  | 'cosmic_domestic'
  | 'bureaucratic_domestic'
  | 'ceremonial_domestic'
  | 'scientific_domestic'
  | 'custom_photo';

export type TitleFontFamily = 
  | 'medieval'       // 'MedievalSharp', cursive
  | 'bubble'         // 'Righteous', cursive
  | 'comic'          // 'Bangers', cursive
  | 'marker'         // 'Permanent Marker', cursive
  | 'monospace'      // 'Space Mono', monospace
  | 'chrome'         // 'Russo One', sans-serif
  | 'typewriter'     // 'Special Elite', monospace
  | 'western'        // 'Rye', serif
  | 'arcade'         // 'Press Start 2P', monospace
  | 'graffiti'       // 'Bowlby One SC', display
  | 'serif'          // 'Bree Serif', serif
  | 'handwritten'    // 'Patrick Hand', cursive
  | 'stencil'        // 'Black Ops One', display
  | 'space'          // 'Audiowide', sans-serif
  | 'circus'         // 'Londrina Solid', display
  | 'newspaper'      // 'Roboto Slab', serif
  | 'industrial'     // 'Barlow Condensed', sans-serif
  | 'schoolbook'     // 'Schoolbell', cursive
  | 'futuristic'     // 'Orbitron', sans-serif
  | 'ornamental';    // 'Cinzel Decorative', serif

export type TitleShadowStyle = 
  | 'harsh-black'       // Heavy black offset drop-shadow
  | 'neon-glow'         // Vibrant contrasting neon glow
  | 'chromatic-3d'      // 3D chromatic aberration offset
  | 'retro-bevel'       // Contrasting multi-layer depth
  | 'long-shadow'       // Extended diagonal geometric shadow
  | 'double-outline'    // Thick contrasting outline with secondary edge
  | 'offset-print'      // Misregistered vintage printing layers
  | 'inner-glow'        // Bright interior glow with dark outer edge
  | 'embossed'           // Raised dimensional highlight and shadow
  | 'sticker-outline'   // Thick irregular sticker-like border
  | 'halftone-shadow'   // Dotted offset shadow resembling old print
  | 'electric-outline'  // Thin high-energy luminous contour
  | 'ghosted'            // Multiple faint offset repetitions
  | 'rubber-stamp'       // Uneven distressed stamped impression
  | 'none';              // No shadow or depth treatment

export type TitleComposition = 
  | 'top-arc'          // Centered along top third with upward tilt (-15° to -5°)
  | 'diagonal-cross'   // Staggered across middle with bold -18° to +18° slant
  | 'split-corners'    // Band name tucked into top-left; album title tucked into bottom-right
  | 'bottom-banner'    // Heavy horizontal banner locked along lower margin
  | 'center-stack'     // Large centered stacked lines with irregular vertical spacing
  | 'vertical-edge'    // Title rotated vertically along one side
  | 'corner-stamp'     // Compact title block stamped into one corner
  | 'offset-stack'     // Each line shifted progressively sideways
  | 'giant-background' // Oversized title partially obscured behind the subject
  | 'floating-label'   // Small detached title plate floating beside the subject
  | 'circular-seal'    // Text arranged around a circular emblem
  | 'split-horizontal' // Title divided across upper and lower image fields
  | 'overlap-subject'  // Text intentionally intersects and obscures the subject
  | 'poster-grid'      // Multiple text blocks arranged like a vintage poster
  | 'tiny-caption';    // Comically small formal caption beneath an oversized subject

export type VintagePaletteName =
  | '70s Earth'
  | 'Psych Glow'
  | 'Vintage Studio'
  | 'Mint & Lavender'
  | 'Acid Sunset'
  | 'Diner Neon'
  | 'Poolside Retro'
  | 'Harvest Faded'
  | 'Tropical Pulp'
  | 'Electric Pastel'
  | 'Space Age'
  | 'County Fair'
  | 'Cheap Print'
  | 'Arcade Carpet'
  | 'Institutional'
  | 'Carnival'
  | 'Desert Motel'
  | 'Medical Vintage'
  | 'Safety Orange'
  | 'Blueprint Ink';

export interface VintagePalette {
  name: VintagePaletteName;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const VINTAGE_PALETTES: VintagePalette[] = [
  {
    name: '70s Earth',
    primary: '#d97724',
    secondary: '#eab308',
    accent: '#78350f',
    background: '#fef3c7',
  },
  {
    name: 'Psych Glow',
    primary: '#06b6d4',
    secondary: '#a855f7',
    accent: '#ec4899',
    background: '#18182b',
  },
  {
    name: 'Vintage Studio',
    primary: '#b91c1c',
    secondary: '#1e293b',
    accent: '#d97724',
    background: '#fef3c7',
  },
  {
    name: 'Mint & Lavender',
    primary: '#a7f3d0',
    secondary: '#ddd6fe',
    accent: '#111827',
    background: '#1e1b4b',
  },
  {
    name: 'Acid Sunset',
    primary: '#f43f5e',
    secondary: '#facc15',
    accent: '#7e22ce',
    background: '#312e81',
  },
  {
    name: 'Diner Neon',
    primary: '#fb7185',
    secondary: '#38bdf8',
    accent: '#fef08a',
    background: '#172033',
  },
  {
    name: 'Poolside Retro',
    primary: '#2dd4bf',
    secondary: '#f9a8d4',
    accent: '#fb923c',
    background: '#ecfeff',
  },
  {
    name: 'Harvest Faded',
    primary: '#a16207',
    secondary: '#c2410c',
    accent: '#365314',
    background: '#fefce8',
  },
  {
    name: 'Tropical Pulp',
    primary: '#16a34a',
    secondary: '#f97316',
    accent: '#e11d48',
    background: '#fef9c3',
  },
  {
    name: 'Electric Pastel',
    primary: '#67e8f9',
    secondary: '#c4b5fd',
    accent: '#f9a8d4',
    background: '#faf5ff',
  },
  {
    name: 'Space Age',
    primary: '#94a3b8',
    secondary: '#38bdf8',
    accent: '#f472b6',
    background: '#0f172a',
  },
  {
    name: 'County Fair',
    primary: '#dc2626',
    secondary: '#facc15',
    accent: '#2563eb',
    background: '#fff7ed',
  },
  {
    name: 'Cheap Print',
    primary: '#57534e',
    secondary: '#a8a29e',
    accent: '#b91c1c',
    background: '#e7e5e4',
  },
  {
    name: 'Arcade Carpet',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    accent: '#f43f5e',
    background: '#111827',
  },
  {
    name: 'Institutional',
    primary: '#64748b',
    secondary: '#d6d3d1',
    accent: '#b45309',
    background: '#f5f5f4',
  },
  {
    name: 'Carnival',
    primary: '#db2777',
    secondary: '#2563eb',
    accent: '#f59e0b',
    background: '#fef2f2',
  },
  {
    name: 'Desert Motel',
    primary: '#c2410c',
    secondary: '#0e7490',
    accent: '#facc15',
    background: '#fffbeb',
  },
  {
    name: 'Medical Vintage',
    primary: '#0f766e',
    secondary: '#e7e5e4',
    accent: '#be123c',
    background: '#f0fdfa',
  },
  {
    name: 'Safety Orange',
    primary: '#ea580c',
    secondary: '#fef3c7',
    accent: '#171717',
    background: '#fafafa',
  },
  {
    name: 'Blueprint Ink',
    primary: '#e0f2fe',
    secondary: '#38bdf8',
    accent: '#f8fafc',
    background: '#172554',
  },
];

export type BackdropType = 
  | 'minimal_gradient'     // Clean two-color procedural gradient
  | 'split_horizon'        // Two-tone ground/sky with atmospheric gradient
  | 'drafting_grid'        // Technical blueprint lines with coordinate markers
  | 'radial_sunburst'      // Variable count (12 to 36) alternating colored rays
  | 'hypnotic_rings'       // Concentric circles, wavy optical ripples, or spirals
  | 'deep_space'           // Dark nebula radial wash with procedurally scattered star clusters
  | 'diagonal_duotone'     // Sharp 45-degree angled color split with contrasting borders
  | 'vintage_parchment'    // Aged paper wash with subtle grunge border vignetting
  | 'minimal_box'          // Centered framed inset panel with double-line borders
  | 'desert_horizon'       // Two-tone sunset sky with flat sand-colored ground plane
  | 'dark_forest'          // Twilight with repeating triangular pine tree silhouettes
  | 'urban_skyline'        // Cityscape silhouette of blocky geometric buildings with yellow windows
  | 'traffic_jam'          // Stylized row of overlapping trapezoidal cars with glowing taillights
  | 'checkerboard'         // Large alternating geometric squares with offset retro perspective
  | 'comic_burst'          // Jagged radial burst with layered comic-book energy lines
  | 'halftone_field'       // Large-print halftone dots fading across a flat background
  | 'paper_collage'        // Overlapping torn-paper shapes with visible printed edges
  | 'museum_wall'          // Formal gallery wall with framed empty space around the subject
  | 'laboratory_wall'      // Sterile tiled wall with technical markings and equipment shadows
  | 'office_corridor'      // Endless institutional corridor with fluorescent ceiling panels
  | 'suburban_lawn'        // Flat cartoon lawn, sidewalk, fence, and simplified sky
  | 'county_fair'          // Decorative bunting, booths, lights, and exaggerated perspective
  | 'rooftop'              // Flat urban rooftop with antennae, vents, and distant skyline
  | 'moon_surface'         // Simplified cratered lunar ground beneath a black sky
  | 'ocean_horizon'        // Stylized flat sea meeting an exaggerated colorful sky
  | 'mountain_valley'      // Layered geometric mountains with atmospheric depth
  | 'underwater'           // Saturated underwater field with bubbles, plants, and distant silhouettes
  | 'warehouse'             // Large industrial interior with repeating beams and perspective lines
  | 'parking_lot'           // Flat asphalt plane with painted lines, curbs, and distant structures
  | 'airport_terminal'      // Retro terminal interior with signs, windows, and repeating architecture
  | 'kitchen_wall'         // Patterned tile wall with countertop and domestic silhouettes
  | 'star_chart'            // Decorative astronomical chart with labeled constellations
  | 'weather_map'           // Abstract meteorological map with arrows, pressure lines, and symbols
  | 'legal_document'        // Oversized paper/document field with stamps, seals, and fine print
  | 'newspaper_collage'     // Layered monochrome headlines, halftones, and torn columns
  | 'technical_manual'      // Dense instructional diagrams, numbered callouts, and measurement marks
  | 'carpet_pattern'        // Repeating absurdly elaborate retro geometric carpet pattern
  | 'curtain_stage'         // Theatrical curtains framing a deliberately mundane central subject
  | 'spotlight_stage'       // Dark stage with exaggerated circular theatrical spotlight
  | 'infinite_shelf'        // Repeating shelves receding into impossible perspective
  | 'cloud_bank'            // Flat stylized clouds stacked in exaggerated horizontal layers
  | 'paper_white';          // Nearly empty paper-like field with subtle grain

export type SubjectVectorType =
  // Core Daily Drop Subjects:
  | 'none'                 // Deliberately empty subject for minimalist covers  
  | 'pants'                // Blue trousers
  | 'bed'                  // Wooden headboard with white sheets
  | 'cheese'               // Yellow wedge with negative-space holes
  | 'ear'                  // Anatomical ear profile
  | 'tooth'                // Stylized anatomical white molar with two roots
  | 'anvil'                // Heavy dark iron blacksmith anvil with horn
  | 'ufo'                  // Retro flying saucer with glass dome and thrusters
  | 'cactus'               // Green saguaro cactus with two bent arms and thorns
  | 'magnet'               // Classic horseshoe magnet with silver tips
  | 'key'                  // Antique brass skeleton key with ornate bow
  | 'anchor'               // Heavy navy iron ship anchor with ring and flukes
  | 'lightbulb'            // Glowing yellow incandescent glass bulb with screw base
  | 'skull'                // Minimalist stylized white skull with hollow eye sockets
  | 'crown'                // Golden king's crown with 3 peaks and colored jewels
  | 'bomb'                 // Round black cartoon bomb with sparking lit fuse
  | 'angry_person'         // Thick-line stick figure with hands on hips and angled eyebrows
  | 'sneaky_person'        // Tiptoeing stick figure bent forward with black bandit mask
  | 'confused_person'      // Shrugging stick figure with large procedural question mark

  // Starter crate & legacy subject vectors:
  | 'atomic_orbits'        // 2 to 4 rotating elliptical paths with orbital electron nodes
  | 'playing_cards'        // 3 fanned card rectangles with procedural suit pips
  | 'cheese_wedge'         // Alias for cheese
  | 'soup_bowl'            // Steaming bowl with surface ripples and spoon handle
  | 'clock_face'           // Analog clock with hour/minute hands and tick marks
  | 'antique_tv'           // Retro CRT television set with rabbit-ear antennas and knobs
  | 'rotary_phone'         // Vintage telephone base with circular finger dial
  | 'porcelain_fixture'    // Minimalist stylized toilet or sink with radial highlight
  | 'clothesline_pants'    // Alias for pants
  | 'classical_monolith'   // Tapered stone obelisk or trapezoid with central aperture
  | 'anatomical_part'      // Alias for ear
  | 'laboratory_flask'     // Erlenmeyer flask with bubbling liquid fill lines
  | 'bed_insomnia'         // Alias for bed
  | 'office_door'          // Paneled doorway with door knob and card sign
  | 'stack_slices'         // Translucent glossy squares with cellophane reflection lines
  | 'geometric_cube'       // Isometric wireframe cube or interlocking mosaic tiles

  // Domestic / mundane:
  | 'toaster'              // Retro two-slot toaster with chrome trim
  | 'lawnmower'            // Cartoon push lawnmower with oversized wheels
  | 'vacuum'               // Upright vacuum cleaner with long cord
  | 'recliner'             // Overstuffed reclining chair with exaggerated upholstery
  | 'lamp'                 // Generic table lamp with conical shade
  | 'telephone'             // Heavy desk telephone with coiled cord
  | 'alarm_clock'          // Small analog alarm clock with twin bells
  | 'umbrella'             // Open umbrella with curved handle and alternating panels
  | 'briefcase'            // Hard-sided briefcase with latches and handle
  | 'shopping_cart'        // Wire supermarket cart with one slightly crooked wheel
  | 'wheelbarrow'          // Single-wheel garden wheelbarrow with empty basin
  | 'mailbox'              // Suburban mailbox with raised flag
  | 'vacuum_bag'           // Detached vacuum bag presented like a mysterious specimen
  | 'doorknob'             // Brass doorknob with exaggerated circular highlight
  | 'coat_hanger'          // Wire hanger with empty garment outline
  | 'laundry_basket'       // Plastic basket overflowing with ambiguous clothing
  | 'pillow'               // Overstuffed rectangular pillow with deep fabric folds
  | 'mop'                  // Household mop with absurdly elaborate strands
  | 'bucket'               // Simple plastic bucket with heavy graphic outline

  // Food:
  | 'banana'               // Bright yellow banana with exaggerated curve
  | 'apple'                // Glossy red apple with leaf and short stem
  | 'potato'               // Irregular brown potato with a few eyes
  | 'pancake'              // Stack of pancakes with syrup and butter
  | 'waffle'                // Golden waffle with deep square grid
  | 'hotdog'               // Cartoon hotdog in a bun with mustard stripe
  | 'pizza'                 // Single triangular pizza slice with oversized toppings
  | 'burrito'               // Foil-wrapped burrito with exposed filling
  | 'pickle'               // Glossy green pickle with bumpy surface
  | 'meatball'              // Large round meatball with sauce sheen
  | 'crumpet'               // Toasted crumpet with exaggerated holes
  | 'muffin'                // Domed muffin with paper wrapper
  | 'marshmallow'           // Soft square marshmallow with toasted corner
  | 'yogurt'                // Generic yogurt container with blank label
  | 'spork'                 // Hybrid spoon-fork utensil with exaggerated tines
  | 'hummus'                // Bowl of hummus with oil swirl and pita wedge
  | 'cabbage'               // Round leafy cabbage with layered cartoon leaves
  | 'corn'                  // Ear of corn with partially peeled husk
  | 'custard'                // Bowl of smooth yellow custard with glossy surface

  // Animals:
  | 'hamster'               // Round hamster with tiny paws and exaggerated cheeks
  | 'pigeon'                // Plump city pigeon standing upright
  | 'duck'                  // Cheerful yellow duck with oversized feet
  | 'chicken'               // Cartoon chicken with compact body and tiny wings
  | 'squirrel'              // Upright squirrel clutching an unidentified object
  | 'wombat'                // Blocky cartoon wombat with tiny ears
  | 'goat'                  // Stubborn-looking goat with short horns
  | 'raccoon'               // Masked raccoon holding something suspicious
  | 'frog'                  // Round frog with oversized eyes
  | 'penguin'               // Upright penguin with flipper-like arms
  | 'flamingo'               // Tall pink flamingo with one leg raised
  | 'giraffe'               // Simplified giraffe with exaggerated neck

  // Scientific / technical:
  | 'abacus'                // Wooden counting frame with rows of colored beads
  | 'calculator'            // Chunky retro calculator with oversized buttons
  | 'microscope'            // Simplified laboratory microscope in profile
  | 'test_tube'             // Glass test tube with brightly colored liquid
  | 'antenna'               // Technical antenna array with repeating elements
  | 'gear'                  // Large industrial gear with six to twelve teeth
  | 'sprocket'              // Mechanical sprocket with central hole and teeth
  | 'thermometer'           // Glass thermometer with exaggerated red column
  | 'barometer'             // Round analog barometer with decorative markings
  | 'circuit_board'         // Simplified green circuit board with bright traces
  | 'caliper'               // Metal engineering caliper with measurement scale
  | 'compass'               // Drafting compass with pointed legs
  | 'ruler'                 // Oversized wooden ruler with measurement markings
  | 'protractor'            // Transparent semicircular drafting protractor
  | 'magnifying_glass'      // Oversized hand magnifier with circular lens

  // People / characters:
  | 'business_person'       // Tiny suited figure holding a clipboard
  | 'scientist'             // Lab-coated figure surrounded by equipment
  | 'detective'             // Cartoon detective with magnifying glass and hat
  | 'astronaut'             // Retro-suited astronaut with reflective helmet
  | 'cowboy'                // Stylized western figure with hat and boots
  | 'royalty'               // Simplified crowned figure in ceremonial clothing
  | 'judge'                 // Robed figure with oversized gavel
  | 'office_worker'         // Exhausted desk worker surrounded by paperwork
  | 'tourist'               // Figure with camera, hat, and comically large map
  | 'mail_carrier'          // Uniformed figure holding an absurdly large stack of mail

  // Surreal / symbolic:
  | 'floating_eyeball'      // Single oversized eyeball suspended in empty space
  | 'giant_hand'            // Oversized cartoon hand emerging from outside the frame
  | 'question_mark'         // Monumental dimensional question mark
  | 'exclamation_mark'      // Monumental dimensional exclamation point
  | 'asterisk'              // Large typographic asterisk treated as physical sculpture
  | 'ampersand'             // Oversized ampersand with dimensional shading
  | 'hourglass'             // Ornate hourglass with exaggerated sand flow
  | 'maze'                  // Impossible geometric maze viewed from above
  | 'spiral_staircase'      // Surreal staircase winding into itself
  | 'floating_door'         // Freestanding door suspended in empty landscape
  | 'rubber_duck'           // Oversized bath toy rendered like monumental sculpture
  | 'traffic_cone'          // Bright orange road cone with exaggerated silhouette
  | 'warning_sign'          // Generic triangular hazard sign with procedural symbol
  | 'mysterious_box'        // Closed cardboard box emitting inexplicable light
  | 'ordinary_rock'         // Completely mundane rock presented with extreme visual importance

export type GagModifierType =
  | 'hazard_triangle'       // Bold red/white road danger sign with exclamation point
  | 'adhesive_bandage'      // Cross-hatched beige adhesive strip with gauze pad
  | 'speech_bubble'         // Dynamic comic speech balloon with denial text
  | 'caution_stamp'         // Distressed diagonal rubber-stamp banner
  | 'celestial_glow'        // Radial neon halo or particle spray behind the subject
  | 'none'                  // Clean composition allowing the subject vector to dominate
  | 'rubber_stamp'          // Oversized official stamp partially overlapping the subject
  | 'redaction_bars'        // Thick black censor bars obscuring selected portions
  | 'measurement_arrows'    // Engineering dimension lines and numerical measurements
  | 'dotted_outline'        // Dashed instructional outline around the subject
  | 'target_reticle'        // Circular targeting reticle centered on the subject
  | 'evidence_tag'          // Small numbered forensic evidence marker
  | 'question_marks'        // Cluster of comic question marks surrounding the subject
  | 'exclamation_burst'     // Jagged comic burst with oversized exclamation point
  | 'motion_lines'          // Heavy directional lines implying impossible movement
  | 'impact_star'           // Classic comic-book impact shape behind the subject
  | 'sparkles'              // Decorative four-point and five-point cartoon sparkles
  | 'confetti'              // Random celebratory paper shapes and streamers
  | 'steam'                 // Exaggerated curling steam or vapor
  | 'smoke_puff'            // Cartoon smoke cloud with layered rounded lobes
  | 'electric_arcs'         // Jagged electrical bolts connecting to the subject
  | 'orbit_rings'           // Small celestial bodies and elliptical rings around the subject
  | 'halo'                  // Formal circular halo behind the subject
  | 'spotlight'             // Strong theatrical circular spotlight
  | 'torn_paper'            // Layered ripped-paper edge partially framing the subject
  | 'sticky_notes'          // Scattered colorful office notes with illegible annotations
  | 'barcode'               // Oversized barcode label attached to the subject
  | 'price_tag'             // Comically large retail price tag
  | 'official_seal'         // Circular bureaucratic seal with ornamental border
  | 'arrow_cluster'         // Multiple contradictory arrows pointing at the subject
  | 'caption_plate'         // Formal museum-style descriptive plaque
  | 'weather_arrows'        // Meteorological arrows, fronts, and pressure symbols
  | 'halftone_dots'         // Dense comic-print halftone texture behind the subject
  | 'star_field'            // Scattered stars with varied sizes and four-point flares
  | 'flames'                // Stylized cartoon flames emerging around or behind the subject
  | 'cloud_puffs'           // Decorative rounded clouds framing the subject
  | 'rays'                  // Thick geometric rays radiating outward
  | 'speed_bursts'          // Layered angular shapes implying extreme speed
  | 'tiny_crowd'            // Miniature simplified figures reacting to the subject
  | 'tiny_hazard_tape'      // Repeating caution tape wrapped around the subject
  | 'floating_labels'       // Multiple detached labels connected by thin leader lines
  | 'technical_callouts'    // Numbered engineering callouts with arrows
  | 'dramatic_vignette'     // Heavy darkening toward the corners
  | 'paper_grain'           // Visible printed-paper grain and mild registration noise
  | 'chrome_reflection'     // Sharp reflective highlight bands suggesting polished metal
  | 'gloss_highlight'       // Exaggerated commercial-product specular highlights
  | 'comic_ink'             // Heavy black contour accents and selective ink hatching
  | 'offset_print'          // Slightly misregistered secondary color layer
  | 'shadow_duplicate'      // Offset duplicate silhouette creating a strange dimensional echo
  | 'tiny_asterisks'        // Scattered typographic asterisks treated as decorative marks
  | 'legal_fine_print'      // Tiny dense disclaimer text surrounding the composition
  | 'bureaucratic_tabs'     // File-folder tabs and document labels emerging from behind
  | 'confetti_stars'        // Small colorful star-shaped celebratory marks
  | 'nothing';              // Deliberately empty modifier, distinct from a clean composition

export interface CanvasRecipe {
  archetype?: GagArchetype;
  backdrop?: BackdropType;
  subject?: SubjectVectorType;
  modifier?: GagModifierType;
  palette?: VintagePaletteName;
  titleLayout?: TitleComposition;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  focalItem?: string;
  speechText?: string;
  stampText?: string;
  subLabel?: string;
  spiralStyle?: 'archimedean' | 'sunburst' | 'square_rings' | 'concentric';
  customPhotoUrl?: string;
  vintageTexture?: 'parchment' | 'pastel' | 'grill' | 'nebula' | 'marble' | 'vortex' | 'blueprint' | 'landscape';
  seed?: number;
}

export interface AlbumMetadata {
  bandName: string;
  albumTitle: string;
  year: string;
  catalogNumber: string;
  artDirectorPrompt?: string;
  tracks: string[];
  fauxReviews: string[];
  bandBio: string;
}

export interface AlbumEntry extends AlbumMetadata {
  id: string;
  coverImageUrl: string;
  timestamp: number;
  isFavorite: boolean;
  skewDeg: number;
  stickers: HypeSticker[];
  recipe?: CanvasRecipe;
  audioPreset?: 'psych-rock' | 'analog-synth' | 'krautrock' | 'ambient-drone' | 'post-punk';
  fontFamily?: TitleFontFamily;
  textColor?: string;
  shadowStyle?: TitleShadowStyle;
  titleLayout?: TitleComposition;
}

export interface AppSettings {
  devModeUnlocked: boolean;
  lastDropTimestamp: number;
  useCustomPhotos: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  text: string;
}
