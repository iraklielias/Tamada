import React, { useState } from "react";
import { Link, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { lovable } from "@/integrations/lovable/index";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SystemIcon from "@/components/SystemIcon";

const SignupPage: React.FC = () => {
  const { user, loading, signUp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; confirm?: boolean }>({});

  if (!loading && user) return <Navigate to={redirectTo} replace />;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  const confirmValid = confirmPassword === password && confirmPassword.length > 0;
  const emailError = touched.email && email.length > 0 && !emailValid;
  const passwordError = touched.password && password.length > 0 && !passwordValid;
  const confirmError = touched.confirm && confirmPassword.length > 0 && !confirmValid;

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    if (!emailValid || !passwordValid) return;
    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error.message || t("auth.signupFailed"));
    } else {
      toast.success(t("auth.signupSuccess"));
    }
    setSubmitting(false);
  };

  const handleGoogleSignup = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(t("auth.googleSignupFailed"));
    }
  };

  const loginLink = redirectTo !== "/dashboard"
    ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/auth/login";

  return (
    <AuthLayout>
      <div>
        <h2 className="font-display text-heading-1 text-foreground mb-2">
          {t("auth.signupTitle")}
        </h2>
        <p className="text-body text-muted-foreground mb-8">
          {t("auth.createAccountDesc")}
        </p>

        <Button
          variant="outline"
          className="w-full h-12 text-sm font-semibold mb-6 hover:bg-surface-1 transition-colors"
          onClick={handleGoogleSignup}
          type="button"
        >
          <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t("auth.googleSignup")}
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-caption text-muted-foreground">
              {t("auth.or")}
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-body-sm text-foreground font-semibold">
              {t("auth.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              placeholder="tamada@example.com"
              required
              className={`mt-2 h-12 text-base bg-surface-1 border-border focus:bg-background transition-colors ${emailError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
            />
            {emailError && (
              <p className="text-xs text-destructive mt-1">{t("auth.invalidEmail", "Invalid email address")}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password" className="text-body-sm text-foreground font-semibold">
              {t("auth.password")}
            </Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                required
                minLength={6}
                className={`h-12 text-base bg-surface-1 border-border focus:bg-background transition-colors pr-11 ${passwordError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SystemIcon name={showPassword ? "action.visibilityOff" : "action.visibility"} size="sm" />
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive mt-1">{t("auth.passwordMinLength")}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-body-sm text-foreground font-semibold">
              {t("auth.confirmPassword")}
            </Label>
            <div className="relative mt-2">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                placeholder="••••••••"
                required
                minLength={6}
                className={`h-12 text-base bg-surface-1 border-border focus:bg-background transition-colors pr-11 ${confirmError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SystemIcon name={showConfirm ? "action.visibilityOff" : "action.visibility"} size="sm" />
              </button>
            </div>
            {confirmError && (
              <p className="text-xs text-destructive mt-1">{t("auth.passwordMismatch")}</p>
            )}
          </div>
          <Button
            type="submit"
            variant="wine"
            className="w-full h-12 text-base"
            disabled={submitting}
          >
            {submitting ? t("auth.signingUp") : t("auth.signupButton")}
            {!submitting && <SystemIcon name="action.next" size="sm" className="ml-1" />}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-body-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link
              to={loginLink}
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              {t("auth.loginButton")}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
