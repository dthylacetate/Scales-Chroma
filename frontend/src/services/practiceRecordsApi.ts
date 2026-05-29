interface CreatePracticeRecordInput {
  userId: number;
  practiceDate: string;
  durationMinutes: number;
  bpm: number;
  topic: string;
  notes?: string | null;
  apiBaseUrl?: string;
}

interface PracticeRecordResponse {
  id: number;
  user_id: number;
  practice_date: string;
  duration_minutes: number;
  bpm: number;
  topic: string;
  notes: string | null;
  exp_earned: number;
  total_exp?: number;
  level?: number;
}

export interface PracticeRecordResult {
  id: number;
  userId: number;
  practiceDate: string;
  durationMinutes: number;
  bpm: number;
  topic: string;
  notes: string | null;
  expEarned: number;
  totalExp: number;
  level: number;
}

export async function createPracticeRecord({
  userId,
  practiceDate,
  durationMinutes,
  bpm,
  topic,
  notes = null,
  apiBaseUrl = ""
}: CreatePracticeRecordInput): Promise<PracticeRecordResult> {
  const response = await fetch(`${apiBaseUrl}/practice-records`, {
    body: JSON.stringify({
      user_id: userId,
      practice_date: practiceDate,
      duration_minutes: durationMinutes,
      bpm,
      topic,
      notes
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Practice record request failed with status ${response.status}`);
  }

  return normalizePracticeRecordResponse((await response.json()) as PracticeRecordResponse);
}

function normalizePracticeRecordResponse(response: PracticeRecordResponse): PracticeRecordResult {
  return {
    id: response.id,
    userId: response.user_id,
    practiceDate: response.practice_date,
    durationMinutes: response.duration_minutes,
    bpm: response.bpm,
    topic: response.topic,
    notes: response.notes,
    expEarned: response.exp_earned,
    totalExp: response.total_exp ?? response.exp_earned,
    level: response.level ?? 1
  };
}
