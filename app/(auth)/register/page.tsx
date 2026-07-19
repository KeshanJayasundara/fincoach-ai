"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // ADDED
import { registerUser, verifyOTP as verifyOTPAction } from "@/actions/auth";

import AuthLogo from "@/components/auth/AuthLogo";
import AuthSubtitle from "@/components/auth/AuthSubtitle";
import AuthProgress from "@/components/auth/AuthProgress";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthDivider from "@/components/auth/AuthDivider";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import OTPInput from "@/components/auth/OTPInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || password !== confirmPassword) {
      setError("Please fill all fields correctly");
      return;
    }
    setLoading(true);
    setError("");
    const result = await registerUser({ name, email, password });
    if (result.success) {
      setStep(2);
      setTimer(600);
      setError("");
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  };

  // ONLY THIS FUNCTION CHANGED — signIn added after OTP success
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
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        setStep(3);
        setError("");
      } else {
        setError("Account created! Please sign in to continue.");
        router.push("/login");
      }
    } else {
      setError(result.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1635] relative overflow-hidden px-4 py-8" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#5B4FE8_0%,transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#9B93F5_0%,transparent_50%)] opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6 sm:p-8">

          <AuthLogo />
          <AuthSubtitle />

          <h1 className="text-[19px] font-bold text-[#1A1635] tracking-[-0.4px] text-center">Create your account</h1>
          <p className="text-gray-500 text-center text-[13px] mb-8">Start managing your money smarter</p>

          <GoogleButton />
          <AuthDivider />

          <AuthProgress currentStep={step} />

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4a4568] mb-1">Full name</label>
                <input
                  type="text"
                  placeholder="Dr. Kasun Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#d1ccff] rounded-lg bg-[#f8f7ff] text-sm text-[#1a1635]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a4568] mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#d1ccff] rounded-lg bg-[#f8f7ff] text-sm text-[#1a1635]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a4568] mb-1">Password</label>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a4568] mb-1">Confirm password</label>
                <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <input type="checkbox" className="accent-[#5B4FE8]" required />
                <span className="text-[#4a4568]">
                  I agree to the <span className="text-[#5B4FE8]">Terms of Service</span> and <span className="text-[#5B4FE8]">Privacy Policy</span>
                </span>
              </div>
              <AuthButton loading={loading}>
                Send Verification Code →
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
              <div className="text-xs text-gray-500 mb-4">
                Code expires in <strong className="text-[#5B4FE8] font-mono">{formatTimer()}</strong>
              </div>
              <AuthButton loading={loading} onClick={verifyOTP} disabled={otp.join("").length !== 6}>
                Verify &amp; Create Account
              </AuthButton>
              <div className="flex justify-between items-center mt-6 text-xs">
                <button onClick={() => setStep(1)} className="text-[#5B4FE8] font-medium">← Back</button>
                <button onClick={() => { setOtp(["", "", "", "", "", ""]); setTimer(600); }} className="text-[#5B4FE8] font-medium">Resend code</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4 text-[#5B4FE8] flex items-center justify-center">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <div className="font-bold text-xl text-[#1A1635]">Account Created Successfully!</div>
              <p className="text-gray-500 mt-2 mb-8">Let's complete your profile.</p>
              <AuthButton onClick={() => router.push("/onboarding")}>
                Set up profile →
              </AuthButton>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-[#5B4FE8] font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}