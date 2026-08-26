/**
 * Theme Engine for Dynamic Theming & Brand Customization
 * Supports dynamic CSS custom properties, palette presets, dark mode surface tones, and border radius.
 */

export type ThemePreset =
  | 'emerald'
  | 'indigo'
  | 'violet'
  | 'cyan'
  | 'amber'
  | 'rose'
  | 'monochrome';

export type SurfaceTone = 'slate' | 'oled' | 'stone';
export type RadiusPreset = 'sharp' | 'modern' | 'smooth';
export type DensityMode = 'comfortable' | 'compact';

export interface ThemeShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemePresetOption {
  id: ThemePreset;
  name: string;
  description: string;
  primaryHex: string;
  gradient: string;
  shades: ThemeShades;
}

export interface ThemeConfig {
  preset: ThemePreset;
  customPrimaryHex?: string;
  surfaceTone: SurfaceTone;
  radius: RadiusPreset;
  density: DensityMode;
  enableGlowEffects: boolean;
}

export const THEME_PRESETS: Record<ThemePreset, ThemePresetOption> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Pro (Default)',
    description: 'Crisp, corporate emerald green tailored for financial stability',
    primaryHex: '#059669',
    gradient: 'from-emerald-600 to-teal-500',
    shades: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Indigo',
    description: 'Deep enterprise blue and sleek royal indigo',
    primaryHex: '#4f46e5',
    gradient: 'from-indigo-600 to-blue-500',
    shades: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
  },
  violet: {
    id: 'violet',
    name: 'Cyber Violet',
    description: 'Modern high-contrast purple and vibrant violet',
    primaryHex: '#7c3aed',
    gradient: 'from-purple-600 to-pink-500',
    shades: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
  },
  cyan: {
    id: 'cyan',
    name: 'Ocean Cyan',
    description: 'High-tech cyan and futuristic ocean teal',
    primaryHex: '#0891b2',
    gradient: 'from-cyan-600 to-blue-500',
    shades: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    description: 'Warm gold, luxury copper and energetic amber',
    primaryHex: '#d97706',
    gradient: 'from-amber-600 to-orange-500',
    shades: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
  },
  rose: {
    id: 'rose',
    name: 'Crimson Rose',
    description: 'Bold ruby crimson and dynamic rose accents',
    primaryHex: '#e11d48',
    gradient: 'from-rose-600 to-pink-500',
    shades: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome Stealth',
    description: 'Ultra-minimalist slate, zinc, and titanium steel',
    primaryHex: '#475569',
    gradient: 'from-slate-700 to-zinc-600',
    shades: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
};

export const SURFACE_TONES: Record<SurfaceTone, { name: string; darkBg: string; darkCard: string; darkBorder: string }> = {
  slate: {
    name: 'Slate Blue (Default)',
    darkBg: '#020617', // slate-950
    darkCard: '#0f172a', // slate-900
    darkBorder: '#1e293b', // slate-800
  },
  oled: {
    name: 'Midnight OLED (Pitch Black)',
    darkBg: '#000000', // true black
    darkCard: '#09090b', // zinc-950
    darkBorder: '#18181b', // zinc-900
  },
  stone: {
    name: 'Warm Stone (Deep Neutral)',
    darkBg: '#0c0a09', // stone-950
    darkCard: '#1c1917', // stone-900
    darkBorder: '#292524', // stone-800
  },
};

export const RADIUS_VALUES: Record<RadiusPreset, { name: string; cssRadius: string; twClass: string }> = {
  sharp: { name: 'Sharp (6px)', cssRadius: '0.375rem', twClass: 'rounded-md' },
  modern: { name: 'Modern (12px)', cssRadius: '0.75rem', twClass: 'rounded-xl' },
  smooth: { name: 'Smooth (18px)', cssRadius: '1.125rem', twClass: 'rounded-2xl' },
};

export const DEFAULT_THEME: ThemeConfig = {
  preset: 'emerald',
  surfaceTone: 'slate',
  radius: 'modern',
  density: 'comfortable',
  enableGlowEffects: true,
};

const THEME_STORAGE_KEY = 'csmp_custom_theme_config';

/**
 * Reads stored theme configuration from localStorage or returns default.
 */
export function getStoredTheme(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse stored theme config:', err);
  }
  return DEFAULT_THEME;
}

/**
 * Applies theme CSS variables to document root and body.
 */
export function applyTheme(config: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const preset = THEME_PRESETS[config.preset] || THEME_PRESETS.emerald;
  const shades = preset.shades;
  const surface = SURFACE_TONES[config.surfaceTone] || SURFACE_TONES.slate;
  const radius = RADIUS_VALUES[config.radius] || RADIUS_VALUES.modern;

  // 1. Set Primary Color Shades for Tailwind @theme & CSS vars
  Object.entries(shades).forEach(([shade, hex]) => {
    root.style.setProperty(`--color-primary-${shade}`, hex);
    root.style.setProperty(`--color-indigo-${shade}`, hex); // Backward compatibility mapping
    root.style.setProperty(`--primary-${shade}`, hex);
  });

  // 2. Main Brand Color & Glow
  root.style.setProperty('--brand-primary', preset.primaryHex);
  root.style.setProperty('--brand-primary-rgb', hexToRgb(preset.primaryHex));
  root.style.setProperty('--app-border-radius', radius.cssRadius);

  // 3. Dark Mode Surface Overrides
  root.style.setProperty('--dark-surface-bg', surface.darkBg);
  root.style.setProperty('--dark-surface-card', surface.darkCard);
  root.style.setProperty('--dark-surface-border', surface.darkBorder);

  // 4. Glow Effects
  root.style.setProperty(
    '--brand-glow-opacity',
    config.enableGlowEffects ? '0.15' : '0'
  );

  // 5. Density Mode
  if (config.density === 'compact') {
    root.classList.add('density-compact');
  } else {
    root.classList.remove('density-compact');
  }

  // 6. Surface tone class for custom background tweaks
  root.dataset.surface = config.surfaceTone;
  root.dataset.themePreset = config.preset;

  // Persist
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to persist theme config:', err);
  }
}

/**
 * Helper to convert Hex to RGB string 'r, g, b'
 */
function hexToRgb(hex: string): string {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}
