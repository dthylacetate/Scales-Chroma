import { type ReactNode, useEffect, useState } from "react";

import { TheorySandbox } from "./pages/TheorySandbox";
import { type AuthSession, getCurrentUser, login, logout, register } from "./services/authApi";

const AUTH_STORAGE_KEY = "scales-chroma-auth-token";
const DEV_PORTS = new Set(["4173", "5173", "5174"]);

export function App() {
  const apiBaseUrl = resolveApiBaseUrl();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(apiBaseUrl));

  useEffect(() => {
    if (!apiBaseUrl) {
      setAuthLoading(false);
      return;
    }

    const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedToken) {
      setAuthLoading(false);
      return;
    }

    getCurrentUser({ apiBaseUrl, token: storedToken })
      .then((user) => {
        setSession({ token: storedToken, user });
      })
      .catch(() => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setSession(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [apiBaseUrl]);

  if (!apiBaseUrl) {
    return <TheorySandbox />;
  }

  if (authLoading) {
    return <AuthShell title="Scales & Chroma" subtitle="正在恢复你的会话..." />;
  }

  if (!session) {
    return (
      <AuthScreen
        apiBaseUrl={apiBaseUrl}
        onAuthenticated={(nextSession) => {
          window.localStorage.setItem(AUTH_STORAGE_KEY, nextSession.token);
          setSession(nextSession);
        }}
      />
    );
  }

  return (
    <TheorySandbox
      apiBaseUrl={apiBaseUrl}
      authToken={session.token}
      currentUsername={session.user.username}
      onLogout={async () => {
        try {
          await logout({ apiBaseUrl, token: session.token });
        } finally {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
          setSession(null);
        }
      }}
    />
  );
}

function resolveApiBaseUrl(): string | undefined {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window === "undefined" || window.location.protocol === "file:") {
    return undefined;
  }

  if (DEV_PORTS.has(window.location.port)) {
    return undefined;
  }

  return window.location.origin;
}

interface AuthScreenProps {
  apiBaseUrl: string;
  onAuthenticated: (session: AuthSession) => void;
}

function AuthScreen({ apiBaseUrl, onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell
      title="Scales & Chroma"
      subtitle={mode === "login" ? "登录后进入你的专属音乐沙盘" : "创建账号后开始积累你的练习与视觉成长"}
    >
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
            const nextSession =
              mode === "login"
                ? await login({ apiBaseUrl, username: username.trim(), password })
                : await register({
                    apiBaseUrl,
                    username: username.trim(),
                    email: email.trim(),
                    password
                  });
            onAuthenticated(nextSession);
          } catch {
            setError(mode === "login" ? "登录失败" : "注册失败");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <AuthInput label="用户名" type="text" value={username} onChange={setUsername} />
        {mode === "register" ? <AuthInput label="邮箱" type="email" value={email} onChange={setEmail} /> : null}
        <AuthInput label="密码" type="password" value={password} onChange={setPassword} />
        <button
          className="h-11 rounded-md bg-[#5bd0c7] text-sm font-semibold text-[#091113] transition hover:bg-[#7ef3ea] disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {mode === "login" ? "登录" : "注册"}
        </button>
        <button
          className="h-10 rounded-md border border-[#3f3144] bg-[#201922] text-sm text-stone-200 transition hover:border-[#ffd166]"
          type="button"
          onClick={() => {
            setMode((current) => (current === "login" ? "register" : "login"));
            setError(null);
          }}
        >
          {mode === "login" ? "切换到注册" : "切换到登录"}
        </button>
        {error ? <div className="text-sm text-[#ff8fa3]">{error}</div> : null}
      </form>
    </AuthShell>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#120f12] px-4 py-8 text-stone-100">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-[#5bd0c7]/20 bg-[#18131b] p-6">
          <h1 className="text-4xl font-semibold tracking-normal text-stone-50">{title}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-300">{subtitle}</p>
          <div className="mt-6 grid gap-3 text-sm text-stone-400">
            <div className="rounded-md border border-[#3f3144] bg-[#201922] px-3 py-2">拖拽组合乐理积木</div>
            <div className="rounded-md border border-[#3f3144] bg-[#201922] px-3 py-2">实时观察视觉情绪反馈</div>
            <div className="rounded-md border border-[#3f3144] bg-[#201922] px-3 py-2">把练习成长沉淀成永久视觉能力</div>
          </div>
        </div>
        <div className="rounded-lg border border-[#d8a657]/20 bg-[#18131b]/95 p-6">{children}</div>
      </section>
    </main>
  );
}

interface AuthInputProps {
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
}

function AuthInput({ label, type, value, onChange }: AuthInputProps) {
  return (
    <label className="grid gap-1 text-sm text-stone-300">
      <span>{label}</span>
      <input
        className="h-10 rounded-md border border-[#3f3144] bg-[#201922] px-3 text-sm text-stone-100 outline-none transition focus:border-[#5bd0c7]"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
