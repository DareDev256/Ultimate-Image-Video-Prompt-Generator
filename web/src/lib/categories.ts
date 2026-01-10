// Simplified category definitions for the web wizard
// Derived from the CLI's comprehensive category system

export interface WizardField {
  key: string;
  label: string;
  placeholder?: string;
  suggestions: string[];
}

export interface WizardCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  fields: WizardField[];
}

// Simplified categories for the wizard - grouped for better UX
export const wizardCategories: WizardCategory[] = [
  {
    id: 'subject',
    name: 'Subject',
    emoji: '🎯',
    description: 'Who or what is the main focus?',
    fields: [
      {
        key: 'subject.description',
        label: 'Subject Description',
        placeholder: 'Describe your main subject...',
        suggestions: [
          'Striking Black woman, early 20s, rich dark skin with golden undertones',
          'Weathered man in his 50s, salt-and-pepper beard, deep-set eyes',
          'Androgynous model with sharp cheekbones and platinum buzzcut',
          'Elderly Japanese woman with silver hair pulled back, warm smile lines',
          'Young South Asian man with curly black hair and intense gaze',
          'Freckled redhead teenager with oversized vintage glasses',
          'Muscular woman with shaved head and geometric tattoos',
          'Tall thin figure in silhouette, gender ambiguous',
        ],
      },
      {
        key: 'subject.expression',
        label: 'Expression',
        placeholder: 'How do they look?',
        suggestions: [
          'Unbothered and distant, not posing, caught mid-thought',
          'Direct challenge to camera, confrontational',
          'Soft smile, genuine warmth',
          'Thousand-yard stare, disconnected',
          'Laugh mid-burst, pure joy',
          'Pensive, deep in thought',
          'Slight smirk, knowing something',
          'Vulnerable, on verge of tears',
        ],
      },
    ],
  },
  {
    id: 'setting',
    name: 'Setting',
    emoji: '🏙️',
    description: 'Where does this take place?',
    fields: [
      {
        key: 'environment.location',
        label: 'Location',
        placeholder: 'Where is this scene?',
        suggestions: [
          'Grimy NYC subway car interior',
          'Pristine white studio',
          'Abandoned warehouse with broken windows',
          'Neon-lit Tokyo alley at night',
          'Sun-drenched California beach',
          'Rainy Paris street, cobblestones gleaming',
          'Brutalist concrete architecture',
          'Overgrown garden, wildflowers everywhere',
        ],
      },
      {
        key: 'environment.condition',
        label: 'Condition',
        placeholder: 'What state is the environment in?',
        suggestions: [
          'Dirty, heavily used, authentic grime',
          'Pristine, sterile, perfect',
          'Decayed and abandoned',
          'Lived-in but maintained',
          'Under construction, raw materials',
          'Freshly renovated, everything new',
          'Vintage, preserved from another era',
          'Weathered by elements, outdoor wear',
        ],
      },
    ],
  },
  {
    id: 'style',
    name: 'Style',
    emoji: '👗',
    description: 'Fashion and accessories',
    fields: [
      {
        key: 'clothing.main',
        label: 'Main Garment',
        placeholder: 'What are they wearing?',
        suggestions: [
          'High-gloss cherry red latex catsuit with front zipper',
          'Oversized vintage band tee',
          'Tailored black suit, impeccable fit',
          'Flowing white linen, ethereal',
          'Distressed denim jacket covered in patches',
          'Floor-length velvet gown, deep emerald',
          'Crisp white button-down, sleeves rolled',
          'Leather biker jacket, worn and cracked',
        ],
      },
      {
        key: 'clothing.accessories',
        label: 'Accessories',
        placeholder: 'Any jewelry or accessories?',
        suggestions: [
          'Chunky gold nameplate necklace, gold hoop earrings',
          'Delicate silver chain, single pendant',
          'Layered pearls, maximalist',
          'No jewelry, clean',
          'Statement earrings only, architectural',
          'Nose ring and septum piercing',
          'Multiple ear piercings, mixed metals',
          'Vintage brooch prominently placed',
        ],
      },
    ],
  },
  {
    id: 'lighting',
    name: 'Lighting',
    emoji: '💡',
    description: 'How is the scene lit?',
    fields: [
      {
        key: 'lighting.source',
        label: 'Light Source',
        placeholder: 'What creates the light?',
        suggestions: [
          'Harsh built-in camera flash, direct and unmodified',
          'Soft window light from left',
          'Overhead sun at noon',
          'Ring light creating circular catchlights',
          'Large softbox from 45 degrees',
          'Single bare strobe, hard light',
          'Golden hour sun from behind',
          'Neon signs providing colored light',
        ],
      },
      {
        key: 'lighting.mood',
        label: 'Light Quality',
        placeholder: 'How does it feel?',
        suggestions: [
          'Harsh contrast, deep shadows',
          'Soft gradual falloff',
          'Flat and even, shadowless',
          'Dramatic chiaroscuro',
          'Rim light outlining figure',
          'Diffused, wrapping around face',
          'Dappled, broken up by elements',
          'Mixed quality, hard and soft sources',
        ],
      },
    ],
  },
  {
    id: 'camera',
    name: 'Camera',
    emoji: '📷',
    description: 'Technical camera settings',
    fields: [
      {
        key: 'camera.position',
        label: 'Camera Position',
        placeholder: 'Where is the camera?',
        suggestions: [
          'Eye level, straight on',
          'Low angle from ground looking up',
          'Overhead bird\'s eye looking down',
          'Over-the-shoulder from behind',
          'Extreme close-up, inches from face',
          'Wide establishing shot from across the room',
          'Waist height shooting upward',
          'Through doorway or window frame',
        ],
      },
      {
        key: 'camera.lens',
        label: 'Lens',
        placeholder: 'What lens feel?',
        suggestions: [
          '24mm wide',
          '35mm documentary',
          '50mm standard',
          '85mm portrait',
          '135mm telephoto',
          '200mm compressed',
          'Fisheye distorted',
          'Macro extreme detail',
        ],
      },
    ],
  },
  {
    id: 'mood',
    name: 'Mood',
    emoji: '🌫️',
    description: 'Atmosphere and feeling',
    fields: [
      {
        key: 'atmosphere.mood',
        label: 'Overall Mood',
        placeholder: 'What feeling should this evoke?',
        suggestions: [
          'Tension and urban alienation',
          'Serene calm',
          'Chaotic energy',
          'Melancholic longing',
          'Joyful exuberance',
          'Mysterious and secretive',
          'Romantic and dreamy',
          'Anxious anticipation',
        ],
      },
      {
        key: 'atmosphere.elements',
        label: 'Atmospheric Elements',
        placeholder: 'Any special atmosphere?',
        suggestions: [
          'Motion blur, heat haze',
          'Fog rolling through',
          'Dust particles visible in light beams',
          'Rain drops on lens',
          'Cigarette smoke curling',
          'Steam from vents or breath',
          'Snow falling gently',
          'Nothing, crystal clear air',
        ],
      },
    ],
  },
  {
    id: 'color',
    name: 'Color',
    emoji: '🎨',
    description: 'Color treatment and grade',
    fields: [
      {
        key: 'color.grade',
        label: 'Color Grade',
        placeholder: 'Overall color treatment',
        suggestions: [
          'Flash-blown with green-yellow fluorescent falloff',
          'Warm orange and teal blockbuster',
          'Desaturated, almost monochrome',
          'Vibrant and oversaturated',
          'Film emulation, Kodak Portra warm',
          'Cool blue undertones throughout',
          'Cross-processed, unnatural colors',
          'Black and white with high contrast',
        ],
      },
      {
        key: 'color.skin',
        label: 'Skin Tone',
        placeholder: 'How are skin tones rendered?',
        suggestions: [
          'Rich deep brown with golden warmth',
          'Pale and porcelain',
          'Warm and healthy',
          'Stylized, non-natural',
          'Cold and desaturated',
          'Bronze and sun-kissed',
          'True to life, accurate',
          'Orange tan, fashion editorial style',
        ],
      },
    ],
  },
  {
    id: 'film',
    name: 'Film Look',
    emoji: '🎞️',
    description: 'Film texture and artifacts',
    fields: [
      {
        key: 'film.grain',
        label: 'Film Grain',
        placeholder: 'Any grain or noise?',
        suggestions: [
          'Visible high ISO grain from low-light',
          'Fine grain, subtle texture',
          'Heavy grain, degraded look',
          'Clean digital, no grain',
          'Kodak Tri-X chunky grain',
          'Smooth medium format grain',
          'Pushed film, intense grain',
          'Color film grain, multi-colored specks',
        ],
      },
      {
        key: 'film.format',
        label: 'Format Feel',
        placeholder: 'What format?',
        suggestions: [
          '4:3 native compact camera ratio',
          '3:2 full frame',
          '16:9 cinematic',
          '1:1 square medium format',
          '35mm film frame with sprockets',
          'Instant film with white border',
          '2.35:1 anamorphic widescreen',
          'Vintage polaroid edges',
        ],
      },
    ],
  },
  {
    id: 'vibes',
    name: 'Vibes',
    emoji: '✨',
    description: 'Reference and inspiration',
    fields: [
      {
        key: 'vibes.reference',
        label: 'Reference Artists/Style',
        placeholder: 'What should this feel like?',
        suggestions: [
          'Juergen Teller fashion-meets-mundane',
          'Bruce Davidson subway documentation',
          'Helmut Newton powerful women',
          'Nan Goldin intimate snapshot',
          'Terry Richardson flash aesthetic',
          'Wolfgang Tillmans casual beauty',
          'Viviane Sassen bold colors and shadows',
          'Gregory Crewdson cinematic tableau',
        ],
      },
      {
        key: 'vibes.description',
        label: 'Overall Description',
        placeholder: 'Describe what this IS...',
        suggestions: [
          'Single striking subject, candid flash, no posing, no studio',
          'Intimate portrait, direct connection, quiet moment',
          'Chaotic street scene, multiple subjects, decisive moment',
          'Fashion editorial with attitude and edge',
          'Documentary realism, unstaged authenticity',
          'Dreamlike surrealism, impossible beauty',
          'Vintage nostalgia, timeless quality',
          'Modern minimalism, negative space',
        ],
      },
    ],
  },
];

// Video-specific categories for Kling
export const videoCategories: WizardCategory[] = [
  ...wizardCategories.slice(0, 6), // Subject, Setting, Style, Lighting, Camera, Mood
  {
    id: 'motion',
    name: 'Motion',
    emoji: '🎬',
    description: 'How things move',
    fields: [
      {
        key: 'motion.camera',
        label: 'Camera Movement',
        placeholder: 'How does the camera move?',
        suggestions: [
          'Static, locked off',
          'Slow push in toward subject',
          'Pull back to reveal scene',
          'Orbit around subject',
          'Tracking shot following movement',
          'Handheld, subtle shake',
          'Drone rise and reveal',
          'Pan left to right',
        ],
      },
      {
        key: 'motion.subject',
        label: 'Subject Movement',
        placeholder: 'What does the subject do?',
        suggestions: [
          'Standing still, subtle breathing',
          'Walking toward camera',
          'Turning to face camera',
          'Hair blowing in wind',
          'Dancing, free movement',
          'Running in slow motion',
          'Gesture, raising hand',
          'Subtle head turn, looking away',
        ],
      },
    ],
  },
  {
    id: 'duration',
    name: 'Duration',
    emoji: '⏱️',
    description: 'Video length and pacing',
    fields: [
      {
        key: 'duration.length',
        label: 'Video Length',
        placeholder: 'How long?',
        suggestions: ['5 seconds', '10 seconds'],
      },
      {
        key: 'duration.pacing',
        label: 'Pacing',
        placeholder: 'Speed and rhythm',
        suggestions: [
          'Real-time, natural speed',
          'Slow motion, 50%',
          'Very slow motion, 25%',
          'Time-lapse, sped up',
          'Variable speed, ramping',
          'Frozen moment with subtle movement',
        ],
      },
    ],
  },
];

// Get categories based on model type
export function getCategoriesForModel(modelType: 'image' | 'video'): WizardCategory[] {
  return modelType === 'video' ? videoCategories : wizardCategories;
}
