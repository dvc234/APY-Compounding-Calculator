#!/usr/bin/env ts-node
import { CompoundFeeApyCalculator } from "../services/CompoundFeeApyCalculator.js";
import { BruteForceOptimizer } from "../services/BruteForceOptimizer.js";
import { InterestParams } from "../domain/InterestParams.js";

interface CliOptions {
  apr: number;
  compoundsPerYear: number;
  principal: number;
  feePerCompound: number;
  feePct: number;
  maxN: number;
  daysInYear: number;
}

function parseArgs(argv: string[]): CliOptions {
  const defaults: CliOptions = {
    apr: 0.12,
    compoundsPerYear: 12,
    principal: 1000,
    feePerCompound: 0,
    feePct: 0,
    maxN: 365,
    daysInYear: 365,
  };

  const args = [...argv];
  while (args.length) {
    const current = args.shift();
    if (!current) continue;
    const [flag, value] = current.startsWith("--") && current.includes("=") ? current.slice(2).split("=") : [current.replace(/^--/, ""), args.shift()];
    if (!value) continue;

    const numeric = Number(value);
    switch (flag) {
      case "apr":
        defaults.apr = numeric;
        break;
      case "compounds":
      case "compoundsPerYear":
        defaults.compoundsPerYear = numeric;
        break;
      case "principal":
        defaults.principal = numeric;
        break;
      case "fee":
      case "feePerCompound":
        defaults.feePerCompound = numeric;
        break;
      case "feePct":
        defaults.feePct = numeric;
        break;
      case "maxN":
        defaults.maxN = Math.max(1, Math.floor(numeric));
        break;
      case "daysInYear":
        defaults.daysInYear = Math.max(1, Math.floor(numeric));
        break;
      default:
        break;
    }
  }

  return defaults;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const params = new InterestParams({
    apr: options.apr,
    compoundsPerYear: options.compoundsPerYear,
    principal: options.principal,
    feePerCompound: options.feePerCompound,
    feePct: options.feePct,
    daysInYear: options.daysInYear,
  });

  const calculator = new CompoundFeeApyCalculator();
  const optimizer = new BruteForceOptimizer();
  const searchSpace = Array.from({ length: options.maxN }, (_, i) => i + 1);
  const optimal = optimizer.findOptimal(params, searchSpace, calculator);

  const rows = searchSpace.map((n) => {
    const result = calculator.calculate(params.withCompounds(n));
    const marker = n === optimal.n ? "*" : " ";
    return `${marker} ${n.toString().padStart(3, " ")} | ${formatPercent(result.realApy).padStart(8, " ")} | ${result.totalFees.toFixed(2).padStart(10, " ")} | ${result.netGain.toFixed(2).padStart(10, " ")} | ${result.netBalance.toFixed(2).padStart(10, " ")}`;
  });

  console.log("APY Compounding Optimizer\n");
  console.log(
    `APR=${options.apr} compounds=${options.compoundsPerYear} fee=${options.feePerCompound} feePct=${options.feePct} principal=${options.principal}`
  );
  console.log("\n * indicates optimal compounding count (lower is chosen on ties)\n");
  console.log("  n  |  real APY | total fees |  net gain | net balance");
  console.log("-------------------------------------------------------");
  rows.forEach((row) => console.log(row));

  console.log("\nOptimal Compounds Per Year:", optimal.n);
  console.log("Schedule (day offsets):", optimal.schedule?.join(", "));
}

main().catch((err) => {
  console.error("Failed to run calculator:", err);
  process.exit(1);
});