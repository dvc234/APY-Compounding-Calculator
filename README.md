# APY Compounding Optimizer

An interactive calculator for finding the best compounding cadence after accounting for fixed and percentage-based fees. Use the web UI for visual exploration or the CLI for quick terminal runs. Built with TypeScript, Vite, and Chart.js — ready to deploy to Netlify.

## Features
- Fee-aware APY calculation (fixed and percent fees)
- Brute-force optimizer to pick the best compounding frequency
- Exponential, fee-aware compounding schedule visualization
- Responsive web UI with Chart.js and Bootstrap
- CLI runner for scripted workflows

## Quick start
```bash
npm install

# Run the dev server
npm run dev

# Type-check and build for production (Netlify-ready)
npm run build

# Run tests
npm test
```

## Web app usage
1. Run `npm run dev` and open the local URL printed by Vite.
2. Choose your currency symbol, APR, principal, and fee inputs.
3. Set the maximum compounding frequency to search (e.g., 365).
4. Click **Calculate Optimal** to see:
   - Real APY after fees for each candidate
   - A highlighted optimal point and range
   - A fee-aware compounding schedule with day-by-day checkpoints

The production build outputs to `dist/` via Vite and is suitable for Netlify publishing.

## CLI usage
Use the bundled CLI for quick calculations:

```bash
npm run cli -- --apr=12% --compounds=12 --principal=1000 --fee=0.1 --feePct=0 --maxN=365
```

Flags (all optional, defaults shown):
- `--apr`: APR as percent or decimal (default `0.12`)
- `--compounds` / `--compoundsPerYear`: starting compounding frequency (default `12`)
- `--principal`: initial balance (default `1000`)
- `--fee` / `--feePerCompound`: fixed fee per compound (default `0`)
- `--feePct`: percentage fee per compound (default `0`)
- `--maxN`: maximum N to search for the optimizer (default `365`)
- `--daysInYear`: day count used for scheduling (default `365`)

## Project structure
- `src/web`: Web entrypoint and UI wiring
- `src/cli`: Command-line entrypoint
- `src/domain`: Domain entities and props
- `src/services`: Core calculation, optimization, and scheduling services
- `src/presentation`: Chart.js adapter and view helpers
- `src/infra`: Visitor counter persistence
- `src/utils`: Input parsing helpers

## Tests and quality
- `npm test` runs the Vitest suite (15 tests across calculators, parsers, and scheduling).
- `npm run build` performs TypeScript type-checking (`tsc --noEmit`) and bundles with Vite.

## Deployment
Netlify can run `npm run build` and publish the generated `dist/` directory. The project uses ES modules and Vite asset bundling.

## License
This repository does not currently include a license file. Please consult the repository owner before reuse.
