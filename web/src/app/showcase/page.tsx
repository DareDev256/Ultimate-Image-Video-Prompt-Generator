'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';

interface ShowcaseItem {
  id: string;
  name: string;
  image: string;
  style: string;
  description: string;
  prompt: {
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
];

export default function ShowcasePage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    if (!selectedItem) return;
    const promptJson = JSON.stringify(selectedItem.prompt, null, 2);
    await navigator.clipboard.writeText(promptJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryPrompt = () => {
    if (!selectedItem) return;
    const promptJson = JSON.stringify(selectedItem.prompt, null, 2);
    localStorage.setItem('generatingPrompt', promptJson);
    router.push('/create/nano-banana/quick');
  };

  const navigateShowcase = (direction: 'prev' | 'next') => {
    if (!selectedItem) return;
    const currentIndex = showcaseItems.findIndex(item => item.id === selectedItem.id);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % showcaseItems.length
      : (currentIndex - 1 + showcaseItems.length) % showcaseItems.length;
    setSelectedItem(showcaseItems[newIndex]);
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">
              See What&apos;s Possible
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Each image was generated using our prompt wizard. Click any image to see the exact prompt used and try it yourself.
            </p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcaseItems.map((item, index) => (
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

                    {/* Prompt preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                          JSON Prompt
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
                      <pre className="p-3 rounded-lg bg-[var(--color-bg-deep)] text-xs text-[var(--color-text-secondary)] overflow-x-auto max-h-48">
                        {JSON.stringify(selectedItem.prompt, null, 2)}
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
