import { TheorySandbox } from "./pages/TheorySandbox";

export function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || undefined;
  const parsedUserId = Number(import.meta.env.VITE_DEMO_USER_ID ?? "1");
  const userId = Number.isFinite(parsedUserId) && parsedUserId > 0 ? parsedUserId : 1;

  return <TheorySandbox apiBaseUrl={apiBaseUrl} userId={apiBaseUrl ? userId : undefined} />;
}
