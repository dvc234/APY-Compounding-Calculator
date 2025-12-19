import { ChartPoint, ChartService } from "./ChartService.js";

type Dataset = {
  label: string;
  data: { x: number; y: number }[];
  borderColor?: string;
  backgroundColor?: string;
  pointBackgroundColor?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  showLine?: boolean;
  tension?: number;
  fill?: boolean;
  cubicInterpolationMode?: "default" | "monotone";
};

export class ChartJsAdapter implements ChartService {
  renderApyVsCompounds(data: ChartPoint[], optimalN: number) {
    const dataset: Dataset = {
      label: "Real APY",
      data: data.map((d) => ({ x: d.n, y: d.realApy })),
      borderColor: "#1d4ed8",
      pointBackgroundColor: "#1d4ed8",
    };

    const goodPoints = data.filter(d => d.realApy > 0);
    const minGoodN = goodPoints.length > 0 ? Math.min(...goodPoints.map(p => p.n)) : null;
    const maxGoodN = goodPoints.length > 0 ? Math.max(...goodPoints.map(p => p.n)) : null;

    const maxApy = Math.max(...data.map(d => d.realApy));
    // Optimal area: within 0.01% of max APY
    const optimalPoints = data.filter(d => d.realApy >= maxApy - 0.0001 && d.realApy > 0);
    const minOptN = optimalPoints.length > 0 ? Math.min(...optimalPoints.map(p => p.n)) : null;
    const maxOptN = optimalPoints.length > 0 ? Math.max(...optimalPoints.map(p => p.n)) : null;

    const annotations: any = {};
    if (minGoodN !== null && maxGoodN !== null) {
      annotations.goodArea = {
        type: 'box',
        xMin: minGoodN,
        xMax: maxGoodN,
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderWidth: 0,
        label: {
          display: true,
          content: 'Good Range',
          position: 'start',
          color: 'rgba(34, 197, 94, 0.8)',
          font: { size: 10 }
        }
      };
    }

    if (minOptN !== null && maxOptN !== null && minOptN !== maxOptN) {
      annotations.optimalArea = {
        type: 'box',
        xMin: minOptN,
        xMax: maxOptN,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.5)',
        label: {
          display: true,
          content: 'Optimal Area',
          position: 'center',
          color: 'rgba(217, 119, 6, 1)',
          font: { size: 12, weight: 'bold' }
        }
      };
    }

    const highlight: Dataset = {
      label: "Optimal Point",
      data: data
        .filter((d) => d.n === optimalN)
        .map((d) => ({ x: d.n, y: d.realApy })),
      borderColor: "#f59e0b",
      pointBackgroundColor: "#f59e0b",
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false
    };

    return {
      type: "line",
      data: {
        datasets: [dataset, highlight],
      },
      options: {
        parsing: false,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 12,
            right: 12,
            bottom: 16,
          },
        },
        scales: {
          x: { 
            type: 'linear',
            title: { display: true, text: "Compounds per Year" },
            min: 0,
            max: Math.max(...data.map(d => d.n)),
            offset: true,
            ticks: { padding: 6 }
          },
          y: { 
            title: { display: true, text: "Real APY" }, 
            ticks: { callback: (v: number) => `${(v * 100).toFixed(2)}%` } 
          },
        },
        plugins: {
          annotation: {
            annotations
          }
        }
      },
    };
  }

  renderScheduleTimeline(schedule: number[]) {
    return {
      type: "bar",
      data: {
        labels: schedule.map((day) => `Day ${day}`),
        datasets: [
          {
            label: "Compound Day",
            data: schedule.map(() => 1),
          },
        ],
      },
    };
  }

  renderScheduleCurve(points: { day: number; balance: number }[], currencySymbol: string) {
    const dataset: Dataset = {
      label: "Exponential fee-aware schedule",
      data: points.map((p) => ({ x: p.day, y: p.balance })),
      borderColor: "#0ea5e9",
      backgroundColor: "rgba(14, 165, 233, 0.18)",
      pointBackgroundColor: "#0284c7",
      tension: 0.45,
      fill: true,
      cubicInterpolationMode: "monotone",
      pointRadius: 3,
      pointHoverRadius: 5,
    };

    return {
      type: "line",
      data: {
        datasets: [dataset],
      },
      options: {
        parsing: false,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: Math.max(...points.map((p) => p.day), 1),
            title: { display: true, text: "Day of Year" },
            ticks: { padding: 6 },
          },
          y: {
            title: { display: true, text: `Projected balance (${currencySymbol})` },
            ticks: {
              callback: (v: number) => `${currencySymbol}${v.toFixed(2)}`,
              padding: 6,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const day = ctx.parsed.x;
                const bal = ctx.parsed.y;
                return `Day ${day}: ${currencySymbol}${bal.toFixed(2)}`;
              },
            },
          },
          legend: {
            display: true,
          },
        },
      },
    };
  }
}