import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const root = import.meta.dirname
/** Where the PHP side keeps the admin's live data locally (SITE_DATA_DIR in public/lib/store.php). */
const localData = path.resolve(root, '.data')
const phpPort = 8010

/**
 * Puts the works and the image manifest into the page as JSON
 * (<script id="site-data">, read by src/content/data.ts). This is the starting
 * copy from public/content/; on the PHP server index.php replaces it with the
 * live data edited in the admin. In development the admin's local copy wins,
 * so a change saved in /admin shows after a reload.
 */
function siteData(): Plugin {
  let dev = false
  const read = (name: string) => {
    const live = path.join(localData, name)
    const file = dev && fs.existsSync(live) ? live : path.resolve(root, 'public/content', name)
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }
  return {
    name: 'site-data',
    configResolved(config) {
      dev = config.command === 'serve'
    },
    transformIndexHtml(html) {
      const json = JSON.stringify({ artworks: read('artworks.json'), images: read('images.json') })
      // "<" is escaped so nothing in the data can close the script tag.
      const script = `<script type="application/json" id="site-data">${json.replace(/</g, '\\u003c')}</script>`
      return html.replace('<!--site-data-->', script)
    },
  }
}

/**
 * `npm run dev` runs the PHP side too (PHP's built-in server on public/), and
 * /admin and /api are passed through to it, so the admin works on the dev server.
 */
function phpDev(): Plugin {
  return {
    name: 'php-dev',
    apply: 'serve',
    config: () => ({
      server: {
        proxy: Object.fromEntries(
          ['/admin', '/api'].map((prefix) => [prefix, `http://127.0.0.1:${phpPort}`]),
        ),
      },
    }),
    configureServer(server) {
      const php = spawn(
        'php',
        ['-S', `127.0.0.1:${phpPort}`, '-t', 'public', 'scripts/php-router.php'],
        { cwd: root, env: { ...process.env, SITE_DATA_DIR: localData }, stdio: 'ignore' },
      )
      php.on('error', () =>
        server.config.logger.warn('PHP is not installed, so /admin will not work (needs PHP 8.1+).'),
      )
      server.httpServer?.on('close', () => php.kill())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo>/, Netlify and PHP hosting from the root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), siteData(), phpDev()],
})
