"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { ArrowRight, Sparkles, Activity, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Normalizar el teléfono: Si tiene 10 dígitos (Colombia), agregar +57. 
    // Si ya empieza con +, dejarlo así.
    let normalizedPhone = phone.trim().replace(/\s+/g, "");
    if (/^\d{10}$/.test(normalizedPhone)) {
      normalizedPhone = `+57${normalizedPhone}`;
    } else if (/^\d{11,}$/.test(normalizedPhone)) {
      // Si tiene más de 10 dígitos pero no tiene +, asumimos que le falta el +
      normalizedPhone = `+${normalizedPhone}`;
    }

    const res = await signIn("credentials", {
      phone: normalizedPhone,
      password,
      redirect: false
    });

    if (res?.error) {
      setLoading(false);
      window.history.replaceState(null, '', '/?error=CredentialsSignin');
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="glass p-8 md:p-12 border border-white/10 rounded-3xl w-full max-w-md animate-fade-in relative z-10 shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8 justify-center">
          <img src="/icon.png" alt="Cashora Logo" className="w-24 h-24 aspect-square object-cover rounded-full border-4 border-indigo-500/30 shadow-2xl animate-float" />
          <h1 className="text-4xl font-black tracking-tighter">Cashora</h1>
        </div>

        <p className="text-gray-400 mb-8 text-center text-sm">
          Ingresa tu número de teléfono para continuar. Si no tienes cuenta, crearemos una automáticamente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Credenciales incorrectas o error de red. Verifica tus datos.</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Número de Teléfono</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
              placeholder="Ej: 3001234567"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-3 font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "Accediendo..." : "Entrar a mi panel"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 flex gap-4 justify-center text-xs text-gray-500">
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> IA</span>
          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Analíticas</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
