import { svelte } from '@sveltejs/vite-plugin-svelte'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
  },
  // Otras sesiones trabajan en copias del repositorio bajo .claude/worktrees, con sus propios tests.
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
