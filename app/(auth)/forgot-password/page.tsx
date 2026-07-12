"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyOTP as verifyOTPAction } from "@/actions/auth";

import AuthLogo from "@/components/auth/AuthLogo";
import AuthButton from "@/components/auth/AuthButton";
import OTPInput from "@/components/auth/OTPInput";
import PasswordInput from "@/components/auth/PasswordInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const formatTimer = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setTimer(600);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyOTPAction(email, code);

    if (result.success) {
      setStep(3);
      setError("");
    } else {
      setError(result.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const code = otp.join("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(4);
        setError("");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1635] relative overflow-hidden px-4 py-8" 
         style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#5B4FE8_0%,transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#9B93F5_0%,transparent_50%)] opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6 sm:p-8">

          <AuthLogo />
          <p className="text-center text-[#8B87A8] mt-2">Password Recovery</p>

          <div className="flex items-center justify-between text-xs mb-8 mt-6">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#5B4FE8]' : 'text-gray-400'}`}>
              <div className="w-6 h-6 bg-[#5B4FE8] text-white rounded-full flex items-center justify-center text-[11px] font-bold">1</div>
              <span className="font-semibold">Email</span>
            </div>
            <div className="flex-1 h-px bg-[#eae8fb] mx-3"></div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#5B4FE8]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 2 ? 'bg-[#5B4FE8] text-white' : 'bg-[#eae8fb] text-[#8b87a8]'}`}>2</div>
              <span className="font-semibold">Verify</span>
            </div>
            <div className="flex-1 h-px bg-[#eae8fb] mx-3"></div>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#5B4FE8]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 3 ? 'bg-[#5B4FE8] text-white' : 'bg-[#eae8fb] text-[#8b87a8]'}`}>3</div>
              <span className="font-semibold">New Password</span>
            </div>
          </div>

          <h1 className="text-[19px] font-bold text-[#1A1635] tracking-[-0.4px] text-center">
            {step === 4 ? "Password Reset Successful!" : "Forgot your password?"}
          </h1>
          <p className="text-gray-500 text-center text-[13px] mb-8">
            {step === 4 ? "You can now sign in with your new password." : "We'll send you a reset code"}
          </p>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#d1ccff] rounded-lg bg-[#f8f7ff] text-sm text-[#1a1635]"
                required
              />
              <AuthButton loading={loading}>
                Send Reset Code →
              </AuthButton>
            </form>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-4xl mb-3 text-[#5B4FE8] flex items-center justify-center">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="font-semibold text-[#1A1635]">Check your email</div>
                <div className="text-xs text-gray-500 mt-1">We sent a 6-digit code to <strong>{email}</strong></div>
              </div>

              <OTPInput value={otp} onChange={setOtp} />

              <div className="text-xs text-gray-500 mb-4 mt-4">
                Code expires in <strong className="text-[#5B4FE8] font-mono">{formatTimer()}</strong>
              </div>

              <AuthButton loading={loading} onClick={verifyOTP} disabled={otp.join("").length !== 6}>
                Verify Code →
              </AuthButton>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4a4568] mb-1">New Password</label>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a4568] mb-1">Confirm New Password</label>
                <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <AuthButton loading={loading}>
                Reset Password →
              </AuthButton>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 text-[#5B4FE8] flex items-center justify-center">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <div className="font-bold text-2xl text-[#1A1635]">Password Reset Successful!</div>
              <p className="text-gray-500 mt-3 mb-8">Your password has been updated successfully.</p>
              <AuthButton onClick={() => router.push("/login")}>
                Go to Sign In
              </AuthButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}