import { useState } from "react";
import { useAuth } from "../../app/auth/hooks/useAuth";
import { getTenantDomain } from "../../helper/getTenantDomain";
import kittySvg from "../../assets/svg/kitty.svg";

type AuthMode = "login" | "bootstrap";

export const LoginScreen = () => {
  const { login, bootstrap, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [bootstrapForm, setBootstrapForm] = useState({
    tenantName: "",
    tenantSlug: "",
    username: "admin",
    password: "",
    email: "",
    adminName: "Administrador",
  });

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = getTenantDomain()?.trim();
    login({
      username: loginForm.username.trim(),
      password: loginForm.password,
      ...(tenant ? { tenant } : {}),
    });
  };

  const onBootstrapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bootstrap({
      ...bootstrapForm,
      tenantName: bootstrapForm.tenantName.trim(),
      tenantSlug: bootstrapForm.tenantSlug.trim(),
      username: bootstrapForm.username.trim(),
      email: bootstrapForm.email.trim(),
      adminName: bootstrapForm.adminName.trim(),
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-pink-100 rounded-4xl shadow-[0_16px_50px_rgba(255,182,193,0.28)] p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-white rounded-full shadow-sm p-2 w-16 h-16 border border-pink-100 overflow-hidden">
            <img src={kittySvg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#2c2338] tracking-tight">Spa Glow Kitty</h1>
            <p className="text-sm text-[#8f889c] font-medium mt-1">
              {mode === "login" ? "Inicia sesión en tu tenant" : "Crear tenant (primera vez)"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-pink-50/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              mode === "login" ? "bg-white text-[#ff1f68] shadow-sm" : "text-[#584f66]"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("bootstrap")}
            className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              mode === "bootstrap" ? "bg-white text-[#ff1f68] shadow-sm" : "text-[#584f66]"
            }`}
          >
            Bootstrap
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={onLoginSubmit} className="space-y-4">
            <Field
              label="Usuario"
              value={loginForm.username}
              onChange={(v) => setLoginForm((s) => ({ ...s, username: v }))}
              autoComplete="username"
              required
            />
            <Field
              label="Contraseña"
              type="password"
              value={loginForm.password}
              onChange={(v) => setLoginForm((s) => ({ ...s, password: v }))}
              autoComplete="current-password"
              required
            />
            <SubmitButton loading={loading} label="Entrar" />
          </form>
        ) : (
          <form onSubmit={onBootstrapSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pink-scrollbar pr-1">
            <Field
              label="Nombre del spa"
              value={bootstrapForm.tenantName}
              onChange={(v) => setBootstrapForm((s) => ({ ...s, tenantName: v }))}
              required
            />
            <Field
              label="Slug"
              value={bootstrapForm.tenantSlug}
              onChange={(v) => setBootstrapForm((s) => ({ ...s, tenantSlug: v }))}
              placeholder="mi-spa"
              required
            />
            <Field
              label="Usuario admin"
              value={bootstrapForm.username}
              onChange={(v) => setBootstrapForm((s) => ({ ...s, username: v }))}
              required
            />
            <Field
              label="Contraseña"
              type="password"
              value={bootstrapForm.password}
              onChange={(v) => setBootstrapForm((s) => ({ ...s, password: v }))}
              required
            />
            <Field
              label="Email"
              type="email"
              value={bootstrapForm.email}
              onChange={(v) => setBootstrapForm((s) => ({ ...s, email: v }))}
              required
            />
            <Field
              label="Nombre admin"
              value={bootstrapForm.adminName}
              onChange={(v) => setBootstrapForm((s) => ({ ...s, adminName: v }))}
              required
            />
            <SubmitButton loading={loading} label="Crear e iniciar" />
          </form>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) => (
  <label className="block">
    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a59eb2] px-1">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-[#2c2338] outline-none focus:ring-2 focus:ring-[#ff1f68]/20 focus:border-[#ff1f68]/40"
    />
  </label>
);

const SubmitButton = ({ loading, label }: { loading: boolean; label: string }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full mt-2 rounded-2xl bg-[#ff1f68] text-white font-black py-3.5 text-sm tracking-wide hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
  >
    {loading ? "Procesando..." : label}
  </button>
);

export default LoginScreen;
