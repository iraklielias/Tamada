import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import QvevriIcon from "@/components/icons/QvevriIcon";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { GeorgianRegion, ExperienceLevel, OccasionType } from "@/types";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Award,
  PartyPopper,
  Sparkles,
} from "lucide-react";

const REGIONS: { id: GeorgianRegion; name_ka: string; name_en: string }[] = [
  { id: "kakheti", name_ka: "კახეთი", name_en: "Kakheti" },
  { id: "imereti", name_ka: "იმერეთი", name_en: "Imereti" },
  { id: "kartli", name_ka: "ქართლი", name_en: "Kartli" },
  { id: "racha", name_ka: "რაჭა-ლეჩხუმი", name_en: "Racha-Lechkhumi" },
  { id: "samegrelo", name_ka: "სამეგრელო", name_en: "Samegrelo" },
  { id: "guria", name_ka: "გურია", name_en: "Guria" },
  { id: "adjara", name_ka: "აჭარა", name_en: "Adjara" },
  { id: "svaneti", name_ka: "სვანეთი", name_en: "Svaneti" },
  { id: "meskheti", name_ka: "მესხეთი", name_en: "Meskheti" },
];

const EXPERIENCE_LEVELS: {
  id: ExperienceLevel;
  emoji: string;
  name_ka: string;
  desc_ka: string;
}[] = [
  { id: "beginner", emoji: "🌱", name_ka: "დამწყები", desc_ka: "სუფრის ტრადიციებს ვსწავლობ" },
  { id: "intermediate", emoji: "📖", name_ka: "საშუალო", desc_ka: "რამდენიმე სუფრა მიმართავს" },
  { id: "experienced", emoji: "🍷", name_ka: "გამოცდილი", desc_ka: "რეგულარულად ვმართავ სუფრებს" },
  { id: "master", emoji: "👑", name_ka: "ოსტატი", desc_ka: "პროფესიონალი თამადა ვარ" },
];

const OCCASIONS: { id: OccasionType; emoji: string; name_ka: string }[] = [
  { id: "supra", emoji: "🍷", name_ka: "სუფრა" },
  { id: "wedding", emoji: "💒", name_ka: "ქორწილი" },
  { id: "birthday", emoji: "🎂", name_ka: "დაბადების დღე" },
  { id: "memorial", emoji: "🕯️", name_ka: "ქელეხი" },
  { id: "christening", emoji: "⛪", name_ka: "ნათლობა" },
  { id: "guest_reception", emoji: "🏠", name_ka: "სტუმრის მიღება" },
  { id: "holiday", emoji: "🎄", name_ka: "სადღესასწაულო" },
  { id: "corporate", emoji: "🏢", name_ka: "კორპორატიული" },
  { id: "friendly_gathering", emoji: "🤝", name_ka: "მეგობრული შეკრება" },
  { id: "other", emoji: "✨", name_ka: "სხვა" },
];

const TOTAL_STEPS = 4;

/* Step icon illustrations */
const stepIcons: Record<number, React.ReactNode> = {
  1: <HornIcon size={36} className="text-primary-foreground" />,
  2: <MapPin className="h-9 w-9 text-primary-foreground" />,
  3: <Award className="h-9 w-9 text-primary-foreground" />,
  4: <PartyPopper className="h-9 w-9 text-primary-foreground" />,
};

import type { Easing } from "framer-motion";

const stepEase: Easing = [0, 0, 0.2, 1];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: stepEase } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

const OnboardingWizard: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [language, setLanguage] = useState<"ka" | "en">(
    (profile?.preferred_language as "ka" | "en") || "ka"
  );
  const [region, setRegion] = useState<GeorgianRegion | "none" | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<OccasionType[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSkeleton variant="card" className="w-64" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/dashboard" replace />;

  const canProceedStep1 = displayName.trim().length > 0;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const toggleOccasion = (id: OccasionType) => {
    setSelectedOccasions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        preferred_language: language,
        region: region === "none" ? null : region,
        experience_level: experienceLevel,
        typical_occasions: selectedOccasions.length > 0 ? selectedOccasions : null,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("შეცდომა მოხდა. სცადეთ თავიდან.");
      setSaving(false);
      return;
    }

    await refreshProfile();
    toast.success("გილოცავთ! თქვენი პროფილი მზადაა 🍷");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Header with progress ─── */}
      <div className="w-full px-6 pt-6 pb-2">
        <div className="max-w-lg mx-auto">
          {/* Step icon + progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                key={step}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-12 h-12 rounded-xl wine-gradient flex items-center justify-center shadow-wine"
              >
                {stepIcons[step]}
              </motion.div>
              <div>
                <p className="text-caption text-muted-foreground">
                  ნაბიჯი {step}/{TOTAL_STEPS}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full overflow-hidden bg-border"
              >
                <motion.div
                  className="h-full wine-gradient rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Step content ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Welcome & Name ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="font-display text-heading-1 text-foreground mb-2">
                    მოგესალმებით, თამადა! 🍷
                  </h1>
                  <p className="text-body text-muted-foreground">
                    Welcome! Let's set up your profile.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border">
                  <Label
                    htmlFor="displayName"
                    className="text-body-sm text-foreground font-semibold"
                  >
                    თქვენი სახელი *
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="მაგ. გიორგი"
                    className="mt-2 h-12 text-base bg-surface-1 border-border focus:bg-background transition-colors"
                    autoFocus
                  />

                  <Label className="text-body-sm text-foreground font-semibold mt-5 block">
                    ენა / Language
                  </Label>
                  <div className="flex gap-3 mt-2">
                    {(["ka", "en"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`flex-1 h-12 rounded-xl border-2 text-body-sm font-semibold transition-all duration-150 ${
                          language === lang
                            ? "border-primary bg-accent text-accent-foreground shadow-card"
                            : "border-border bg-card text-muted-foreground hover:border-wine-muted"
                        }`}
                      >
                        {lang === "ka" ? "🇬🇪 ქართული" : "🇬🇧 English"}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  variant="wine"
                  className="w-full h-12 text-base"
                >
                  გაგრძელება <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* ── Step 2: Region ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="font-display text-heading-1 text-foreground mb-2">
                    თქვენი რეგიონი
                  </h2>
                  <p className="text-body text-muted-foreground">
                    აირჩიეთ თქვენთვის სასურველი ღვინის რეგიონი
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRegion(r.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                        region === r.id
                          ? "border-primary bg-accent shadow-card"
                          : "border-border bg-card hover:border-wine-muted hover:shadow-card"
                      }`}
                    >
                      <p className="font-semibold text-foreground text-body-sm">
                        {r.name_ka}
                      </p>
                      <p className="text-caption text-muted-foreground">{r.name_en}</p>
                    </button>
                  ))}
                  <button
                    onClick={() => setRegion("none")}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-150 col-span-2 ${
                      region === "none"
                        ? "border-primary bg-accent shadow-card"
                        : "border-border bg-card hover:border-wine-muted hover:shadow-card"
                    }`}
                  >
                    <p className="font-semibold text-foreground text-body-sm">
                      არ მაქვს უპირატესობა
                    </p>
                    <p className="text-caption text-muted-foreground">No preference</p>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="h-12 px-4">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="wine"
                    className="flex-1 h-12"
                  >
                    გაგრძელება <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="h-12 text-muted-foreground"
                  >
                    გამოტოვება
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Experience ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="font-display text-heading-1 text-foreground mb-2">
                    გამოცდილება
                  </h2>
                  <p className="text-body text-muted-foreground">
                    როგორი გამოცდილება გაქვთ სუფრის მართვაში?
                  </p>
                </div>

                <div className="space-y-3">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-center gap-4 ${
                        experienceLevel === lvl.id
                          ? "border-primary bg-accent shadow-card"
                          : "border-border bg-card hover:border-wine-muted hover:shadow-card"
                      }`}
                    >
                      <span className="text-2xl">{lvl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{lvl.name_ka}</p>
                        <p className="text-caption text-muted-foreground">
                          {lvl.desc_ka}
                        </p>
                      </div>
                      {experienceLevel === lvl.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Check className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="h-12 px-4">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="wine"
                    className="flex-1 h-12"
                  >
                    გაგრძელება <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="h-12 text-muted-foreground"
                  >
                    გამოტოვება
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Occasions ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="font-display text-heading-1 text-foreground mb-2">
                    შემთხვევები
                  </h2>
                  <p className="text-body text-muted-foreground">
                    რა ტიპის სუფრებს მართავთ ჩვეულებრივ? (მრავალი არჩევანი)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => toggleOccasion(occ.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-150 relative overflow-hidden ${
                        selectedOccasions.includes(occ.id)
                          ? "border-primary bg-accent shadow-card"
                          : "border-border bg-card hover:border-wine-muted hover:shadow-card"
                      }`}
                    >
                      {selectedOccasions.includes(occ.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </motion.div>
                      )}
                      <span className="text-xl mb-1.5 block">{occ.emoji}</span>
                      <p className="font-semibold text-foreground text-body-sm">
                        {occ.name_ka}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="h-12 px-4">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="flex-1 h-12 text-base"
                    variant="wine"
                  >
                    {saving ? (
                      "შენახვა..."
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-1" />
                        დასრულება
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleComplete}
                    disabled={saving}
                    className="h-12 text-muted-foreground"
                  >
                    გამოტოვება
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
