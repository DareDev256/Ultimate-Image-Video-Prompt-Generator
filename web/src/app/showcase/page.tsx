'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft,
  X,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown,
  Wand2,
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';

interface ShowcaseItem {
  id: string;
  name: string;
  image: string;
  style: string;
  description: string;
  prompt?: {
    subject: { description: string; expression: string };
    environment: { location: string; condition: string };
    clothing: { main: string; accessories: string };
    lighting: { source: string; mood: string };
    camera: { position: string; lens: string };
    atmosphere: { mood: string; elements: string };
    color: { grade: string; skin: string };
    film: { grain: string; format: string };
    vibes: { reference: string; description: string };
  };
  rawPrompt?: string;
  model?: string;
  source?: { name: string; url: string };
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: '01',
    name: 'Neon Noir',
    image: '/showcase/01-neon-noir.png',
    style: 'Fashion Editorial',
    description: 'Striking portrait with cyberpunk Tokyo vibes',
    prompt: {
      subject: { description: 'Striking Black woman, early 20s, rich dark skin with golden undertones', expression: 'Direct challenge to camera, confrontational' },
      environment: { location: 'Neon-lit Tokyo alley at night', condition: 'Weathered by elements, outdoor wear' },
      clothing: { main: 'High-gloss cherry red latex catsuit with front zipper', accessories: 'Chunky gold nameplate necklace, gold hoop earrings' },
      lighting: { source: 'Neon signs providing colored light', mood: 'Harsh contrast, deep shadows' },
      camera: { position: 'Eye level, straight on', lens: '85mm portrait' },
      atmosphere: { mood: 'Tension and urban alienation', elements: 'Rain drops on lens' },
      color: { grade: 'Warm orange and teal blockbuster', skin: 'Rich deep brown with golden warmth' },
      film: { grain: 'Visible high ISO grain from low-light', format: '16:9 cinematic' },
      vibes: { reference: 'Helmut Newton powerful women', description: 'Fashion editorial with attitude and edge' },
    },
  },
  {
    id: '02',
    name: 'Subway Documentary',
    image: '/showcase/02-subway-documentary.png',
    style: 'Street Photography',
    description: 'Raw NYC subway moment with Bruce Davidson influence',
    prompt: {
      subject: { description: 'Weathered man in his 50s, salt-and-pepper beard, deep-set eyes', expression: 'Thousand-yard stare, disconnected' },
      environment: { location: 'Grimy NYC subway car interior', condition: 'Dirty, heavily used, authentic grime' },
      clothing: { main: 'Distressed denim jacket covered in patches', accessories: 'No jewelry, clean' },
      lighting: { source: 'Harsh built-in camera flash, direct and unmodified', mood: 'Flat and even, shadowless' },
      camera: { position: 'Waist height shooting upward', lens: '35mm documentary' },
      atmosphere: { mood: 'Melancholic longing', elements: 'Nothing, crystal clear air' },
      color: { grade: 'Flash-blown with green-yellow fluorescent falloff', skin: 'True to life, accurate' },
      film: { grain: 'Kodak Tri-X chunky grain', format: '4:3 native compact camera ratio' },
      vibes: { reference: 'Bruce Davidson subway documentation', description: 'Documentary realism, unstaged authenticity' },
    },
  },
  {
    id: '03',
    name: 'Golden Hour Ethereal',
    image: '/showcase/03-golden-hour-ethereal.png',
    style: 'Dreamy Portrait',
    description: 'Backlit garden scene with Kodak Portra warmth',
    prompt: {
      subject: { description: 'Androgynous model with sharp cheekbones and platinum buzzcut', expression: 'Pensive, deep in thought' },
      environment: { location: 'Overgrown garden, wildflowers everywhere', condition: 'Vintage, preserved from another era' },
      clothing: { main: 'Flowing white linen, ethereal', accessories: 'Delicate silver chain, single pendant' },
      lighting: { source: 'Golden hour sun from behind', mood: 'Rim light outlining figure' },
      camera: { position: 'Low angle from ground looking up', lens: '135mm telephoto' },
      atmosphere: { mood: 'Romantic and dreamy', elements: 'Dust particles visible in light beams' },
      color: { grade: 'Film emulation, Kodak Portra warm', skin: 'Warm and healthy' },
      film: { grain: 'Smooth medium format grain', format: '1:1 square medium format' },
      vibes: { reference: 'Wolfgang Tillmans casual beauty', description: 'Dreamlike surrealism, impossible beauty' },
    },
  },
  {
    id: '04',
    name: 'Brutalist Fashion',
    image: '/showcase/04-brutalist-fashion.png',
    style: 'Minimalist',
    description: 'Architectural portrait with dramatic chiaroscuro',
    prompt: {
      subject: { description: 'Muscular woman with shaved head and geometric tattoos', expression: 'Unbothered and distant, not posing, caught mid-thought' },
      environment: { location: 'Brutalist concrete architecture', condition: 'Under construction, raw materials' },
      clothing: { main: 'Tailored black suit, impeccable fit', accessories: 'Statement earrings only, architectural' },
      lighting: { source: 'Single bare strobe, hard light', mood: 'Dramatic chiaroscuro' },
      camera: { position: 'Wide establishing shot from across the room', lens: '24mm wide' },
      atmosphere: { mood: 'Mysterious and secretive', elements: 'Fog rolling through' },
      color: { grade: 'Desaturated, almost monochrome', skin: 'Cold and desaturated' },
      film: { grain: 'Clean digital, no grain', format: '2.35:1 anamorphic widescreen' },
      vibes: { reference: 'Viviane Sassen bold colors and shadows', description: 'Modern minimalism, negative space' },
    },
  },
  {
    id: '05',
    name: 'Intimate Snapshot',
    image: '/showcase/05-intimate-snapshot.png',
    style: 'Candid Portrait',
    description: 'Joyful beach moment with Polaroid nostalgia',
    prompt: {
      subject: { description: 'Freckled redhead teenager with oversized vintage glasses', expression: 'Laugh mid-burst, pure joy' },
      environment: { location: 'Sun-drenched California beach', condition: 'Lived-in but maintained' },
      clothing: { main: 'Oversized vintage band tee', accessories: 'Multiple ear piercings, mixed metals' },
      lighting: { source: 'Overhead sun at noon', mood: 'Soft gradual falloff' },
      camera: { position: 'Extreme close-up, inches from face', lens: '50mm standard' },
      atmosphere: { mood: 'Joyful exuberance', elements: 'Nothing, crystal clear air' },
      color: { grade: 'Vibrant and oversaturated', skin: 'Bronze and sun-kissed' },
      film: { grain: 'Color film grain, multi-colored specks', format: 'Instant film with white border' },
      vibes: { reference: 'Nan Goldin intimate snapshot', description: 'Intimate portrait, direct connection, quiet moment' },
    },
  },
  {
    id: '06',
    name: 'Vintage Hollywood',
    image: '/showcase/06-vintage-hollywood.png',
    style: 'Classic Glamour',
    description: 'Old Hollywood starlet with timeless elegance',
    prompt: {
      subject: { description: 'Elegant woman in her 30s with classic bone structure and porcelain skin', expression: 'Mysterious half-smile, knowing and secretive' },
      environment: { location: 'Art deco hotel lobby with marble columns', condition: 'Pristine, museum-quality preservation' },
      clothing: { main: 'Floor-length satin gown in champagne gold', accessories: 'Diamond drop earrings, vintage pearl clutch' },
      lighting: { source: 'Soft key light from above with fill', mood: 'Glamorous with gentle shadows' },
      camera: { position: 'Three-quarter angle, slightly below eye level', lens: '85mm portrait with soft focus' },
      atmosphere: { mood: 'Timeless elegance and old money', elements: 'Soft lens flare from chandelier' },
      color: { grade: 'Warm sepia undertones, classic Hollywood', skin: 'Porcelain with warm highlights' },
      film: { grain: 'Fine silver halide grain', format: '4:5 classic portrait ratio' },
      vibes: { reference: 'George Hurrell Hollywood portraits', description: 'Golden age glamour, movie star mystique' },
    },
  },
  {
    id: '07',
    name: 'Wilderness Soul',
    image: '/showcase/07-wilderness-soul.png',
    style: 'Environmental Portrait',
    description: 'Rugged adventurer in dramatic mountain landscape',
    prompt: {
      subject: { description: 'Weather-beaten man in his 40s with grey-streaked beard and sun-creased eyes', expression: 'Contemplative gaze toward distant horizon' },
      environment: { location: 'Alpine meadow with snow-capped peaks behind', condition: 'Wild and untamed, early morning mist' },
      clothing: { main: 'Worn wool sweater and waxed canvas jacket', accessories: 'Leather hiking boots, coiled rope over shoulder' },
      lighting: { source: 'Soft dawn light breaking through clouds', mood: 'Ethereal and spiritual' },
      camera: { position: 'Environmental wide shot with subject in lower third', lens: '35mm to capture landscape context' },
      atmosphere: { mood: 'Solitude and connection to nature', elements: 'Morning mist rolling through valley' },
      color: { grade: 'Cool blues and greens with warm skin', skin: 'Weathered tan with natural texture' },
      film: { grain: 'Medium format film grain', format: '3:2 landscape orientation' },
      vibes: { reference: 'Jimmy Chin adventure photography', description: 'Epic scale meets intimate humanity' },
    },
  },
  {
    id: '08',
    name: 'Avant-Garde Editorial',
    image: '/showcase/08-avant-garde-editorial.png',
    style: 'High Fashion',
    description: 'Experimental fashion with bold geometric styling',
    prompt: {
      subject: { description: 'Androgynous model with sharp angular features and shaved eyebrows', expression: 'Intense and confrontational, almost alien' },
      environment: { location: 'Stark white infinity cove studio', condition: 'Clinical, perfectly clean' },
      clothing: { main: 'Sculptural metallic dress with impossible geometric shapes', accessories: 'Oversized chrome earpieces, metallic nail extensions' },
      lighting: { source: 'Multiple colored gels creating harsh shadows', mood: 'Dramatic and theatrical' },
      camera: { position: 'Low angle looking up at model', lens: '50mm with slight distortion at edges' },
      atmosphere: { mood: 'Otherworldly and unsettling beauty', elements: 'Nothing, pure negative space' },
      color: { grade: 'High contrast with saturated color pops', skin: 'Pale with blue undertones' },
      film: { grain: 'Clean digital with razor sharpness', format: '1:1 square editorial' },
      vibes: { reference: 'Nick Knight experimental fashion', description: 'Fashion as art, pushing boundaries' },
    },
  },
  {
    id: '09',
    name: 'Noir Detective',
    image: '/showcase/09-noir-detective.png',
    style: 'Cinematic',
    description: 'Classic film noir with rain-slicked streets and shadows',
    prompt: {
      subject: { description: 'World-weary detective in his 50s, heavy-lidded eyes and cigarette-roughened face', expression: 'Suspicious sideways glance, paranoid vigilance' },
      environment: { location: 'Rain-soaked alley with fire escapes and steam vents', condition: 'Grimy urban decay, 1940s aesthetic' },
      clothing: { main: 'Rumpled trench coat with upturned collar', accessories: 'Fedora hat tilted low, unlit cigarette' },
      lighting: { source: 'Single streetlamp creating venetian blind shadows', mood: 'High contrast chiaroscuro' },
      camera: { position: 'Dutch angle tilted 15 degrees', lens: '40mm classic cinema' },
      atmosphere: { mood: 'Danger lurking in shadows', elements: 'Rain falling through light beam' },
      color: { grade: 'Pure black and white with deep blacks', skin: 'High contrast with visible pores' },
      film: { grain: 'Heavy noir grain, pushed processing', format: '2.39:1 anamorphic widescreen' },
      vibes: { reference: 'Film noir cinematography, Double Indemnity', description: 'Fatalistic doom, moral ambiguity' },
    },
  },
  {
    id: '10',
    name: 'Zen Stillness',
    image: '/showcase/10-zen-stillness.png',
    style: 'Wellness Portrait',
    description: 'Serene meditation moment in minimalist space',
    prompt: {
      subject: { description: 'Serene Asian woman in her 40s with natural grey streaks in long black hair', expression: 'Eyes closed, deep inner peace, slight smile' },
      environment: { location: 'Japanese minimalist room with shoji screens', condition: 'Immaculate, intentionally sparse' },
      clothing: { main: 'Simple linen robe in natural undyed cream', accessories: 'Mala beads loosely held, bare feet' },
      lighting: { source: 'Soft diffused daylight through paper screens', mood: 'Gentle and meditative' },
      camera: { position: 'Eye level, centered composition', lens: '90mm medium telephoto' },
      atmosphere: { mood: 'Deep tranquility and presence', elements: 'Incense smoke wisping gently' },
      color: { grade: 'Muted earth tones, wabi-sabi aesthetic', skin: 'Natural, healthy glow' },
      film: { grain: 'Subtle organic film texture', format: '4:5 portrait for calm vertical' },
      vibes: { reference: 'Hiroshi Sugimoto contemplative works', description: 'Stillness as subject, breathing space' },
    },
  },
  {
    id: '11',
    name: 'Cyberpunk Vendor',
    image: '/showcase/11-cyberpunk-vendor.png',
    style: 'Sci-Fi Portrait',
    description: 'Neon-lit street food scene with Blade Runner vibes',
    prompt: {
      subject: { description: 'Southeast Asian woman in her 30s with cybernetic augments', expression: 'Focused concentration, slight knowing smile' },
      environment: { location: 'Neon-lit food cart in rain-slicked alley', condition: 'Steam rising from woks, colorful signs reflecting' },
      clothing: { main: 'Utilitarian apron over tech-wear', accessories: 'LED earpiece, holographic menu display' },
      lighting: { source: 'Neon signs and food cart glow', mood: 'Atmospheric and cinematic' },
      camera: { position: 'Low angle looking up', lens: '35mm wide' },
      atmosphere: { mood: 'Urban alienation meets warmth', elements: 'Steam, rain, neon reflections' },
      color: { grade: 'Cyan and magenta dominant, Blade Runner', skin: 'Warm against cool neon' },
      film: { grain: 'Digital noise, high ISO look', format: '16:9 cinematic widescreen' },
      vibes: { reference: 'Blade Runner, Ghost in the Shell', description: 'Near-future street life, human connection in tech world' },
    },
  },
  {
    id: '12',
    name: 'Desert Wanderer',
    image: '/showcase/12-desert-wanderer.png',
    style: 'Documentary Portrait',
    description: 'Tuareg traveler weathering a Saharan sandstorm',
    prompt: {
      subject: { description: 'Tuareg man in his 50s with weathered sun-darkened skin', expression: 'Eyes squinting against sand, determined resilience' },
      environment: { location: 'Saharan desert during sandstorm', condition: 'Golden dust clouds, epic dunes' },
      clothing: { main: 'Traditional indigo blue tagelmust headwrap', accessories: 'Silver Tuareg cross pendant' },
      lighting: { source: 'Golden hour filtering through dust', mood: 'Ethereal and epic' },
      camera: { position: 'Eye level, environmental portrait', lens: '85mm portrait' },
      atmosphere: { mood: 'Solitude and endurance', elements: 'Sand particles in air, dust clouds' },
      color: { grade: 'Warm golds and deep blues', skin: 'Weathered tan with dust' },
      film: { grain: 'Medium format texture', format: '3:2 landscape' },
      vibes: { reference: 'Steve McCurry, National Geographic', description: 'Human resilience against nature' },
    },
  },
  {
    id: '13',
    name: 'Underwater Dream',
    image: '/showcase/13-underwater-dream.png',
    style: 'Fantasy Editorial',
    description: 'Ethereal underwater fashion with flowing fabrics',
    prompt: {
      subject: { description: 'Ethereal model with flowing red hair suspended in water', expression: 'Peaceful surrender, eyes closed' },
      environment: { location: 'Crystal clear turquoise water', condition: 'Sunbeams piercing from above' },
      clothing: { main: 'White flowing dress billowing around her', accessories: 'Delicate pearl jewelry' },
      lighting: { source: 'Sunlight filtering through water surface', mood: 'Dreamlike and heavenly' },
      camera: { position: 'Below looking up at subject', lens: 'Wide angle underwater housing' },
      atmosphere: { mood: 'Surreal weightlessness', elements: 'Bubbles trailing, light rays' },
      color: { grade: 'Turquoise and white, high key', skin: 'Luminous, underwater glow' },
      film: { grain: 'Clean and sharp', format: '4:5 portrait' },
      vibes: { reference: 'Tim Walker, Zena Holloway', description: 'Fashion as fantasy, defying gravity' },
    },
  },
  {
    id: '14',
    name: 'Synthwave Retro',
    image: '/showcase/14-synthwave-retro.png',
    style: 'Retro Aesthetic',
    description: '80s Miami Vice vibes with neon nostalgia',
    prompt: {
      subject: { description: 'Young man with mullet and aviator sunglasses', expression: 'Cool confidence, slight smirk' },
      environment: { location: 'Palm trees and grid horizon', condition: 'Neon sunset, chrome reflections' },
      clothing: { main: 'Chrome jacket with popped collar', accessories: 'Digital watch, gold chain' },
      lighting: { source: 'Neon pink and cyan lighting', mood: 'Nostalgic and stylized' },
      camera: { position: 'Straight on, centered', lens: '50mm standard' },
      atmosphere: { mood: 'Nostalgic escapism', elements: 'VHS scan lines, lens flare' },
      color: { grade: 'Saturated pink, cyan, purple', skin: 'Warm with neon highlights' },
      film: { grain: 'VHS texture overlay', format: '16:9 widescreen' },
      vibes: { reference: 'Miami Vice, Outrun aesthetic', description: '1980s fever dream, eternal sunset' },
    },
  },
  {
    id: '15',
    name: 'Victorian Gothic',
    image: '/showcase/15-victorian-gothic.png',
    style: 'Period Drama',
    description: 'Dark romantic portrait in candlelit manor',
    prompt: {
      subject: { description: 'Pale aristocratic woman with raven black hair in elaborate updo', expression: 'Melancholic, distant gaze' },
      environment: { location: 'Candlelit Victorian manor', condition: 'Velvet drapes, antique furniture' },
      clothing: { main: 'Black lace high-collar dress', accessories: 'Cameo brooch, jet mourning jewelry' },
      lighting: { source: 'Candelabra creating chiaroscuro', mood: 'Moody and dramatic' },
      camera: { position: 'Three-quarter angle', lens: '85mm with soft edges' },
      atmosphere: { mood: 'Dark romance and mystery', elements: 'Candle smoke, dust motes' },
      color: { grade: 'Desaturated with warm candlelight', skin: 'Porcelain pale' },
      film: { grain: 'Daguerreotype aesthetic', format: '4:5 portrait' },
      vibes: { reference: 'Tim Burton, Crimson Peak', description: 'Gothic beauty, haunted elegance' },
    },
  },
  {
    id: '16',
    name: 'Sports Action',
    image: '/showcase/16-sports-action.png',
    style: 'Sports Photography',
    description: 'Peak action basketball dunk with frozen motion',
    prompt: {
      subject: { description: 'Professional basketball player mid-dunk', expression: 'Intense determination, battle cry' },
      environment: { location: 'Basketball arena', condition: 'Crowd blurred in background' },
      clothing: { main: 'Team jersey, muscles tensed', accessories: 'Sweatband, athletic shoes' },
      lighting: { source: 'Arena lights creating rim light', mood: 'Dramatic and high contrast' },
      camera: { position: 'Low angle from baseline', lens: '70-200mm telephoto' },
      atmosphere: { mood: 'Peak athletic moment', elements: 'Sweat droplets frozen in air' },
      color: { grade: 'High contrast, saturated', skin: 'Glistening with sweat' },
      film: { grain: 'Clean digital, razor sharp', format: '3:2 action crop' },
      vibes: { reference: 'Sports Illustrated cover', description: 'Frozen perfection, athletic poetry' },
    },
  },
  {
    id: '17',
    name: 'Cozy Bookshop',
    image: '/showcase/17-cozy-bookshop.png',
    style: 'Lifestyle Portrait',
    description: 'Warm afternoon in a vintage bookshop',
    prompt: {
      subject: { description: 'Elderly bookshop owner with round spectacles', expression: 'Warm knowing smile, content' },
      environment: { location: 'Vintage bookshop with towering shelves', condition: 'Leather-bound books, cozy clutter' },
      clothing: { main: 'Cardigan sweater, reading glasses', accessories: 'Cup of tea in hand' },
      lighting: { source: 'Afternoon light through dusty window', mood: 'Warm and inviting' },
      camera: { position: 'Eye level, intimate', lens: '50mm standard' },
      atmosphere: { mood: 'Nostalgia and comfort', elements: 'Cat sleeping nearby, dust motes' },
      color: { grade: 'Warm amber tones throughout', skin: 'Natural warm glow' },
      film: { grain: 'Subtle film texture', format: '4:3 classic' },
      vibes: { reference: 'Wes Anderson warmth', description: 'Sanctuary of stories, time slowed down' },
    },
  },
  {
    id: '18',
    name: 'Bioluminescent Depths',
    image: '/showcase/18-bioluminescent-depths.png',
    style: 'Underwater Fantasy',
    description: 'Deep-sea diver surrounded by glowing ocean life',
    prompt: {
      subject: { description: 'Mystical deep-sea diver in vintage brass helmet', expression: 'Wonder and awe, face illuminated through glass' },
      environment: { location: 'Abyssal ocean depths', condition: 'Surrounded by bioluminescent jellyfish and plankton' },
      clothing: { main: 'Vintage brass diving suit with copper accents', accessories: 'Air hoses, weighted belt' },
      lighting: { source: 'Bioluminescent creatures providing ethereal glow', mood: 'Dreamlike and otherworldly' },
      camera: { position: 'Wide angle capturing vastness', lens: 'Underwater housing, wide angle' },
      atmosphere: { mood: 'Mysterious wonder', elements: 'Particles floating like stars, light rays' },
      color: { grade: 'Deep navy and electric blue', skin: 'Illuminated by cyan and magenta glow' },
      film: { grain: 'Clean with subtle noise', format: '1:1 square' },
      vibes: { reference: 'James Cameron deep sea', description: 'Alien beauty of the deep ocean' },
    },
  },
  {
    id: '19',
    name: 'Steampunk Inventor',
    image: '/showcase/19-steampunk-inventor.png',
    style: 'Victorian Sci-Fi',
    description: 'Eccentric inventor in a workshop of wonders',
    prompt: {
      subject: { description: 'Eccentric Victorian inventor with wild hair', expression: 'Intense focus, creative genius at work' },
      environment: { location: 'Cluttered workshop with brass machinery', condition: 'Gears, copper pipes, steam contraptions' },
      clothing: { main: 'Weathered leather apron over waistcoat', accessories: 'Leather goggles on forehead, grease stains' },
      lighting: { source: 'Warm amber gas lamps', mood: 'Dramatic shadows, warm highlights' },
      camera: { position: 'Medium shot, slight low angle', lens: '50mm with shallow depth' },
      atmosphere: { mood: 'Creative chaos and invention', elements: 'Steam wisps, sparks from machinery' },
      color: { grade: 'Sepia and bronze with golden highlights', skin: 'Warm, oil-smudged' },
      film: { grain: 'Vintage daguerreotype texture', format: '4:5 portrait' },
      vibes: { reference: 'Jules Verne, Wild Wild West', description: 'Victorian era meets impossible technology' },
    },
  },
  {
    id: '20',
    name: 'Urban Graffiti Queen',
    image: '/showcase/20-urban-graffiti-queen.png',
    style: 'Street Art Portrait',
    description: 'Street artist standing before her explosive mural',
    prompt: {
      subject: { description: 'Confident street artist with paint-covered hands', expression: 'Creative pride, urban edge' },
      environment: { location: 'Concrete wall with massive colorful mural', condition: 'Urban jungle, spray cans scattered' },
      clothing: { main: 'Paint-splattered overalls and crop top', accessories: 'Bandana, chunky rings' },
      lighting: { source: 'Evening golden hour side light', mood: 'Dramatic and gritty' },
      camera: { position: 'Wide angle capturing artist and full mural', lens: '24mm wide' },
      atmosphere: { mood: 'Rebellious creativity', elements: 'Paint mist in air, urban texture' },
      color: { grade: 'Neon pink, electric blue, acid green', skin: 'Natural with paint flecks' },
      film: { grain: 'Gritty urban texture', format: '16:9 widescreen' },
      vibes: { reference: 'Banksy meets fine art', description: 'Street art as high art expression' },
    },
  },
  {
    id: '21',
    name: 'Nordic Shaman',
    image: '/showcase/21-nordic-shaman.png',
    style: 'Mystical Portrait',
    description: 'Ancient shaman beneath the aurora borealis',
    prompt: {
      subject: { description: 'Nordic shaman with weathered wise face', expression: 'Eyes closed in spiritual trance' },
      environment: { location: 'Snow-covered ancient forest', condition: 'Aurora borealis dancing above' },
      clothing: { main: 'Traditional Sami clothing with reindeer leather', accessories: 'Silver jewelry, ceremonial drum' },
      lighting: { source: 'Aurora casting green and purple light on snow', mood: 'Ethereal and mystical' },
      camera: { position: 'Environmental portrait, low angle', lens: '35mm capturing aurora' },
      atmosphere: { mood: 'Sacred connection to nature', elements: 'Frost crystals, aurora movement' },
      color: { grade: 'Cool blue and silver with aurora accents', skin: 'Weathered, cold-touched' },
      film: { grain: 'Long exposure smoothness', format: '3:2 landscape' },
      vibes: { reference: 'National Geographic meets fantasy', description: 'Ancient wisdom meets cosmic wonder' },
    },
  },
  {
    id: '22',
    name: 'Bollywood Goddess',
    image: '/showcase/22-bollywood-goddess.png',
    style: 'Indian Cinema',
    description: 'Stunning bride in traditional red and gold',
    prompt: {
      subject: { description: 'Beautiful Indian bride with classical features', expression: 'Joy and celebration, graceful pose' },
      environment: { location: 'Ornate palace interior', condition: 'Fairy lights and flower garlands' },
      clothing: { main: 'Elaborate red and gold lehenga with zari embroidery', accessories: 'Maang tikka, nose ring, layered gold necklaces' },
      lighting: { source: 'Soft romantic with fairy light bokeh', mood: 'Warm and dreamy' },
      camera: { position: 'Three-quarter angle, medium shot', lens: '85mm portrait with bokeh' },
      atmosphere: { mood: 'Celebration and beauty', elements: 'Rose petals, soft glow' },
      color: { grade: 'Ruby red, emerald green, rich gold', skin: 'Warm bronze with mehndi' },
      film: { grain: 'Clean with soft glow', format: '4:5 portrait' },
      vibes: { reference: 'Classic Bollywood glamour', description: 'Indian bridal beauty at its finest' },
    },
  },
  {
    id: '23',
    name: 'Afrofuturist Queen',
    image: '/showcase/23-afrofuturist-queen.png',
    style: 'Sci-Fi Royalty',
    description: 'Regal queen on a throne of tech and tradition',
    prompt: {
      subject: { description: 'Regal African queen with elaborate natural hair', expression: 'Commanding presence, serene power' },
      environment: { location: 'Futuristic palace blending tech and African art', condition: 'Advanced tech meets ancestral motifs' },
      clothing: { main: 'Metallic gown blending kente with holographic material', accessories: 'Golden geometric hair pieces, LED accents' },
      lighting: { source: 'Dramatic rim light with tech glow', mood: 'Powerful and otherworldly' },
      camera: { position: 'Low angle emphasizing majesty', lens: '50mm with dramatic perspective' },
      atmosphere: { mood: 'Future royalty, ancestral pride', elements: 'Holographic displays, golden particles' },
      color: { grade: 'Purple, gold, electric blue', skin: 'Dark and gleaming with gold accents' },
      film: { grain: 'Clean futuristic', format: '2:3 portrait' },
      vibes: { reference: 'Black Panther, African mythology', description: 'Future and past unified in power' },
    },
  },
  {
    id: '24',
    name: 'Anime Hero',
    image: '/showcase/24-anime-hero.png',
    style: 'Japanese Animation',
    description: 'Dynamic hero pose at dramatic sunset',
    prompt: {
      subject: { description: 'Anime protagonist with spiky hair and determined eyes', expression: 'Heroic resolve, looking toward future' },
      environment: { location: 'Rooftop overlooking Japanese city', condition: 'Dramatic sunset with cherry blossoms' },
      clothing: { main: 'Long flowing coat over battle outfit', accessories: 'Bandaged arm, symbolic pendant' },
      lighting: { source: 'Dramatic backlight from setting sun', mood: 'Epic and inspiring' },
      camera: { position: 'Dynamic low angle', lens: 'Wide capturing full figure and sky' },
      atmosphere: { mood: 'Hope and determination', elements: 'Cherry blossom petals, wind effects' },
      color: { grade: 'Orange, pink, purple sunset gradient', skin: 'Cel-shaded anime style' },
      film: { grain: 'Clean cel animation', format: '16:9 widescreen' },
      vibes: { reference: 'Studio Ghibli meets shonen anime', description: 'Classic anime hero moment' },
    },
  },
  {
    id: '25',
    name: 'Jazz Age Singer',
    image: '/showcase/25-jazz-age-singer.png',
    style: '1920s Glamour',
    description: 'Speakeasy singer lost in passionate performance',
    prompt: {
      subject: { description: 'Glamorous jazz singer with finger-wave hair', expression: 'Passionate mid-song emotion, eyes closed' },
      environment: { location: 'Smoky 1920s speakeasy', condition: 'Art deco details, band silhouettes' },
      clothing: { main: 'Beaded flapper dress shimmering under spotlight', accessories: 'Long pearl strand, feather headpiece' },
      lighting: { source: 'Warm amber spotlight through smoke', mood: 'Intimate and atmospheric' },
      camera: { position: 'Low angle at microphone', lens: '50mm classic portrait' },
      atmosphere: { mood: 'Roaring twenties energy', elements: 'Cigarette smoke haze, champagne bubbles' },
      color: { grade: 'Sepia and gold with red accents', skin: 'Warm spotlight glow' },
      film: { grain: 'Heavy vintage film grain', format: '4:3 classic' },
      vibes: { reference: 'Josephine Baker, Harlem Renaissance', description: 'Golden age of jazz glamour' },
    },
  },
  {
    id: '26',
    name: 'Solarpunk Farmer',
    image: '/showcase/26-solarpunk-farmer.png',
    style: 'Utopian Future',
    description: 'Urban farmer in a green sustainable city',
    prompt: {
      subject: { description: 'Young diverse farmer with kind face', expression: 'Content and hopeful, at peace with work' },
      environment: { location: 'Rooftop garden in solarpunk city', condition: 'Vertical farms, solar panels, lush vegetation' },
      clothing: { main: 'Practical sustainable earth-tone clothing', accessories: 'High-tech gardening tools, seed pouch' },
      lighting: { source: 'Optimistic golden hour sunlight', mood: 'Warm and hopeful' },
      camera: { position: 'Environmental medium shot', lens: '35mm capturing city context' },
      atmosphere: { mood: 'Hope for sustainable future', elements: 'Butterflies, bees, thriving plants' },
      color: { grade: 'Vibrant greens, warm wood, clean white', skin: 'Healthy sun-touched' },
      film: { grain: 'Clean and bright', format: '3:2 landscape' },
      vibes: { reference: 'Studio Ghibli ecology', description: 'Optimistic sustainable future vision' },
    },
  },
  {
    id: '27',
    name: 'Roman Gladiator',
    image: '/showcase/27-roman-gladiator.png',
    style: 'Historical Epic',
    description: 'Victorious warrior in the Colosseum',
    prompt: {
      subject: { description: 'Battle-worn gladiator with muscular physique', expression: 'Fierce triumph mixed with exhaustion' },
      environment: { location: 'Roman Colosseum arena', condition: 'Dusty, afternoon sun, roaring crowd' },
      clothing: { main: 'Traditional gladiator armor with shoulder guard', accessories: 'Raised sword, leather straps, metal greaves' },
      lighting: { source: 'Harsh Mediterranean afternoon sun', mood: 'Dramatic harsh shadows' },
      camera: { position: 'Low angle heroic', lens: '35mm capturing arena scale' },
      atmosphere: { mood: 'Glory and brutality', elements: 'Dust clouds, crowd blur' },
      color: { grade: 'Terracotta, bronze, dusty gold', skin: 'Glistening with sweat and dust' },
      film: { grain: 'Cinematic epic texture', format: '2.39:1 anamorphic' },
      vibes: { reference: 'Gladiator, classical paintings', description: 'Ancient warrior at peak moment' },
    },
  },
  {
    id: '28',
    name: 'Neon Ronin',
    image: '/showcase/28-neon-ronin.png',
    style: 'Cyberpunk Samurai',
    description: 'Futuristic samurai in rain-soaked Neo-Tokyo',
    prompt: {
      subject: { description: 'Cyberpunk ronin with cybernetic enhancements', expression: 'Mysterious intensity behind LED oni mask' },
      environment: { location: 'Rain-soaked Neo-Tokyo alley', condition: 'Neon signs, wet pavement, steam vents' },
      clothing: { main: 'Blend of samurai armor and futuristic tech', accessories: 'Traditional katana, tactical kimono with circuits' },
      lighting: { source: 'Pink and cyan neon reflections', mood: 'Moody and atmospheric' },
      camera: { position: 'Low angle emphasizing power', lens: '35mm with rain effects' },
      atmosphere: { mood: 'Honor in a neon world', elements: 'Rain, steam, neon reflections' },
      color: { grade: 'Pink, cyan, deep purple', skin: 'Partially hidden by mask' },
      film: { grain: 'Digital rain texture', format: '16:9 cinematic' },
      vibes: { reference: 'Blade Runner meets feudal Japan', description: 'Ancient warrior code in future world' },
    },
  },
  {
    id: '29',
    name: 'Art Nouveau Muse',
    image: '/showcase/29-art-nouveau-muse.png',
    style: 'Vintage Illustration',
    description: 'Elegant figure in ornate decorative frame',
    prompt: {
      subject: { description: 'Elegant woman with flowing hair and peaceful expression', expression: 'Dreamy ethereal, eyes gently closed' },
      environment: { location: 'Within ornate Art Nouveau decorative frame', condition: 'Surrounded by floral and organic patterns' },
      clothing: { main: 'Flowing robes in soft pastels', accessories: 'Flowers and vines woven through hair' },
      lighting: { source: 'Soft even illustration lighting', mood: 'Flat and decorative' },
      camera: { position: 'Centered frontal composition', lens: 'Flat illustrative perspective' },
      atmosphere: { mood: 'Timeless beauty and nature', elements: 'Intricate botanical borders' },
      color: { grade: 'Dusty rose, sage green, gold, cream', skin: 'Soft flat illustration tones' },
      film: { grain: 'Lithograph print texture', format: '2:3 poster ratio' },
      vibes: { reference: 'Alphonse Mucha posters', description: 'Art as decorative beauty' },
    },
  },
  {
    id: '30',
    name: 'Magical Realism Cafe',
    image: '/showcase/30-magical-realism-cafe.png',
    style: 'Surrealist Scene',
    description: 'Ordinary cafe where impossible things happen',
    prompt: {
      subject: { description: 'Woman calmly reading newspaper amid magic', expression: 'Completely unfazed by surreal events' },
      environment: { location: 'Cozy cafe interior', condition: 'Ordinary setting with impossible elements' },
      clothing: { main: 'Casual vintage dress', accessories: 'Reading glasses, coffee cup' },
      lighting: { source: 'Warm cafe interior with dreamlike quality', mood: 'Cozy yet surreal' },
      camera: { position: 'Medium shot capturing scene', lens: '50mm standard with soft edges' },
      atmosphere: { mood: 'Magic in mundane', elements: 'Tiny whales swimming, flowers from sugar bowl, starry ceiling' },
      color: { grade: 'Muted vintage with pops of wonder', skin: 'Natural, warm' },
      film: { grain: 'Soft painterly texture', format: '4:3 classic' },
      vibes: { reference: 'Remedios Varo, Gabriel Garcia Marquez', description: 'Where everyday meets extraordinary' },
    },
  },
];

export default function ShowcasePage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'curated' | 'generated'>('curated');
  const [generatedItems, setGeneratedItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load generated showcase items
  useEffect(() => {
    async function loadGenerated() {
      try {
        const res = await fetch('/data/generated-showcase.json');
        if (res.ok) {
          const data = await res.json();
          setGeneratedItems(data);
        }
      } catch (err) {
        console.error('Failed to load generated showcase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGenerated();
  }, []);

  const currentItems = activeTab === 'curated' ? showcaseItems : generatedItems;

  const handleCopyPrompt = async () => {
    if (!selectedItem) return;
    const textToCopy = selectedItem.rawPrompt || JSON.stringify(selectedItem.prompt, null, 2);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryPrompt = () => {
    if (!selectedItem) return;
    const promptText = selectedItem.rawPrompt || JSON.stringify(selectedItem.prompt, null, 2);
    localStorage.setItem('generatingPrompt', promptText);
    router.push('/create/nano-banana/quick');
  };

  const navigateShowcase = (direction: 'prev' | 'next') => {
    if (!selectedItem) return;
    const currentIndex = currentItems.findIndex(item => item.id === selectedItem.id);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % currentItems.length
      : (currentIndex - 1 + currentItems.length) % currentItems.length;
    setSelectedItem(currentItems[newIndex]);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <Particles />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wider">HOME</span>
          </button>

          <h1 className="text-xl font-bold">Showcase</h1>

          <motion.button
            onClick={() => router.push('/create')}
            className="btn btn-primary text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={16} />
            <span>Create Your Own</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-3">
              See What&apos;s Possible
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Each image was generated using our prompt wizard. Click any image to see the exact prompt used and try it yourself.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('curated')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'curated'
                  ? 'bg-[var(--color-primary)] text-black'
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <Crown size={16} />
              <span>Curated</span>
              <span className="text-xs opacity-70">({showcaseItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'generated'
                  ? 'bg-[var(--color-secondary)] text-black'
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <Wand2 size={16} />
              <span>AI Generated</span>
              <span className="text-xs opacity-70">({generatedItems.length})</span>
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && activeTab === 'generated' ? (
              <div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
                Loading generated examples...
              </div>
            ) : currentItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
                No examples available
              </div>
            ) : currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] mb-2 inline-block">
                      {item.style}
                    </span>
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-white/70">{item.description}</p>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-[var(--color-bg-card)] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Navigation arrows */}
              <button
                onClick={() => navigateShowcase('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => navigateShowcase('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors md:right-[calc(33.333%+1rem)]"
              >
                <ChevronRight size={24} />
              </button>

              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Image */}
                <div className="relative md:w-2/3 aspect-square md:aspect-auto bg-black flex-shrink-0">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Details */}
                <div className="md:w-1/3 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Style badge */}
                    <span className="px-3 py-1 text-sm font-bold rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                      {selectedItem.style}
                    </span>

                    {/* Title */}
                    <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                    <p className="text-[var(--color-text-secondary)]">
                      {selectedItem.description}
                    </p>

                    {/* Model & Source for generated items */}
                    {selectedItem.model && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span className="px-2 py-0.5 rounded bg-[var(--color-bg-elevated)]">
                          {selectedItem.model}
                        </span>
                        {selectedItem.source?.name && (
                          <a
                            href={selectedItem.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--color-primary)] transition-colors"
                          >
                            by {selectedItem.source.name}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Prompt preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                          {selectedItem.rawPrompt ? 'Prompt' : 'JSON Prompt'}
                        </h3>
                        <button
                          onClick={handleCopyPrompt}
                          className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-white transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check size={12} className="text-[var(--color-success)]" />
                              <span className="text-[var(--color-success)]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-[var(--color-bg-deep)] text-xs text-[var(--color-text-secondary)] overflow-x-auto max-h-48 whitespace-pre-wrap">
                        {selectedItem.rawPrompt || JSON.stringify(selectedItem.prompt, null, 2)}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-4">
                      <motion.button
                        onClick={handleTryPrompt}
                        className="btn btn-primary w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Sparkles size={16} />
                        <span>Try This Prompt</span>
                      </motion.button>
                      <motion.button
                        onClick={handleCopyPrompt}
                        className="btn btn-ghost w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Copy size={16} />
                        <span>Copy Prompt</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-20" />
    </div>
  );
}
