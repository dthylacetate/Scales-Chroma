interface GetYearlyHeatmapInput {
  userId: number;
  year: number;
  apiBaseUrl?: string;
}

interface GetSkillTreeInput {
  userId: number;
  apiBaseUrl?: string;
}

interface HeatmapDayResponse {
  date: string;
  duration_minutes: number;
  exp: number;
}

interface YearlyHeatmapResponse {
  user_id: number;
  year: number;
  days: HeatmapDayResponse[];
}

export interface HeatmapDay {
  date: string;
  durationMinutes: number;
  exp: number;
}

export interface YearlyHeatmap {
  userId: number;
  year: number;
  days: HeatmapDay[];
}

export interface SkillNode {
  id: string;
  label: string;
  level: number;
  unlocked: boolean;
}

export interface SkillBranch {
  direction: string;
  nodes: SkillNode[];
}

interface SkillTreeResponse {
  user_id: number;
  branches: SkillBranch[];
}

export interface SkillTree {
  userId: number;
  branches: SkillBranch[];
}

export async function getYearlyHeatmap({
  userId,
  year,
  apiBaseUrl = ""
}: GetYearlyHeatmapInput): Promise<YearlyHeatmap> {
  const response = await fetch(`${apiBaseUrl}/heatmap/yearly?${new URLSearchParams({
    user_id: String(userId),
    year: String(year)
  })}`);

  if (!response.ok) {
    throw new Error(`Yearly heatmap request failed with status ${response.status}`);
  }

  return normalizeYearlyHeatmap((await response.json()) as YearlyHeatmapResponse);
}

export async function getSkillTree({
  userId,
  apiBaseUrl = ""
}: GetSkillTreeInput): Promise<SkillTree> {
  const response = await fetch(`${apiBaseUrl}/skill-tree?${new URLSearchParams({
    user_id: String(userId)
  })}`);

  if (!response.ok) {
    throw new Error(`Skill tree request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as SkillTreeResponse;
  return {
    userId: payload.user_id,
    branches: payload.branches
  };
}

function normalizeYearlyHeatmap(response: YearlyHeatmapResponse): YearlyHeatmap {
  return {
    userId: response.user_id,
    year: response.year,
    days: response.days.map((day) => ({
      date: day.date,
      durationMinutes: day.duration_minutes,
      exp: day.exp
    }))
  };
}
