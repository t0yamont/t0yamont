export async function geocode(query: string) {
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&format=json`
  );
  const j = await r.json();
  return (j.results ?? []) as Array<{
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

export async function climateAverage(lat: number, lon: number, month: number, day: number) {
  const currentYear = new Date().getFullYear();
  const years = [1, 2, 3, 4].map((n) => currentYear - n);
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  const results = await Promise.all(
    years.map(async (y) => {
      const url =
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
        `&start_date=${y}-${mm}-${dd}&end_date=${y}-${mm}-${dd}` +
        `&daily=temperature_2m_mean,temperature_2m_max&timezone=auto`;
      try {
        const j = await (await fetch(url)).json();
        const mean = j?.daily?.temperature_2m_mean?.[0];
        const max = j?.daily?.temperature_2m_max?.[0];
        if (typeof mean !== 'number') return null;
        return { mean, max: typeof max === 'number' ? max : mean };
      } catch {
        return null;
      }
    })
  );

  const valid = results.filter((r): r is { mean: number; max: number } => r !== null);
  if (!valid.length) return null;

  const avgMean = valid.reduce((a, r) => a + r.mean, 0) / valid.length;
  const avgMax = valid.reduce((a, r) => a + r.max, 0) / valid.length;

  return {
    tempCelsius: Math.round((avgMax + avgMean) / 2),
    years: valid.length,
  };
}

export function humidityFromTemp(temp: number): 'low' | 'moderate' | 'high' {
  if (temp > 28) return 'high';
  if (temp > 18) return 'moderate';
  return 'low';
}
