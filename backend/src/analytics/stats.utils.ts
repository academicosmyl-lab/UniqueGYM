export function mediana(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mad(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = mediana(arr);
  const deviations = arr.map((x) => Math.abs(x - m));
  return mediana(deviations);
}

export function esAtipica(x: number, arr: number[]): boolean {
  const m = mediana(arr);
  const madVal = mad(arr);
  return Math.abs(x - m) > 3 * madVal;
}

export function mediaMovil(arr: number[], ventana = 3): number[] {
  if (arr.length === 0) return [];
  return arr.map((_, i) => {
    const desde = Math.max(0, i - ventana + 1);
    const ventanaActual = arr.slice(desde, i + 1);
    return ventanaActual.reduce((s, v) => s + v, 0) / ventanaActual.length;
  });
}

// pendiente = (N*Σxy - Σx*Σy) / (N*Σx² - (Σx)²)
export function pendienteLineal(arr: number[]): number {
  const n = arr.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += arr[i];
    sumXY += i * arr[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

// 1RM Epley: peso * (1 + reps/30)
export function epley(peso: number, reps: number): number {
  if (reps === 1) return peso;
  return peso * (1 + reps / 30);
}
