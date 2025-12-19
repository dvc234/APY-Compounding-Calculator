import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { CompoundFeeApyCalculator } from "../services/CompoundFeeApyCalculator.js";
import { BruteForceOptimizer } from "../services/BruteForceOptimizer.js";
import { InterestParams } from "../domain/InterestParams.js";
import { ChartJsAdapter } from "../presentation/ChartJsAdapter.js";
import { LocalVisitorCounter } from "../infra/LocalVisitorCounter.js";
import { parsePercentageInput } from "../utils/parsePercentageInput.js";

Chart.register(...registerables, annotationPlugin);

const calculator = new CompoundFeeApyCalculator();
const optimizer = new BruteForceOptimizer();
const chartAdapter = new ChartJsAdapter();
const visitorCounter = new LocalVisitorCounter();

let chartInstance: Chart | null = null;
const currencySelect = document.getElementById('currency') as HTMLSelectElement | null;
const initialCurrency = currencySelect?.value ?? '$';

updateCurrencyLabels(initialCurrency);
currencySelect?.addEventListener('change', () => {
    if (currencySelect) {
        updateCurrencyLabels(currencySelect.value);
    }
});

function updateCurrencyLabels(symbol: string) {
    const principalLabel = document.getElementById('currencyPrincipal');
    const feeLabel = document.getElementById('currencyFee');
    if (principalLabel) principalLabel.textContent = symbol;
    if (feeLabel) feeLabel.textContent = symbol;
}

function formatCurrency(value: number, symbol: string): string {
    const currency = symbol === '€' ? 'EUR' : 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

async function initVisitorCounter() {
    await visitorCounter.increment();
    const count = await visitorCounter.getCount();
    const countEl = document.getElementById('count');
    if (countEl) countEl.innerText = count.toString();
}

function updateChart(data: any) {
    const ctx = (document.getElementById('apyChart') as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, data);
}

const form = document.getElementById('calcForm') as HTMLFormElement;
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currencySymbol = currencySelect?.value ?? '$';
    const aprInput = (document.getElementById('apr') as HTMLInputElement).value;
    const apr = parsePercentageInput(aprInput);
    const principal = parseFloat((document.getElementById('principal') as HTMLInputElement).value);
    const feePerCompound = parseFloat((document.getElementById('feePerCompound') as HTMLInputElement).value);
    const feePct = parseFloat((document.getElementById('feePct') as HTMLInputElement).value);
    const maxN = parseInt((document.getElementById('maxN') as HTMLInputElement).value);

    const params = new InterestParams({
        apr,
        principal,
        feePerCompound,
        feePct,
        compoundsPerYear: 1 // default for search
    });

    const searchSpace = Array.from({ length: maxN + 1 }, (_, i) => i);
    const optimal = optimizer.findOptimal(params, searchSpace, calculator);

    const chartPoints = searchSpace.map(n => {
        const res = calculator.calculate(params.withCompounds(n));
        return { n, realApy: res.realApy };
    });

    const chartConfig = chartAdapter.renderApyVsCompounds(chartPoints, optimal.n);
    updateChart(chartConfig);

    const resultsEl = document.getElementById('results')!;
    resultsEl.style.display = 'block';

    const emptyStateEl = document.getElementById('empty-state')!;
    emptyStateEl.style.display = 'none';

    const optimalTextEl = document.getElementById('optimalText')!;
    const nDisplay = optimal.n === 0 ? "No compounding" : `${optimal.n} times per year`;
    const balanceText = formatCurrency(optimal.result.netBalance, currencySymbol);
    optimalTextEl.innerText = `Optimal Compounding: ${nDisplay}. Real APY: ${(optimal.result.realApy * 100).toFixed(4)}%. Net after one year: ${balanceText}.`;
});

initVisitorCounter();
