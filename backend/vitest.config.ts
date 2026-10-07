import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Disables parallel execution of test files to prevent memory crashes
    fileParallelism: false,
    maxWorkers: 1,
  },
})
