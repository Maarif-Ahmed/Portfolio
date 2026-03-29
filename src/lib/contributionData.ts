export interface ContributionDay {
  dayIndex: number;
  week: number;
  weekday: number;
  intensity: number;
  height: number;
}

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateContributionData(seed = 42): ContributionDay[] {
  const random = mulberry32(seed);

  return Array.from({ length: 365 }, (_, dayIndex) => {
    const week = Math.floor(dayIndex / 7);
    const weekday = dayIndex % 7;
    const weighted = Math.pow(random(), 0.62);
    const intensity = Math.min(4, Math.floor(weighted * 5));

    return {
      dayIndex,
      week,
      weekday,
      intensity,
      height: 0.14 + intensity * 0.22,
    };
  });
}

export function summarizeContributionData(days: ContributionDay[]) {
  const activeDays = days.filter((day) => day.intensity > 0).length;
  const totalIntensity = days.reduce((sum, day) => sum + day.intensity, 0);
  const maxIntensity = Math.max(...days.map((day) => day.intensity));

  return {
    activeDays,
    totalIntensity,
    maxIntensity,
  };
}
