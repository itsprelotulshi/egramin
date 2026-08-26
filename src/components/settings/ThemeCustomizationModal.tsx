import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  THEME_PRESETS,
  SURFACE_TONES,
  RADIUS_VALUES,
  ThemePreset,
  SurfaceTone,
  RadiusPreset,
  ThemeConfig,
  DEFAULT_THEME,
} from '../../lib/theme';
import {
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  X,
  ShieldCheck,
  Sun,
  Moon,
  Layers,
  Sliders,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ThemeCustomizationModal: React.FC = () => {
  const { user } = useAuth();
  const {
    isThemeModalOpen,
    closeThemeModal,
    themeConfig,
    updateThemeConfig,
    resetThemeConfig,
    isDarkMode,
    toggleTheme,
    toast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'presets' | 'surface' | 'geometry'>('presets');

  // Only Admins are authorized
  const isAdmin = user?.role === 'admin';

  if (!isThemeModalOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Privileges Required</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theme customization and brand styling controls are restricted exclusively to Platform Administrators.
          </p>
          <button
            onClick={closeThemeModal}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSelectPreset = (presetId: ThemePreset) => {
    updateThemeConfig({ preset: presetId });
    toast(`Switched theme preset to ${THEME_PRESETS[presetId].name}`, 'success');
  };

  const handleSelectSurface = (surface: SurfaceTone) => {
    updateThemeConfig({ surfaceTone: surface });
    toast(`Dark surface tone set to ${SURFACE_TONES[surface].name}`, 'info');
  };

  const handleSelectRadius = (radius: RadiusPreset) => {
    updateThemeConfig({ radius });
    toast(`Corner radius set to ${RADIUS_VALUES[radius].name}`, 'info');
  };

  const handleReset = () => {
    resetThemeConfig();
    toast('Reset theme configuration to default Emerald Pro styling.', 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={closeThemeModal}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Theme & Brand Customization
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dynamic visual tokens applied platform-wide in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
              <button
                type="button"
                onClick={closeThemeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-Nav Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 bg-white dark:bg-slate-900 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Color Palettes</span>
            </button>

            <button
              onClick={() => setActiveTab('surface')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'surface'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode Surface</span>
            </button>

            <button
              onClick={() => setActiveTab('geometry')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'geometry'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Corner Radius & Glow</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: COLOR PALETTES */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Primary Brand Palette
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((presetKey) => {
                    const preset = THEME_PRESETS[presetKey];
                    const isSelected = themeConfig.preset === presetKey;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative group flex items-start gap-3.5 ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Swatch Bubble */}
                        <div
                          className="w-10 h-10 rounded-xl shadow-md shrink-0 flex items-center justify-center text-white"
                          style={{ backgroundColor: preset.primaryHex }}
                        >
                          {isSelected && <Check className="w-5 h-5 drop-shadow-sm" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {preset.name}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-400">
                              {preset.primaryHex}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </p>

                          {/* Color shade strip */}
                          <div className="flex items-center gap-1 mt-2.5">
                            {[100, 300, 500, 700, 900].map((shade) => (
                              <div
                                key={shade}
                                className="w-4 h-2 rounded-sm"
                                style={{ backgroundColor: preset.shades[shade as keyof typeof preset.shades] }}
                              />
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: DARK MODE SURFACE TONE */}
            {activeTab === 'surface' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Dark Mode Surface & Background Tone
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(SURFACE_TONES) as SurfaceTone[]).map((surfaceKey) => {
                    const tone = SURFACE_TONES[surfaceKey];
                    const isSelected = themeConfig.surfaceTone === surfaceKey;

                    return (
                      <button
                        key={surfaceKey}
                        type="button"
                        onClick={() => handleSelectSurface(surfaceKey)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-full h-14 rounded-xl border mb-3 flex items-center justify-center text-white"
                          style={{
                            backgroundColor: tone.darkBg,
                            borderColor: tone.darkBorder,
                          }}
                        >
                          <div
                            className="px-3 py-1 rounded-lg text-[10px] font-bold"
                            style={{ backgroundColor: tone.darkCard }}
                          >
                            Card UI
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {tone.name}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CORNER RADIUS & GLOW */}
            {activeTab === 'geometry' && (
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Component Corner Radius
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(RADIUS_VALUES) as RadiusPreset[]).map((radiusKey) => {
                      const rad = RADIUS_VALUES[radiusKey];
                      const isSelected = themeConfig.radius === radiusKey;

                      return (
                        <button
                          key={radiusKey}
                          type="button"
                          onClick={() => handleSelectRadius(radiusKey)}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-12 h-12 mx-auto border-2 border-indigo-500 bg-indigo-500/20 mb-2 flex items-center justify-center text-xs font-bold text-indigo-500"
                            style={{ borderRadius: rad.cssRadius }}
                          >
                            UI
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {rad.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Atmospheric Card Glow Effects
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Subtle ambient neon glows surrounding platform headers and cards.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateThemeConfig({ enableGlowEffects: !themeConfig.enableGlowEffects })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      themeConfig.enableGlowEffects ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        themeConfig.enableGlowEffects ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* LIVE PREVIEW BOX */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Live Interactive Theme Preview</span>
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Active: {THEME_PRESETS[themeConfig.preset].name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:opacity-90 transition-opacity"
                >
                  Primary Action
                </button>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  Status: Approved
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Limit: Active
                </span>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Fast Route</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeThemeModal}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  closeThemeModal();
                  toast('Theme configuration applied successfully!', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Apply & Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
