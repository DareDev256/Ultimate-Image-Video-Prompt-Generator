// Sound manager for Flash-era audio effects
// Sounds are off by default, user can toggle on

type SoundName = 'click' | 'whoosh' | 'hover' | 'success' | 'processing';

class SoundManager {
  private enabled: boolean = false;
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Check localStorage for user preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('soundEnabled');
      this.enabled = stored === 'true';
    }
  }

  private init() {
    if (this.initialized || typeof window === 'undefined') return;

    // Create audio elements with placeholder URLs
    // In production, these would be real sound files
    const soundUrls: Record<SoundName, string> = {
      click: '/sounds/click.mp3',
      whoosh: '/sounds/whoosh.mp3',
      hover: '/sounds/hover.mp3',
      success: '/sounds/success.mp3',
      processing: '/sounds/processing.mp3',
    };

    Object.entries(soundUrls).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = name === 'hover' ? 0.2 : 0.5;
      this.sounds.set(name as SoundName, audio);
    });

    this.initialized = true;
  }

  play(name: SoundName) {
    if (!this.enabled) return;

    this.init();

    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(this.enabled));
    }
    return this.enabled;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(value));
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// React hook for sound
export function useSound() {
  return {
    play: (name: SoundName) => soundManager.play(name),
    toggle: () => soundManager.toggle(),
    isEnabled: () => soundManager.isEnabled(),
    setEnabled: (value: boolean) => soundManager.setEnabled(value),
  };
}
