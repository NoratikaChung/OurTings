import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Source is a transparent bunny: browser/desktop icons stay see-through. iOS shows transparency as black anyway,
    // and Android shapes maskable icons, so both get an explicit black background.
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#000000' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#000000' } },
  },
  images: ['public/icon.png'],
});
