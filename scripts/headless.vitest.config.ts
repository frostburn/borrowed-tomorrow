import {defineConfig} from 'vitest/config';
// Longer route simulations are opt-in, separate from the small default gate.
export default defineConfig({test:{include:['tests/*.simulation.ts'],maxWorkers:1}});
