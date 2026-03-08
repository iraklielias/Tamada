import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ArrowRight, Wine, Sparkles, ChevronDown } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import HeroMockupStory from "@/components/HeroMockupStory";
import WineGlassIcon from "@/components/icons/WineGlassIcon";

/* ═══════════════════════════════════════════
   TYPING HOOK
   ═══════════════════════════════════════════ */
function useTyping(text: string, active: boolean, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, text, speed]);
  return displayed;
}

/* ═══════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════ */
type DemoState = "idle" | "pick" | "generating" | "result";

interface Occasion {
  emoji: string;
  labelKa: string;
  labelEn: string;
  type: string;
}

const OCCASIONS: Occasion[] = [
  { emoji: "💒", labelKa: "ქორწილი", labelEn: "Wedding", type: "wedding" },
  { emoji: "🎂", labelKa: "დაბადების დღე", labelEn: "Birthday", type: "birthday" },
  { emoji: "🤝", labelKa: "მეგობარს", labelEn: "Friendship", type: "friendship" },
  { emoji: "🏠", labelKa: "სტუმარს", labelEn: "Guest", type: "guest_welcome" },
];

const FALLBACK_TOAST = {
  title: "სადღეგრძელო",
  body: "ძველ ქართულ სიტყვაში ნათქვამია: „სტუმარი ღვთისაა." დღეს ამ სუფრასთან შევიკრიბეთ, რომ ერთმანეთს სითბო გავუზიაროთ. იყოს ეს საღამო იმის დასტური, რომ ადამიანის ცხოვრებაში ყველაზე ძვირფასი საჩუქარი — ერთმანეთის გვერდით ყოფნაა. გაუმარჯოს!",
};

const STEP_LABELS_KA = ["აირჩიე", "იქმნება", "შედეგი"];
const STEP_LABELS_EN = ["Pick", "Generating", "Result"];

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const crossfade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.35, ease: "easeIn" } },
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
interface HeroInteractiveDemoProps {
  active?: boolean;
  language?: "ka" | "en";
}

export default function HeroInteractiveDemo({ active = false, language = "ka" }: HeroInteractiveDemoProps) {
  const [state, setState] = useState<DemoState>("idle");
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [toastTitle, setToastTitle] = useState("");
  const [toastBody, setToastBody] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [showShimmer, setShowShimmer] = useState(true);
  const cacheRef = useRef<Record<string, { title: string; body: string }>>({});

  const isKa = language === "ka";
  const stepLabels = isKa ? STEP_LABELS_KA : STEP_LABELS_EN;

  // Typing hooks
  const typedTitle = useTyping(toastTitle, state === "generating" && !showShimmer, 40);
  const typedBody = useTyping(toastBody, state === "generating" && !showShimmer && typedTitle === toastTitle, 18);

  // Track when typing is complete
  useEffect(() => {
    if (state === "generating" && typedBody.length > 0 && typedBody === toastBody) {
      const timer = setTimeout(() => setIsTypingDone(true), 1000);
      return () => clearTimeout(timer);
    }
    setIsTypingDone(false);
  }, [state, typedBody, toastBody]);

  // Auto-advance from generating to result
  useEffect(() => {
    if (isTypingDone && state === "generating") {
      setState("result");
    }
  }, [isTypingDone, state]);

  const handleTryIt = useCallback(() => {
    setState("pick");
  }, []);

  const handlePickOccasion = useCallback(async (occasion: Occasion) => {
    setSelectedOccasion(occasion);
    setToastTitle("");
    setToastBody("");
    setShowShimmer(true);
    setState("generating");

    // Check cache
    if (cacheRef.current[occasion.type]) {
      const cached = cacheRef.current[occasion.type];
      setTimeout(() => {
        setToastTitle(cached.title);
        setToastBody(cached.body);
        setShowShimmer(false);
      }, 1200);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("tamada-ai", {
        body: {
          action: "generate_toast",
          generation_params: {
            occasion_type: occasion.type,
            formality_level: "formal",
            language: language,
          },
        },
      });

      if (error || !data?.toast_text) throw new Error("API failed");

      const title = data.toast_title || (isKa ? "სადღეგრძელო" : "Toast");
      const body = (data.toast_text || "")
        .replace(/===TOAST_START===|===TOAST_END===/g, "")
        .replace(/---/g, "")
        .trim();

      cacheRef.current[occasion.type] = { title, body };
      setToastTitle(title);
      setToastBody(body);
      setShowShimmer(false);
    } catch {
      // Fallback
      const fb = FALLBACK_TOAST;
      cacheRef.current[occasion.type] = { title: fb.title, body: fb.body };
      setToastTitle(fb.title);
      setToastBody(fb.body);
      setShowShimmer(false);
    }
  }, [language, isKa]);

  const handleTryAnother = useCallback(() => {
    setState("pick");
    setSelectedOccasion(null);
    setToastTitle("");
    setToastBody("");
    setIsTypingDone(false);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(toastBody);
    sonnerToast.success(isKa ? "დაკოპირდა!" : "Copied!");
  }, [toastBody, isKa]);

  const currentStep = state === "pick" ? 0 : state === "generating" ? 1 : state === "result" ? 2 : -1;

  return (
    <div className="w-full">
      {/* Browser chrome */}
      <div className="rounded-xl border border-border bg-card shadow-elevated overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-gold/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex-1 mx-3">
            <div className="mx-auto max-w-[200px] h-5 rounded-md bg-background/80 border border-border/50 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground tracking-wide">tamada.ai</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="relative min-h-[300px] sm:min-h-[340px]">
          <AnimatePresence mode="wait">
            {/* ──── IDLE STATE ──── */}
            {state === "idle" && (
              <motion.div key="idle" {...crossfade} className="relative">
                <HeroMockupStory active={active} />
                {/* Overlay CTA */}
                <motion.button
                  onClick={handleTryIt}
                  className="absolute inset-x-0 bottom-0 pb-6 pt-16 flex flex-col items-center gap-2 cursor-pointer"
                  style={{ background: "linear-gradient(to top, hsl(var(--card)) 30%, transparent 100%)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.6 }}
                >
                  <motion.span
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-card"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isKa ? "სცადე ახლავე" : "Try It Now"}
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </motion.button>
              </motion.div>
            )}

            {/* ──── STEP 1: PICK OCCASION ──── */}
            {state === "pick" && (
              <motion.div key="pick" {...crossfade} className="p-5 sm:p-6 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Wine className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-display font-bold text-foreground">
                    {isKa ? "აირჩიე შემთხვევა" : "Pick an Occasion"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-5 text-center">
                  {isKa ? "და AI შექმნის შენთვის სადღეგრძელოს" : "and AI will craft a toast just for you"}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                  {OCCASIONS.map((o) => (
                    <motion.button
                      key={o.type}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePickOccasion(o)}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <span className="text-lg">{o.emoji}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {isKa ? o.labelKa : o.labelEn}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ──── STEP 2: GENERATING ──── */}
            {state === "generating" && (
              <motion.div key="generating" {...crossfade} className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {isKa ? "AI ქმნის სადღეგრძელოს..." : "AI is crafting your toast..."}
                  </span>
                </div>

                <div className="rounded-xl border border-primary/20 overflow-hidden bg-card">
                  <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
                  <div className="p-4 space-y-3">
                    {showShimmer ? (
                      /* Shimmer skeletons */
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 w-2/3 rounded bg-muted" />
                        <div className="space-y-2">
                          <div className="h-3 w-full rounded bg-muted" />
                          <div className="h-3 w-5/6 rounded bg-muted" />
                          <div className="h-3 w-4/6 rounded bg-muted" />
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Typed title */}
                        <div className="flex items-center gap-2">
                          <Wine className="w-3.5 h-3.5 text-primary shrink-0" />
                          <h4 className="text-sm font-bold text-foreground">
                            {typedTitle}
                            {typedTitle !== toastTitle && (
                              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                            )}
                          </h4>
                        </div>
                        {/* Typed body */}
                        {typedTitle === toastTitle && (
                          <p className="font-serif text-sm leading-[1.8] text-foreground whitespace-pre-wrap">
                            {typedBody}
                            {typedBody !== toastBody && (
                              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Continue button appears when typing is done */}
                {isTypingDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-4"
                  >
                    <motion.button
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      onClick={() => setState("result")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      {isKa ? "გაგრძელება" : "Continue"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ──── STEP 3: RESULT + CTA ──── */}
            {state === "result" && (
              <motion.div key="result" {...crossfade} className="p-5 sm:p-6">
                {/* Toast card */}
                <div className="rounded-xl border border-primary/20 overflow-hidden shadow-md bg-card">
                  <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wine className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">
                        {selectedOccasion ? (isKa ? selectedOccasion.labelKa : selectedOccasion.labelEn) : ""}
                      </span>
                    </div>

                    <p className="font-serif text-sm leading-[1.8] whitespace-pre-wrap text-foreground">
                      {toastBody}
                    </p>

                    {/* Copy action */}
                    <div className="pt-2 border-t border-border/50">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        {isKa ? "კოპირება" : "Copy"}
                      </button>
                    </div>

                    {/* Attribution */}
                    <div className="flex items-center justify-end gap-1">
                      <WineGlassIcon className="w-3 h-3 text-primary/50" />
                      <span className="text-[11px] font-medium text-primary/50 tracking-wide">
                        Powered by TAMADA AI
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="mt-4 pt-4 border-t border-border/30 text-center space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {isKa ? "მოგეწონა? შექმენი შენი სადღეგრძელო" : "Liked it? Create your own toast"}
                  </p>
                  <a
                    href="/auth/signup"
                    className="inline-flex items-center justify-center w-full h-11 rounded-xl wine-gradient text-primary-foreground text-sm font-semibold shadow-card hover:opacity-90 transition-opacity"
                  >
                    {isKa ? "დაიწყე უფასოდ" : "Get Started Free"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                  <button
                    onClick={handleTryAnother}
                    className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                  >
                    {isKa ? "სხვა სცადე" : "Try another"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──── STEP INDICATORS ──── */}
          {currentStep >= 0 && (
            <div className="flex items-center justify-center gap-3 py-3 border-t border-border/30 bg-muted/30">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "bg-primary scale-110"
                        : i < currentStep
                        ? "bg-primary/40"
                        : "bg-border"
                    }`}
                  />
                  <span
                    className={`text-[11px] transition-colors duration-300 ${
                      i === currentStep
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
