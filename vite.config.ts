import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'web-hero-preload',
      transformIndexHtml(html) {
        // WORKS_BUNDLE_REVISION 과 맞출 것 (bundleWorksPatch.ts)
        const v = 13
        const hrefs = [
          `/thumbnails/work-1-uandi-studio.png?v=${v}`,
          `/thumbnails/work-2-uandi-studio.png?v=${v}`,
        ]
        const tags = hrefs
          .map(
            (href) =>
              `    <link rel="preload" href="${href}" as="image" fetchpriority="high" />`,
          )
          .join('\n')
        return html.replace(
          '<link rel="preload" href="/brand/uandi-studio-logo.png" as="image" />',
          `<link rel="preload" href="/brand/uandi-studio-logo.png" as="image" fetchpriority="high" />\n${tags}`,
        )
      },
    },
  ],
})
