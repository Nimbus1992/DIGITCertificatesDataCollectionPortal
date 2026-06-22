import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowHeader } from "@/components/citizen/FlowHeader";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { login, setName, isAuthenticated, needsName } = useAuth();
  const [stage, setStage] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [name, setNameLocal] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!resendIn) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  useEffect(() => {
    if (isAuthenticated && !needsName) navigate({ to: "/home" });
    if (isAuthenticated && needsName) setStage("name");
  }, [isAuthenticated, needsName, navigate]);

  function sendOtp() {
    setErr(null);
    if (!/^[6-8]\d{8}$/.test(phone)) {
      setErr("Enter a 9-digit SA mobile (drop leading 0)");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentOtp(code);
    setStage("otp");
    setResendIn(30);
    // Dev-only surface
    console.info("[CCT] OTP:", code);
    toast.success(`OTP sent · ${code} (demo)`);
  }

  function verifyOtp() {
    setErr(null);
    if (otp !== sentOtp) {
      setErr("Incorrect OTP");
      return;
    }
    const session = login(phone);
    if (!session.name) setStage("name");
    else navigate({ to: "/home" });
  }

  function saveName() {
    setErr(null);
    if (name.trim().length < 2) {
      setErr("Enter your name");
      return;
    }
    setName(name.trim());
    navigate({ to: "/home" });
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-card">
      <FlowHeader title="City of Cape Town" showBack={stage !== "phone"} onBack={() => setStage(stage === "name" ? "otp" : "phone")} />

      <main className="flex-1 px-5 pt-6 pb-10">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-orange">
          {stage === "phone" ? "Sign in" : stage === "otp" ? "Verify OTP" : "Welcome"}
        </div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">
          {stage === "phone" && "Enter your mobile number"}
          {stage === "otp" && `OTP sent to +27-${phone}`}
          {stage === "name" && "What should we call you?"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {stage === "phone" && "We’ll send a one-time password to sign you in."}
          {stage === "otp" && "Enter the 6-digit code to continue."}
          {stage === "name" && "Your name will appear on receipts and certificates."}
        </p>

        <div className="mt-6 space-y-4">
          {stage === "phone" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile Number</label>
              <div className="flex">
                <span className="grid min-w-[64px] place-items-center rounded-l-md border border-r-0 border-input bg-surface-muted text-sm font-semibold text-muted-foreground">+27</span>
                <input
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-r-md border border-input bg-card px-3 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                  placeholder="821234567"
                />
              </div>
              {err && <p className="mt-1.5 text-xs text-destructive">{err}</p>}
              <button
                onClick={sendOtp}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-orange text-sm font-semibold text-brand-orange-foreground"
              >
                Send OTP
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">By continuing you agree to our Terms of Use.</p>
            </div>
          )}

          {stage === "otp" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">One-Time Password</label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-input bg-card px-3 py-3 text-center text-lg font-semibold tracking-[0.5em] focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                placeholder="••••••"
              />
              {err && <p className="mt-1.5 text-xs text-destructive">{err}</p>}
              <button
                onClick={verifyOtp}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-orange text-sm font-semibold text-brand-orange-foreground"
              >
                Verify & Continue
              </button>
              <button
                disabled={resendIn > 0}
                onClick={sendOtp}
                className="mt-3 inline-flex w-full items-center justify-center text-xs font-semibold text-brand-teal disabled:text-muted-foreground"
              >
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
              </button>
            </div>
          )}

          {stage === "name" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</label>
              <input
                value={name}
                onChange={(e) => setNameLocal(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                placeholder="Your name"
              />
              {err && <p className="mt-1.5 text-xs text-destructive">{err}</p>}
              <button
                onClick={saveName}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-orange text-sm font-semibold text-brand-orange-foreground"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}