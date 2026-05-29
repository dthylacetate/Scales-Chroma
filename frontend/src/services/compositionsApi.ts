import type { TheoryElement } from "../types/theory";

interface SaveCompositionInput {
  userId: number;
  name: string;
  elements: TheoryElement[];
  apiBaseUrl?: string;
}

interface UpdateCompositionInput extends SaveCompositionInput {
  compositionId: number;
}

interface GetSavedCompositionsInput {
  userId: number;
  apiBaseUrl?: string;
}

interface SavedCompositionResponse {
  id: number;
  user_id: number;
  name: string;
  elements: TheoryElement[];
  created_at: string;
}

interface SavedCompositionListResponse {
  compositions: SavedCompositionResponse[];
}

export interface SavedComposition {
  id: number;
  userId: number;
  name: string;
  elements: TheoryElement[];
  createdAt: string;
}

export async function saveComposition({
  userId,
  name,
  elements,
  apiBaseUrl = ""
}: SaveCompositionInput): Promise<SavedComposition> {
  const response = await fetch(`${apiBaseUrl}/compositions`, {
    body: JSON.stringify({
      user_id: userId,
      name,
      elements
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Save composition request failed with status ${response.status}`);
  }

  return normalizeSavedComposition((await response.json()) as SavedCompositionResponse);
}

export async function updateComposition({
  compositionId,
  userId,
  name,
  elements,
  apiBaseUrl = ""
}: UpdateCompositionInput): Promise<SavedComposition> {
  const response = await fetch(`${apiBaseUrl}/compositions/${compositionId}`, {
    body: JSON.stringify({
      user_id: userId,
      name,
      elements
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PUT"
  });

  if (!response.ok) {
    throw new Error(`Update composition request failed with status ${response.status}`);
  }

  return normalizeSavedComposition((await response.json()) as SavedCompositionResponse);
}

export async function getSavedCompositions({
  userId,
  apiBaseUrl = ""
}: GetSavedCompositionsInput): Promise<SavedComposition[]> {
  const response = await fetch(`${apiBaseUrl}/compositions?${new URLSearchParams({
    user_id: String(userId)
  })}`);

  if (!response.ok) {
    throw new Error(`Saved compositions request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as SavedCompositionListResponse;
  return payload.compositions.map(normalizeSavedComposition);
}

function normalizeSavedComposition(response: SavedCompositionResponse): SavedComposition {
  return {
    id: response.id,
    userId: response.user_id,
    name: response.name,
    elements: response.elements,
    createdAt: response.created_at
  };
}
