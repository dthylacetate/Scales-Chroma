import type { TheoryElement } from "../types/theory";
import { createAuthHeaders } from "./authHeaders";

interface SaveCompositionInput {
  name: string;
  elements: TheoryElement[];
  authToken: string;
  apiBaseUrl?: string;
}

interface UpdateCompositionInput extends SaveCompositionInput {
  compositionId: number;
}

interface GetSavedCompositionsInput {
  authToken: string;
  apiBaseUrl?: string;
}

interface DeleteCompositionInput {
  compositionId: number;
  authToken: string;
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
  name,
  elements,
  authToken,
  apiBaseUrl = ""
}: SaveCompositionInput): Promise<SavedComposition> {
  const response = await fetch(`${apiBaseUrl}/compositions`, {
    body: JSON.stringify({
      name,
      elements
    }),
    headers: createAuthHeaders(authToken, true),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Save composition request failed with status ${response.status}`);
  }

  return normalizeSavedComposition((await response.json()) as SavedCompositionResponse);
}

export async function updateComposition({
  compositionId,
  name,
  elements,
  authToken,
  apiBaseUrl = ""
}: UpdateCompositionInput): Promise<SavedComposition> {
  const response = await fetch(`${apiBaseUrl}/compositions/${compositionId}`, {
    body: JSON.stringify({
      name,
      elements
    }),
    headers: createAuthHeaders(authToken, true),
    method: "PUT"
  });

  if (!response.ok) {
    throw new Error(`Update composition request failed with status ${response.status}`);
  }

  return normalizeSavedComposition((await response.json()) as SavedCompositionResponse);
}

export async function getSavedCompositions({
  authToken,
  apiBaseUrl = ""
}: GetSavedCompositionsInput): Promise<SavedComposition[]> {
  const response = await fetch(`${apiBaseUrl}/compositions`, {
    headers: createAuthHeaders(authToken)
  });

  if (!response.ok) {
    throw new Error(`Saved compositions request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as SavedCompositionListResponse;
  return payload.compositions.map(normalizeSavedComposition);
}

export async function deleteComposition({
  compositionId,
  authToken,
  apiBaseUrl = ""
}: DeleteCompositionInput): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/compositions/${compositionId}`, {
    headers: createAuthHeaders(authToken),
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`Delete composition request failed with status ${response.status}`);
  }
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
