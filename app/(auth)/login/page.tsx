"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthLogo from "@/components/auth/AuthLogo";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthDivider from "@/components/auth/AuthDivider";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthHeading from "@/components/auth/AuthHeading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (res?.ok) {
        // Successful login → Redirect to dashboard
        router.push("/dashboard");
        router.refresh(); // Refresh session
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-[#1A1635] relative overflow-hidden px-4 py-8" 
      style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#5B4FE8_0%,transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#9B93F5_0%,transparent_50%)] opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6 sm:p-8">

          <AuthLogo />
          <AuthSubtitle />

          <AuthHeading 
            title="Welcome back" 
            subtitle="Sign in to your account" 
          />

          <GoogleButton />

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4a4568] mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#d1ccff] rounded-lg bg-[#f8f7ff] text-sm text-[#1a1635] placeholder:text-[#c4c1dc] focus:border-[#5b4fe8] focus:bg-white focus:ring-2 focus:ring-[#5b4fe8]/10 outline-none transition"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#4a4568]">Password</label>
                <a 
                  href="/forgot-password" 
                  className="text-[#5B4FE8] text-xs font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}

            <AuthButton 
              loading={loading} 
              disabled={!email || !password}
            >
              Sign in
            </AuthButton>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <a 
              href="/register" 
              className="text-[#5B4FE8] font-medium hover:underline"
            >
              Sign up free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}