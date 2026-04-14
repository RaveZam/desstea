"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { login, signup } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [signinState, signinAction, signinPending] = useActionState(login, undefined);
  const [signupState, signupAction, signupPending] = useActionState(signup, undefined);

  const state = mode === "signin" ? signinState : signupState;
  const action = mode === "signin" ? signinAction : signupAction;
  const pending = mode === "signin" ? signinPending : signupPending;

  return (
    <div className="min-h-screen bg-[#FDFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EDE8E3] p-8 shadow-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-3 overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="DessTea"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            DessTea
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Form */}
        <form key={mode} action={action} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="display_name" className="block text-xs font-medium text-gray-700 mb-1.5">
                Name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-3 py-2.5 text-sm border border-[#EDE8E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8692A]/30 focus:border-[#E8692A] transition-colors"
                placeholder="Your full name"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 text-sm border border-[#EDE8E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8692A]/30 focus:border-[#E8692A] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full px-3 py-2.5 text-sm border border-[#EDE8E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8692A]/30 focus:border-[#E8692A] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#E8692A] hover:bg-[#d45f25] disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {pending
              ? mode === "signin"
                ? "Signing in…"
                : "Creating account…"
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-[#E8692A] font-medium hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
