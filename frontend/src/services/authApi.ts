import { createAuthHeaders } from "./authHeaders";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  apiBaseUrl?: string;
}

interface LoginInput {
  username: string;
  password: string;
  apiBaseUrl?: string;
}

interface AuthenticatedRequestInput {
  token: string;
  apiBaseUrl?: string;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: string;
  level: number;
  total_exp: number;
}

interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  level: number;
  totalExp: number;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export async function register({
  username,
  email,
  password,
  apiBaseUrl = ""
}: RegisterInput): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    body: JSON.stringify({ username, email, password }),
    headers: createAuthHeaders(undefined, true),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Register request failed with status ${response.status}`);
  }

  return normalizeAuthSession((await response.json()) as AuthResponse);
}

export async function login({
  username,
  password,
  apiBaseUrl = ""
}: LoginInput): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    body: JSON.stringify({ username, password }),
    headers: createAuthHeaders(undefined, true),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Login request failed with status ${response.status}`);
  }

  return normalizeAuthSession((await response.json()) as AuthResponse);
}

export async function getCurrentUser({
  token,
  apiBaseUrl = ""
}: AuthenticatedRequestInput): Promise<AuthUser> {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: createAuthHeaders(token)
  });

  if (!response.ok) {
    throw new Error(`Current user request failed with status ${response.status}`);
  }

  return normalizeUser((await response.json()) as UserResponse);
}

export async function logout({
  token,
  apiBaseUrl = ""
}: AuthenticatedRequestInput): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    headers: createAuthHeaders(token),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Logout request failed with status ${response.status}`);
  }
}

function normalizeAuthSession(response: AuthResponse): AuthSession {
  return {
    token: response.token,
    user: normalizeUser(response.user)
  };
}

function normalizeUser(response: UserResponse): AuthUser {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    createdAt: response.created_at,
    level: response.level,
    totalExp: response.total_exp
  };
}
