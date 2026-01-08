export interface FieldDefinition {
  key: string;
  label: string;
  placeholder?: string;
  suggestions?: string[];
}

export interface CategoryDefinition {
  name: string;
  emoji: string;
  fields: FieldDefinition[];
  subCategories?: CategoryDefinition[];
}

// Core category (always asked)
export const coreCategory: CategoryDefinition = {
  name: 'core',
  emoji: '🎯',
  fields: [
    {
      key: 'prompt_type',
      label: 'Prompt Type',
      placeholder: 'generate',
      suggestions: ['generate', 'edit']
    },
    {
      key: 'subject.description',
      label: 'Subject Description',
      placeholder: 'A striking person in an urban environment',
      suggestions: [
        'striking Black woman, early 20s, rich dark skin with golden undertones',
        'weathered man in his 50s, salt-and-pepper beard, deep-set eyes',
        'androgynous model with sharp cheekbones and platinum buzzcut',
        'elderly Japanese woman with silver hair pulled back, warm smile lines',
        'young South Asian man with curly black hair and intense gaze',
        'freckled redhead teenager with oversized vintage glasses',
        'muscular woman with shaved head and geometric tattoos',
        'tall thin figure in silhouette, gender ambiguous'
      ]
    }
  ]
};

// Camera category
export const cameraCategory: CategoryDefinition = {
  name: 'camera',
  emoji: '📷',
  fields: [
    {
      key: 'scene.camera.position',
      label: 'Camera Position',
      placeholder: 'eye level, centered',
      suggestions: [
        'waist height shooting upward through gap between bodies',
        'eye level, straight on',
        'overhead bird\'s eye looking down',
        'low angle from ground looking up',
        'over-the-shoulder from behind secondary subject',
        'extreme close-up, inches from face',
        'wide establishing shot from across the room',
        'through doorway or window frame'
      ]
    },
    {
      key: 'scene.camera.direction',
      label: 'Camera Direction',
      placeholder: 'straight on',
      suggestions: [
        'three-quarter low angle, camera tilted',
        'frontal, dead center',
        'profile, 90 degrees to subject',
        'three-quarter from left',
        'three-quarter from right',
        'from behind, looking over shoulder',
        'diagonal, creating dynamic tension'
      ]
    },
    {
      key: 'scene.camera.lens_mm',
      label: 'Lens (mm)',
      placeholder: '50mm',
      suggestions: [
        '24mm wide',
        '28mm street',
        '35mm documentary',
        '50mm standard',
        '85mm portrait',
        '135mm telephoto',
        '200mm compressed'
      ]
    },
    {
      key: 'scene.camera.aperture',
      label: 'Aperture',
      placeholder: 'f/2.8',
      suggestions: [
        'f/1.4 (very shallow, dreamy)',
        'f/1.8 (shallow, subject isolation)',
        'f/2.8 (shallow, versatile)',
        'f/4.0 (moderate depth)',
        'f/5.6 (balanced)',
        'f/8.0 (deep, sharp)',
        'f/11 (very deep)',
        'f/16 (everything sharp)'
      ]
    },
    {
      key: 'scene.camera.angle',
      label: 'Camera Angle Style',
      placeholder: 'natural handheld',
      suggestions: [
        'low voyeur through crowd, slight dutch tilt',
        'stable tripod, perfectly level',
        'dutch tilt 15 degrees',
        'canted angle suggesting unease',
        'handheld shake, authentic movement',
        'locked off, static and composed',
        'slight upward angle, empowering subject'
      ]
    },
    {
      key: 'scene.camera.psychological_intent',
      label: 'Psychological Intent',
      placeholder: 'neutral observation',
      suggestions: [
        'photographer hiding in crowd, stolen image energy',
        'intimate closeness, subject trusts photographer',
        'surveillance, clinical detachment',
        'voyeuristic, forbidden capture',
        'collaborative, subject aware and participating',
        'confrontational, challenging the viewer',
        'documentary witness, fly on the wall',
        'romantic gaze, adoring the subject'
      ]
    },
    {
      key: 'scene.camera.lens_characteristics',
      label: 'Lens Characteristics',
      placeholder: 'clean modern glass',
      suggestions: [
        'compact camera softness, chromatic aberration at edges',
        'vintage lens flare and warm rendering',
        'clinical sharpness, no character',
        'anamorphic horizontal flare',
        'soft focus, Vaseline on lens feeling',
        'petzval swirly bokeh',
        'Leica crisp but warm',
        'medium format shallow plane'
      ]
    }
  ]
};

// Subject detail category
export const subjectDetailCategory: CategoryDefinition = {
  name: 'subject-detail',
  emoji: '👤',
  fields: [
    {
      key: 'subject.hair.style',
      label: 'Hair Style',
      placeholder: 'natural',
      suggestions: [
        'elaborate sculptural loc braids in gravity-defying formation',
        'slicked back, wet look',
        'wild and untamed, wind-blown',
        'shaved sides with long top',
        'tight curls, natural texture',
        'pin-straight, glass-like shine',
        'messy bedhead, intentionally undone',
        'elaborate updo with loose strands',
        'box braids past shoulders',
        'silver gray, dignified'
      ]
    },
    {
      key: 'subject.hair.structure',
      label: 'Hair Structure',
      placeholder: 'loose',
      suggestions: [
        'six thick rope braids radiating outward from skull',
        'tight curls close to scalp',
        'pin-straight sheets',
        'voluminous waves',
        'textured and layered',
        'cropped close, uniform length',
        'asymmetrical, longer on one side',
        'natural afro, picked out'
      ]
    },
    {
      key: 'subject.face.makeup',
      label: 'Makeup',
      placeholder: 'natural',
      suggestions: [
        'glitter pigment scattered across eyelids and cheekbones',
        'bold graphic eyeliner',
        'no makeup, raw skin',
        'smudged dark eye makeup, lived-in look',
        'perfect red lip, nothing else',
        'editorial high-fashion, sculptural contour',
        'natural glow, dewy skin',
        'vintage Hollywood glamour',
        'punk smeared mascara',
        'avant-garde face paint'
      ]
    },
    {
      key: 'subject.face.expression',
      label: 'Expression',
      placeholder: 'neutral',
      suggestions: [
        'unbothered and distant, not posing, caught mid-thought',
        'direct challenge to camera, confrontational',
        'soft smile, genuine warmth',
        'thousand-yard stare, disconnected',
        'laugh mid-burst, pure joy',
        'pensive, deep in thought',
        'slight smirk, knowing something',
        'vulnerable, on verge of tears',
        'fierce determination',
        'serene calm, meditative'
      ]
    },
    {
      key: 'subject.action',
      label: 'Action',
      placeholder: 'standing',
      suggestions: [
        'standing gripping overhead rail with chrome-gloved hand',
        'walking toward camera mid-stride',
        'seated, leaning forward',
        'frozen mid-gesture',
        'turning to look over shoulder',
        'running, hair flying',
        'dancing, arms overhead',
        'smoking, exhaling upward',
        'reading, absorbed in book',
        'adjusting clothing or hair'
      ]
    },
    {
      key: 'subject.body_position',
      label: 'Body Position',
      placeholder: 'standing straight',
      suggestions: [
        'standing, weight on one leg, body slightly twisted, arm raised',
        'slouched against wall',
        'powerful wide stance',
        'curled into self, protective',
        'sprawled casually across furniture',
        'rigid and formal, military posture',
        'crouching, compact and coiled',
        'lying down, looking up at camera',
        'leaning into frame from edge'
      ]
    },
    {
      key: 'subject.movement',
      label: 'Movement',
      placeholder: 'still',
      suggestions: [
        'frozen by flash mid-natural-moment',
        'motion blur on limbs suggesting movement',
        'perfectly still, posed',
        'caught between movements',
        'subtle sway, barely perceptible',
        'sharp gesture frozen in time',
        'walking blur, ghost trail',
        'spinning, circular motion blur'
      ]
    }
  ]
};

// Fashion category
export const fashionCategory: CategoryDefinition = {
  name: 'fashion',
  emoji: '👗',
  fields: [
    {
      key: 'subject.clothing.main_garment',
      label: 'Main Garment',
      placeholder: 'casual clothing',
      suggestions: [
        'high-gloss cherry red latex catsuit with front zipper',
        'oversized vintage band tee',
        'tailored black suit, impeccable fit',
        'flowing white linen, ethereal',
        'distressed denim jacket covered in patches',
        'floor-length velvet gown, deep emerald',
        'crisp white button-down, sleeves rolled',
        'leather biker jacket, worn and cracked',
        'sheer mesh top over bralette',
        'traditional Japanese kimono, modern styling'
      ]
    },
    {
      key: 'subject.clothing.structure',
      label: 'Clothing Structure',
      placeholder: 'relaxed fit',
      suggestions: [
        'structured shoulder points extending past natural shoulder line',
        'draped and flowing, no structure',
        'skin-tight, revealing form',
        'architectural, geometric shapes',
        'oversized and boxy',
        'tailored and fitted precisely',
        'deconstructed, seams exposed',
        'layered and complex',
        'minimal and streamlined'
      ]
    },
    {
      key: 'subject.clothing.hardware',
      label: 'Hardware/Details',
      placeholder: 'none',
      suggestions: [
        'chrome silver D-rings at hips, buckle straps down thighs',
        'gold zippers and buttons',
        'punk safety pins throughout',
        'minimal, no hardware',
        'heavy industrial chains',
        'delicate pearl buttons',
        'oversized belt buckle, western style',
        'military brass buttons',
        'bondage straps and O-rings'
      ]
    },
    {
      key: 'subject.clothing.finish',
      label: 'Material Finish',
      placeholder: 'matte cotton',
      suggestions: [
        'high-gloss reflective latex catching flash',
        'matte cotton, absorbs light',
        'satin sheen, subtle reflection',
        'distressed denim texture',
        'crushed velvet, light-absorbing',
        'patent leather, mirror-like',
        'raw silk, textured surface',
        'sequined, reflecting multiple colors',
        'weathered leather, aged patina'
      ]
    },
    {
      key: 'subject.accessories.hands',
      label: 'Hand Accessories',
      placeholder: 'none',
      suggestions: [
        'chrome skeletal-finger gloves',
        'chunky silver rings on every finger',
        'black leather driving gloves',
        'bare hands, visible veins',
        'fingerless wool gloves',
        'elegant satin opera gloves',
        'bandaged and wrapped',
        'painted nails, long and pointed'
      ]
    },
    {
      key: 'subject.accessories.jewelry',
      label: 'Jewelry',
      placeholder: 'none',
      suggestions: [
        'chunky gold nameplate necklace, gold hoop earrings',
        'delicate silver chain, single pendant',
        'layered pearls, maximalist',
        'no jewelry, clean',
        'statement earrings only, architectural',
        'nose ring and septum piercing',
        'multiple ear piercings, mixed metals',
        'vintage brooch prominently placed',
        'choker collar, thick leather'
      ]
    },
    {
      key: 'subject.accessories.footwear',
      label: 'Footwear',
      placeholder: 'appropriate shoes',
      suggestions: [
        'red patent leather platform boots',
        'worn white sneakers, dirty',
        'stiletto heels, impossible height',
        'barefoot',
        'chunky combat boots, steel toe',
        'elegant pointed-toe pumps',
        'vintage cowboy boots',
        'athletic sneakers, brand new',
        'sandals revealing painted toes',
        'loafers, no socks'
      ]
    }
  ]
};

// Environment category
export const environmentCategory: CategoryDefinition = {
  name: 'environment',
  emoji: '🏙️',
  fields: [
    {
      key: 'environment.location',
      label: 'Location',
      placeholder: 'urban setting',
      suggestions: [
        'grimy NYC subway car interior',
        'pristine white studio',
        'abandoned warehouse with broken windows',
        'neon-lit Tokyo alley at night',
        'sun-drenched California beach',
        'rainy Paris street, cobblestones gleaming',
        'brutalist concrete architecture',
        'overgrown garden, wildflowers everywhere',
        'sleek modern office building lobby',
        'dive bar interior, sticky floors, neon signs'
      ]
    },
    {
      key: 'environment.surfaces',
      label: 'Surfaces',
      placeholder: 'neutral',
      suggestions: [
        'scratched plexiglass, grime on metal, fingerprints on poles',
        'seamless white paper backdrop',
        'crumbling brick and peeling paint',
        'wet asphalt reflecting lights',
        'polished marble floors',
        'rough concrete, industrial',
        'worn wooden floorboards',
        'graffiti-covered walls',
        'mirrors creating infinite reflections'
      ]
    },
    {
      key: 'environment.lighting_fixtures',
      label: 'Lighting Fixtures',
      placeholder: 'natural',
      suggestions: [
        'overhead fluorescent tubes with sickly green-yellow cast',
        'professional softboxes',
        'single bare bulb swinging',
        'neon signs in multiple colors',
        'string lights creating bokeh',
        'industrial work lights',
        'chandeliers, crystal and ornate',
        'natural window light only',
        'LED strip lighting, color changing'
      ]
    },
    {
      key: 'environment.condition',
      label: 'Condition',
      placeholder: 'normal',
      suggestions: [
        'dirty, heavily used, authentic grime',
        'pristine, sterile, perfect',
        'decayed and abandoned',
        'lived-in but maintained',
        'under construction, raw materials',
        'freshly renovated, everything new',
        'vintage, preserved from another era',
        'weathered by elements, outdoor wear'
      ]
    }
  ]
};

// Crowd category
export const crowdCategory: CategoryDefinition = {
  name: 'crowd',
  emoji: '👥',
  fields: [
    {
      key: 'crowd_elements.description',
      label: 'Crowd Description',
      placeholder: 'empty, no crowd',
      suggestions: [
        'anonymous commuter body fragments at frame edges, none facing camera',
        'blurred party crowd in background',
        'single other figure in distance',
        'packed bodies pressing in from all sides',
        'sparse pedestrians, plenty of negative space',
        'uniform crowd, all similar appearance',
        'diverse group of people, various ages and styles',
        'silhouettes of people against bright background'
      ]
    },
    {
      key: 'crowd_elements.foreground_mass',
      label: 'Foreground Elements',
      placeholder: 'clear foreground',
      suggestions: [
        'businessman shoulder in charcoal suit creating dark shape',
        'out-of-focus hand holding phone',
        'sleeve of coat cutting into frame',
        'back of head with headphones',
        'umbrella partially blocking view',
        'shoulder and arm from someone passing',
        'plants or foliage framing shot',
        'nothing, clean empty foreground'
      ]
    },
    {
      key: 'crowd_elements.behavior',
      label: 'Crowd Behavior',
      placeholder: 'static',
      suggestions: [
        'motion blur on background passengers, flash freezing subject sharp',
        'frozen mid-movement',
        'looking toward subject',
        'completely oblivious, in their own worlds',
        'parting around subject, creating space',
        'rushing past in blur',
        'static, waiting',
        'engaged in conversation with each other'
      ]
    }
  ]
};

// Lighting category
export const lightingCategory: CategoryDefinition = {
  name: 'lighting',
  emoji: '💡',
  fields: [
    {
      key: 'lighting.primary_source',
      label: 'Primary Light Source',
      placeholder: 'natural light',
      suggestions: [
        'harsh built-in camera flash, direct and unmodified',
        'soft window light from left',
        'overhead sun at noon',
        'ring light creating circular catchlights',
        'large softbox from 45 degrees',
        'single bare strobe, hard light',
        'golden hour sun from behind',
        'overcast sky, even and soft',
        'practical lamp in frame',
        'neon signs providing colored light'
      ]
    },
    {
      key: 'lighting.primary_effect',
      label: 'Primary Light Effect',
      placeholder: 'even illumination',
      suggestions: [
        'blown highlights on latex and chrome, hard shadows behind subject',
        'soft gradual falloff',
        'harsh contrast, deep shadows',
        'flat and even, shadowless',
        'dramatic chiaroscuro',
        'rim light outlining figure',
        'specular highlights on skin',
        'diffused, wrapping around face'
      ]
    },
    {
      key: 'lighting.secondary_source',
      label: 'Secondary Light',
      placeholder: 'none',
      suggestions: [
        'overhead fluorescent tubes',
        'fill card bouncing main light',
        'practical lamps in scene',
        'neon signs providing color',
        'window providing backlight',
        'reflected light from surfaces',
        'hair light from above and behind',
        'nothing, single source only'
      ]
    },
    {
      key: 'lighting.ambient',
      label: 'Ambient Light',
      placeholder: 'neutral',
      suggestions: [
        'underground murk, zero natural light',
        'bright daylight fill',
        'dim, moody, barely visible',
        'golden hour warmth everywhere',
        'blue hour cool tones',
        'mixed artificial sources',
        'candlelit warmth',
        'harsh overhead institutional'
      ]
    },
    {
      key: 'lighting.direction',
      label: 'Light Direction',
      placeholder: 'frontal',
      suggestions: [
        'frontal flash from camera position',
        'side light from 90 degrees',
        'backlit, subject silhouetted',
        'overhead, dramatic shadows under features',
        'Rembrandt, 45 degrees and above',
        'underlighting, horror movie style',
        'broad lighting, illuminating facing side',
        'short lighting, shadow side toward camera'
      ]
    },
    {
      key: 'lighting.quality',
      label: 'Light Quality',
      placeholder: 'soft',
      suggestions: [
        'harsh direct flash, unflattering but authentic',
        'beautifully soft and diffused',
        'mixed quality, hard and soft sources',
        'dappled, broken up by elements',
        'specular and punchy',
        'matte and even',
        'natural and unmodified',
        'heavily diffused, shadowless'
      ]
    }
  ]
};

// Atmosphere category
export const atmosphereCategory: CategoryDefinition = {
  name: 'atmosphere',
  emoji: '🌫️',
  fields: [
    {
      key: 'atmosphere.elements',
      label: 'Atmospheric Elements',
      placeholder: 'clear',
      suggestions: [
        'motion blur on background, condensation and body heat haze',
        'fog rolling through',
        'dust particles visible in light beams',
        'rain drops on lens',
        'cigarette smoke curling',
        'steam from vents or breath',
        'snow falling gently',
        'pollen or seeds floating',
        'nothing, crystal clear air'
      ]
    },
    {
      key: 'atmosphere.air_quality',
      label: 'Air Quality',
      placeholder: 'clear',
      suggestions: [
        'humid, packed, underground staleness',
        'crisp and clean',
        'smoky, hazy',
        'thick with moisture',
        'dusty and dry',
        'salty sea air',
        'industrial, slightly polluted',
        'fresh after rain'
      ]
    },
    {
      key: 'atmosphere.mood',
      label: 'Mood',
      placeholder: 'neutral',
      suggestions: [
        'tension and urban alienation',
        'serene calm',
        'chaotic energy',
        'melancholic longing',
        'joyful exuberance',
        'mysterious and secretive',
        'romantic and dreamy',
        'anxious anticipation',
        'peaceful solitude',
        'vibrant celebration'
      ]
    }
  ]
};

// Composition category
export const compositionCategory: CategoryDefinition = {
  name: 'composition',
  emoji: '🖼️',
  fields: [
    {
      key: 'composition.foreground',
      label: 'Foreground',
      placeholder: 'clear',
      suggestions: [
        'out-of-focus commuter body parts framing shot',
        'leading lines drawing to subject',
        'nothing, clean foreground',
        'debris and texture',
        'plants or flowers out of focus',
        'glass or window creating reflection',
        'hands or objects near camera',
        'water droplets on foreground surface'
      ]
    },
    {
      key: 'composition.midground',
      label: 'Midground',
      placeholder: 'subject centered',
      suggestions: [
        'subject standing sharp, frozen by flash',
        'subject off-center using rule of thirds',
        'multiple subjects at same depth',
        'subject partially obscured',
        'subject small in frame, environment dominant',
        'tight crop, subject fills frame',
        'subject interacting with environment',
        'subject in motion across frame'
      ]
    },
    {
      key: 'composition.background',
      label: 'Background',
      placeholder: 'neutral backdrop',
      suggestions: [
        'packed subway car, passengers, scratched windows, tunnel darkness',
        'completely blown out white',
        'bokeh blur of city lights',
        'detailed environment in focus',
        'solid color wall',
        'complex urban scene',
        'natural landscape',
        'abstract shapes and colors',
        'mirrors creating depth'
      ]
    },
    {
      key: 'composition.depth_layers',
      label: 'Depth Layers',
      placeholder: 'flat',
      suggestions: [
        'commuter fragments soft, subject sharp, crowd with motion drag, tunnel void',
        'single plane, everything same focus',
        'gradual blur front to back',
        'sharp throughout, deep focus',
        'three distinct planes, all sharp',
        'background blur isolates subject',
        'foreground blur adds depth',
        'tilt-shift miniature effect'
      ]
    },
    {
      key: 'composition.framing_notes',
      label: 'Framing Notes',
      placeholder: 'standard framing',
      suggestions: [
        'shot through gap in crowd, bodies intruding from edges',
        'perfectly clean frame, nothing cut off',
        'tight crop, claustrophobic',
        'lots of negative space around subject',
        'frame within frame, doorway or window',
        'asymmetrical, heavy on one side',
        'centered and symmetrical',
        'subject at edge of frame, looking into space'
      ]
    }
  ]
};

// Color category
export const colorCategory: CategoryDefinition = {
  name: 'color',
  emoji: '🎨',
  fields: [
    {
      key: 'color.grade',
      label: 'Color Grade',
      placeholder: 'natural',
      suggestions: [
        'flash-blown center with sickly green-yellow fluorescent falloff',
        'warm orange and teal blockbuster',
        'desaturated, almost monochrome',
        'vibrant and oversaturated',
        'film emulation, Kodak Portra warm',
        'cool blue undertones throughout',
        'split toning, warm highlights cool shadows',
        'cross-processed, unnatural colors',
        'black and white with high contrast'
      ]
    },
    {
      key: 'color.highlights',
      label: 'Highlights Treatment',
      placeholder: 'preserved',
      suggestions: [
        'nuclear white flash bounce, blown and harsh',
        'soft and preserved, no clipping',
        'warm, creamy highlights',
        'cool blue in highlights',
        'tinged with color from environment',
        'slightly crushed, vintage feel',
        'bright but detailed',
        'deliberately overexposed'
      ]
    },
    {
      key: 'color.skin_tone',
      label: 'Skin Tone Treatment',
      placeholder: 'natural',
      suggestions: [
        'rich deep brown with golden warmth, slight shine on forehead',
        'pale and porcelain',
        'warm and healthy',
        'stylized, non-natural',
        'cold and desaturated',
        'bronze and sun-kissed',
        'true to life, accurate',
        'orange tan, fashion editorial style'
      ]
    },
    {
      key: 'color.blacks',
      label: 'Blacks Treatment',
      placeholder: 'natural blacks',
      suggestions: [
        'crushed in shadows, lifted in lit areas revealing grime',
        'deep true blacks',
        'lifted and milky',
        'tinted with color',
        'faded, never reaching true black',
        'rich and inky',
        'slightly purple in shadows',
        'green-tinged, vintage film style'
      ]
    }
  ]
};

// Film texture category
export const filmCategory: CategoryDefinition = {
  name: 'film',
  emoji: '🎞️',
  fields: [
    {
      key: 'film_texture.grain',
      label: 'Film Grain',
      placeholder: 'none',
      suggestions: [
        'visible high ISO grain from low-light conditions',
        'fine grain, subtle texture',
        'heavy grain, degraded look',
        'clean digital, no grain',
        'Kodak Tri-X chunky grain',
        'smooth medium format grain',
        'pushed film, intense grain in shadows',
        'color film grain, multi-colored specks'
      ]
    },
    {
      key: 'film_texture.flash_artifacts',
      label: 'Flash/Light Artifacts',
      placeholder: 'none',
      suggestions: [
        'hotspot in center, falloff toward edges, red-eye on background',
        'subtle lens flare',
        'no artifacts, clean',
        'heavy flare and ghosting',
        'rainbow lens artifacts',
        'red-eye visible on subjects',
        'flash shadow on wall behind',
        'anamorphic horizontal streak'
      ]
    },
    {
      key: 'film_texture.lens_quality',
      label: 'Lens Quality Feel',
      placeholder: 'sharp modern',
      suggestions: [
        'point-and-shoot softness, chromatic aberration at edges',
        'tack sharp, clinical',
        'vintage soft glow',
        'intentionally degraded',
        'corner vignetting and softness',
        'razor sharp center, soft edges',
        'holga plastic lens distortion',
        'medium format incredible detail'
      ]
    },
    {
      key: 'film_texture.date_stamp',
      label: 'Date Stamp',
      placeholder: 'none',
      suggestions: [
        '01.06.26 burned into lower right corner in orange digital text',
        'none',
        'vintage 90s style red numbers',
        'subtle watermark',
        '\'98 style yellow digits',
        'film frame edge markings',
        'EXIF data overlay',
        'handwritten date in corner'
      ]
    },
    {
      key: 'film_texture.format',
      label: 'Format Feel',
      placeholder: 'digital',
      suggestions: [
        '4:3 native compact camera ratio',
        '3:2 full frame',
        '16:9 cinematic',
        '1:1 square medium format',
        '6x7 medium format portrait',
        '35mm film frame with sprockets',
        'instant film with white border',
        '2.35:1 anamorphic widescreen'
      ]
    }
  ]
};

// Technical category
export const technicalCategory: CategoryDefinition = {
  name: 'technical',
  emoji: '⚙️',
  fields: [
    {
      key: 'technical.aspect_ratio',
      label: 'Aspect Ratio',
      placeholder: '16:9',
      suggestions: [
        '4:3 horizontal',
        '3:2',
        '16:9',
        '1:1 square',
        '9:16 vertical',
        '2.35:1 cinemascope',
        '4:5 instagram portrait',
        '5:4 large format'
      ]
    },
    {
      key: 'technical.realism_note',
      label: 'Realism Style',
      placeholder: 'photorealistic',
      suggestions: [
        'NOT editorial, NOT posed — candid flash capture, point-and-shoot aesthetic',
        'high fashion editorial, perfectly lit',
        'documentary authenticity',
        'hyperreal, enhanced beyond reality',
        'dreamy and soft, romanticized',
        'gritty and raw, unpolished',
        'cinematic still frame',
        'magazine cover perfection'
      ]
    }
  ]
};

// Vibes and negatives (always in core but special handling)
export const vibesCategory: CategoryDefinition = {
  name: 'vibes',
  emoji: '✨',
  fields: [
    {
      key: 'vibes',
      label: 'Vibes / Reference Artists',
      placeholder: 'modern photography',
      suggestions: [
        'Juergen Teller fashion-meets-mundane',
        'Bruce Davidson subway documentation',
        'Thierry Mugler on the L train',
        'Harmony Korine grime aesthetic',
        'Helmut Newton powerful women',
        'Nan Goldin intimate snapshot',
        'Terry Richardson flash aesthetic',
        'Wolfgang Tillmans casual beauty',
        'Viviane Sassen bold colors and shadows',
        'Gregory Crewdson cinematic tableau',
        'William Eggleston color everyday',
        'Cindy Sherman conceptual self-portraits',
        'Richard Avedon stark portraiture',
        'Irving Penn elegant simplicity',
        'Guy Bourdin surreal fashion',
        'Peter Lindbergh black and white beauty'
      ]
    },
    {
      key: 'semantic_negatives',
      label: 'Semantic Description (What This IS)',
      placeholder: 'describe the essence',
      suggestions: [
        'single striking subject in crowded subway, candid flash through crowd, no eye contact, no posing, no studio',
        'intimate portrait, direct connection, quiet moment',
        'chaotic street scene, multiple subjects, decisive moment',
        'fashion editorial with attitude and edge',
        'documentary realism, unstaged authenticity',
        'dreamlike surrealism, impossible beauty',
        'vintage nostalgia, timeless quality',
        'modern minimalism, negative space'
      ]
    }
  ]
};

// All categories in order
export const allCategories: CategoryDefinition[] = [
  coreCategory,
  cameraCategory,
  subjectDetailCategory,
  fashionCategory,
  environmentCategory,
  crowdCategory,
  lightingCategory,
  atmosphereCategory,
  compositionCategory,
  colorCategory,
  filmCategory,
  technicalCategory,
  vibesCategory
];

// Map for lookup
export const categoryMap = new Map<string, CategoryDefinition>(
  allCategories.map(cat => [cat.name, cat])
);
