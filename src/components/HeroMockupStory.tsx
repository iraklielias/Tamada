import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HornIcon from "@/components/icons/HornIcon";
import { Sparkles, Check, ArrowRight, ChevronDown, Star, Heart, Mic, Clock, Wine, Send, Pause } from "lucide-react";

/* ═══════════════════════════════════════════
   TYPING HOOK
   ═══════════════════════════════════════════ */
function useSceneTyping(text: string, active: boolean, speed = 35) {
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
   CONFETTI PARTICLES (Alaverdi celebration)
   — Item 6: Bigger particles, more travel, rotation
   ═══════════════════════════════════════════ */
function ConfettiDots({ show }: { show: boolean }) {
  const dots = [
    { color: "hsl(var(--wine-deep))", x: -20, y: -22, delay: 0, rotate: 180 },
    { color: "hsl(var(--gold))", x: 14, y: -26, delay: 0.05, rotate: -150 },
    { color: "hsl(var(--success))", x: 22, y: -12, delay: 0.1, rotate: 120 },
  ];
  return (
    <AnimatePresence>
      {show && dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: d.color }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{ opacity: 0, x: d.x, y: d.y, scale: 0.4, rotate: d.rotate }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: d.delay, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   SHARED ANIMATION VARIANTS
   — Items 1-3: stagger children, entry/exit blur
   ═══════════════════════════════════════════ */
const staggerChild = {
  initial: { opacity: 0, y: 6, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: "easeOut" as const } },
};

const sceneVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: "blur(2px)",
    transition: { duration: 0.4, ease: "easeIn" as const },
  },
};

/* ═══════════════════════════════════════════
   TYPING CURSOR — Item 4: rounded, sine-wave, scale exit
   ═══════════════════════════════════════════ */
function TypingCursor({ active, height = "h-3" }: { active: boolean; height?: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.span
          className={`inline-block w-[2px] ${height} bg-wine-deep ml-0.5 align-middle rounded-full`}
          animate={{ opacity: [1, 0.2, 1] }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   SCENE 1 — AI Generator Form (Selects + Tags)
   ═══════════════════════════════════════════ */
function SceneGenerator({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1200);
    const t3 = setTimeout(() => setStep(3), 1800);
    const t4 = setTimeout(() => setStep(4), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [active]);

  const selects = [
    { label: "შემთხვევა", value: "ქორწილი", icon: "💒" },
    { label: "ფორმალობა", value: "ფორმალური", icon: "🎩" },
    { label: "ტონი", value: "ემოციური ❤️", icon: "💝" },
  ];

  const tags = ["ქორწილი", "ფორმალური", "ემოციური"];

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col">
      <motion.div variants={staggerChild} className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-wine-glow" />
        <span className="text-[11px] font-semibold text-foreground">AI სადღეგრძელო</span>
      </motion.div>

      <div className="space-y-2.5 flex-1">
        {selects.map((s, i) => (
          <motion.div
            key={s.label}
            variants={staggerChild}
            initial="initial"
            animate={step > i ? "animate" : { opacity: 0.3, y: 0, filter: "blur(0px)" }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] text-muted-foreground w-20 shrink-0">{s.label}</span>
            <div className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11px] transition-colors ${
              step > i ? "border-wine-muted/40 bg-wine-light/20 text-foreground font-medium" : "border-border bg-surface-1 text-muted-foreground"
            }`}>
              <span>{step > i ? `${s.icon} ${s.value}` : "აირჩიეთ..."}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 pt-1"
            >
              {tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: i * 0.1 }}
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-wine-light text-wine-deep border border-wine-muted/30"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        variants={staggerChild}
        initial="initial"
        animate={step >= 4 ? "animate" : "initial"}
        className="mt-auto pt-2"
      >
        <motion.div
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg wine-gradient text-white text-[10px] font-semibold"
          animate={step >= 4 ? { boxShadow: ["0 0 0 0 hsla(353,50%,38%,0)", "0 0 10px 3px hsla(353,50%,38%,0.3)", "0 0 0 0 hsla(353,50%,38%,0)"] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        >
          შექმნა <ArrowRight className="h-3 w-3" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 2 — AI Result Card
   ═══════════════════════════════════════════ */
function SceneResult({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0);
  const [showGlow, setShowGlow] = useState(false);
  const title = "ნეფე-პატარძლის სადღეგრძელო";
  const body = "დიდება ღმერთს, რომელმაც მოგვცა ეს დღე — ორი გულის ერთ ცხოვრებად შეკვრის დღე...";
  const typedTitle = useSceneTyping(title, phase >= 1, 30);
  const typedBody = useSceneTyping(body, phase >= 2, 18);

  useEffect(() => {
    if (!active) { setPhase(0); setShowGlow(false); return; }
    const t0 = setTimeout(() => { setPhase(1); setShowGlow(true); }, 1200);
    const t0b = setTimeout(() => setShowGlow(false), 1600);
    const t2 = setTimeout(() => setPhase(2), 2500);
    const t3 = setTimeout(() => setPhase(3), 5000);
    return () => { clearTimeout(t0); clearTimeout(t0b); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col">
      <motion.div variants={staggerChild} className="flex items-center gap-2 mb-2">
        <motion.div animate={active && phase < 2 ? { rotate: [0, 15, -15, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
          <Sparkles className="h-3.5 w-3.5 text-gold" />
        </motion.div>
        <span className="text-[11px] font-semibold text-foreground">შედეგი</span>
        {phase >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 ml-auto">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">მზადაა</span>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={staggerChild} className="relative flex-1">
        <AnimatePresence>
          {showGlow && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{ background: "radial-gradient(circle at center, hsl(var(--wine-glow) / 0.35) 0%, transparent 70%)" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.05, 1.1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="rounded-lg border overflow-hidden relative"
          animate={{
            borderColor: showGlow
              ? "hsl(var(--gold) / 0.6)"
              : "hsl(var(--wine-muted) / 0.25)",
          }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: "hsl(var(--wine-light) / 0.2)" }}
        >
          <div className="h-0.5 wine-gradient" />
          <div className="p-3.5 space-y-2">
            {phase < 1 ? (
              <div className="space-y-2">
                {[100, 70].map((w, i) => (
                  <motion.div key={i} className="h-3 rounded bg-wine-muted/15" style={{ width: `${w}%` }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-[12px] font-bold text-foreground leading-tight">
                  {typedTitle}
                  <TypingCursor active={phase >= 1 && phase < 2} height="h-3" />
                </p>
                {phase >= 2 && (
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    {typedBody}
                    <TypingCursor active={phase >= 2 && phase < 3} height="h-2.5" />
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, y: 4, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="space-y-1.5 mt-auto pt-2">
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2-3 წუთი</span>
              <span className="flex items-center gap-1"><Wine className="h-3 w-3" /> 🥂 მე-3 წინადადება</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
                className="w-6 h-6 rounded-md bg-surface-1 border border-border flex items-center justify-center">
                <Heart className="h-3 w-3 text-muted-foreground" />
              </motion.div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.2 }}
                className="w-6 h-6 rounded-md bg-surface-1 border border-border flex items-center justify-center">
                <Star className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 3 — Live Feast
   — Item 7: Progress bar fade-in
   — Item 11: Spring physics on progress
   ═══════════════════════════════════════════ */
function SceneLiveFeast({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(28);
  const [timer, setTimer] = useState("12:45");
  const [toastIdx, setToastIdx] = useState(0);

  const toasts = [
    { title: "ღვთის სადღეგრძელო", type: "სავალდებულო", body: "უფალო, გმადლობთ ამ დღისთვის..." },
    { title: "სამშობლოს სადღეგრძელო", type: "ტრადიციული", body: "საქართველოს გაუმარჯოს..." },
  ];

  useEffect(() => {
    if (!active) { setProgress(28); setTimer("12:45"); setToastIdx(0); return; }
    const t0 = setTimeout(() => setProgress(34), 800);
    const t1 = setTimeout(() => { setProgress(42); setTimer("12:51"); }, 1600);
    const t1b = setTimeout(() => setProgress(48), 2400);
    const t2 = setTimeout(() => { setToastIdx(1); setProgress(57); setTimer("12:58"); }, 3000);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t1b); clearTimeout(t2); };
  }, [active]);

  const current = toasts[toastIdx];

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col">
      <motion.div variants={staggerChild} className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold text-foreground">ნიკას ქორწილი</span>
        <motion.div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 ml-auto"
          animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[8px] font-bold text-green-600 dark:text-green-400">LIVE</span>
        </motion.div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{timer}</span>
      </motion.div>

      <motion.div variants={staggerChild} className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={toastIdx}
            initial={{ opacity: 0, y: 6, scale: 0.97, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, scale: [0.97, 1.02, 1], filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(2px)" }}
            transition={{ duration: 0.35, scale: { times: [0, 0.6, 1], duration: 0.4 } }}
            className="rounded-lg border border-wine-muted/25 bg-wine-light/15 overflow-hidden"
          >
            <div className="h-0.5 wine-gradient" />
            <div className="p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-foreground">{current.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-wine-light text-wine-deep font-semibold">{current.type}</span>
              </div>
              <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-2">{current.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Progress — Item 7: fade-in, Item 11: spring physics */}
      <motion.div
        variants={staggerChild}
        className="space-y-1.5 mt-auto pt-2"
      >
        <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full wine-gradient rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-medium">{toastIdx + 1}/7 სადღეგრძელო</span>
          <span className="text-[10px] text-wine-deep font-semibold">{progress}%</span>
        </div>
      </motion.div>

      <motion.div variants={staggerChild} className="flex items-center gap-1.5 pt-1.5">
        <span className="text-[9px] px-2.5 py-1 rounded-md bg-surface-1 border border-border text-muted-foreground flex items-center gap-1">
          <Check className="h-2.5 w-2.5" /> დასრულება
        </span>
        <span className="text-[9px] px-2.5 py-1 rounded-md bg-surface-1 border border-border text-muted-foreground flex items-center gap-1">
          <ArrowRight className="h-2.5 w-2.5" /> გამოტოვება
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 4 — Chat Mode
   — Item 5: Directional chat bubble entries
   ═══════════════════════════════════════════ */
function SceneChat({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const aiResponse = "ბატონო, აი ქორწილის სადღეგრძელო: „მზე და მთვარე ერთად...\"";
  const typedResponse = useSceneTyping(aiResponse, step >= 2, 20);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1800);
    const t3 = setTimeout(() => setStep(3), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col">
      <motion.div variants={staggerChild} className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-wine-glow" />
        <span className="text-[11px] font-semibold text-foreground">AI ჩატი</span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold font-bold ml-auto">PRO</span>
      </motion.div>

      <div className="flex-1 space-y-3">
        {/* User bubble — enters from right */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: 16, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-end"
            >
              <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md bg-wine-deep text-white text-[11px] leading-relaxed">
                ქორწილისთვის სადღეგრძელო მინდა
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI bubble — enters from left */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: -16, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="flex justify-start gap-2"
            >
              <div className="w-7 h-7 rounded-full wine-gradient flex items-center justify-center shrink-0">
                <HornIcon size={12} className="text-white" />
              </div>
              <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-bl-md bg-surface-1 border border-border text-[11px] text-foreground leading-relaxed">
                {typedResponse}
                <TypingCursor active={step >= 2 && step < 3} height="h-2.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice chip + input */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 4, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="flex items-center gap-2 mt-auto pt-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border">
              <span className="text-[9px] text-muted-foreground flex-1">დაწერეთ...</span>
              <Send className="h-3 w-3 text-muted-foreground" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-wine-deep flex items-center justify-center"
            >
              <Mic className="h-3.5 w-3.5 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 5 — Alaverdi (Guest Interaction)
   ═══════════════════════════════════════════ */
function SceneAlaverdi({ active }: { active: boolean }) {
  const [count, setCount] = useState(2);
  const [showPlus, setShowPlus] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    if (!active) { setCount(2); setShowPlus(false); setShowConfetti(false); setShowSecond(false); return; }
    const t1 = setTimeout(() => { setCount(3); setShowPlus(true); setShowConfetti(true); }, 1200);
    const t2 = setTimeout(() => { setShowPlus(false); setShowConfetti(false); }, 1800);
    const t3 = setTimeout(() => setShowSecond(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col">
      <motion.div variants={staggerChild} className="flex items-center gap-2 mb-2">
        <Wine className="h-3.5 w-3.5 text-wine-deep" />
        <span className="text-[11px] font-semibold text-foreground">ალავერდი</span>
      </motion.div>

      <div className="space-y-3 flex-1">
        <motion.div variants={staggerChild} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-wine-light/40 border border-wine-muted/25"
          initial="initial" animate={active ? "animate" : "initial"}>
          <div className="w-7 h-7 rounded-full wine-gradient flex items-center justify-center text-white text-[10px] font-bold">გ</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-foreground">გიორგი მამულაშვილი</div>
            <div className="text-[10px] text-muted-foreground">მეჯვარე</div>
          </div>
          <div className="relative flex items-center gap-1">
            <motion.span className="text-xs font-bold text-wine-deep tabular-nums" key={count}
              initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              {count}
            </motion.span>
            <ConfettiDots show={showConfetti} />
            <AnimatePresence>
              {showPlus && (
                <motion.span className="absolute -top-3 right-0 text-[10px] font-bold text-wine-glow"
                  initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -10 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  +1
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSecond && (
            <motion.div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-surface-1 border border-border/50"
              initial={{ opacity: 0, y: 6, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold">ნ</div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-foreground">ნინო ჩხეიძე</div>
                <div className="text-[10px] text-muted-foreground">მოწვეული</div>
              </div>
              <span className="text-xs font-bold text-foreground/50 tabular-nums">1</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN — 5-scene story with all polish
   ═══════════════════════════════════════════ */
const SCENES = [1, 2, 3, 4, 5] as const;
type SceneNum = typeof SCENES[number];

const SCENE_META: { label: string; duration: number }[] = [
  { label: "გენერატორი", duration: 5500 },
  { label: "შედეგი",     duration: 7000 },
  { label: "ლაივ სუფრა", duration: 6000 },
  { label: "AI ჩატი",    duration: 7000 },
  { label: "ალავერდი",   duration: 5000 },
];

export default function HeroMockupStory({ active = false }: { active?: boolean }) {
  const [scene, setScene] = useState<SceneNum>(1);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const hoverRef = useRef(false);

  const advanceScene = useCallback(() => {
    setScene((s) => ((s % 5) + 1) as SceneNum);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!active || paused) return;
    const duration = SCENE_META[scene - 1].duration;
    const id = setTimeout(advanceScene, duration);
    return () => clearTimeout(id);
  }, [active, scene, paused, advanceScene]);

  useEffect(() => {
    if (active) {
      setScene(1);
      setProgressKey(0);
    }
  }, [active]);

  const handleMouseEnter = useCallback(() => {
    hoverRef.current = true;
    setPaused(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    hoverRef.current = false;
    setPaused(false);
  }, []);

  const handleDotClick = useCallback((s: SceneNum) => {
    setScene(s);
    setProgressKey((k) => k + 1);
  }, []);

  const currentDuration = SCENE_META[scene - 1].duration;

  return (
    <div
      className="mockup-browser"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Browser chrome — Item 9: green dot pulse */}
      <div className="mockup-browser-bar">
        <div className="mockup-browser-dot bg-red-400/70" />
        <div className="mockup-browser-dot bg-yellow-400/70" />
        <motion.div
          className="mockup-browser-dot bg-green-400/70"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex-1 ml-3">
          <motion.div initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ duration: 0.3 }}
            className="max-w-[180px] h-5 rounded-md bg-surface-2 flex items-center px-2">
            <span className="text-[9px] text-muted-foreground truncate">tamada.app</span>
          </motion.div>
        </div>
      </div>

      {/* Content — Item 10: pause dimming */}
      <motion.div
        className="p-4 sm:p-5 bg-background min-h-[280px] sm:min-h-[320px] flex flex-col relative"
        animate={{
          opacity: paused && active ? 0.85 : 1,
          filter: paused && active ? "saturate(0.85)" : "saturate(1)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Scene progress bar — Item 7: fade-in */}
        <motion.div
          key={progressKey}
          className="absolute top-0 left-0 h-[2px] wine-gradient z-10"
          initial={{ width: "0%", opacity: 0 }}
          animate={{ width: paused ? undefined : "100%", opacity: 1 }}
          transition={{
            width: { duration: paused ? 0 : currentDuration / 1000, ease: "linear" },
            opacity: { duration: 0.2, delay: 0.1 },
          }}
          style={paused ? {} : undefined}
        />

        {/* Pause indicator */}
        <AnimatePresence>
          {paused && active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-2 right-3 z-20"
            >
              <Pause className="h-3 w-3 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* App bar */}
        <motion.div initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg wine-gradient flex items-center justify-center">
            <HornIcon size={12} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-foreground tracking-tight">თამადა</span>
          <div className="ml-auto h-5 w-5 rounded-full bg-wine-light flex items-center justify-center text-[9px] font-bold text-wine-deep">ნ</div>
        </motion.div>

        {/* Scenes */}
        <div className="flex-1 relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {scene === 1 && <SceneGenerator key="gen" active={active} />}
            {scene === 2 && <SceneResult key="result" active={active} />}
            {scene === 3 && <SceneLiveFeast key="live" active={active} />}
            {scene === 4 && <SceneChat key="chat" active={active} />}
            {scene === 5 && <SceneAlaverdi key="alaverdi" active={active} />}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Scene indicators — Item 8: animated pill widths */}
      <div className="flex items-center justify-center gap-3 py-2.5 border-t border-border/50 bg-surface-1/50">
        {SCENES.map((s, i) => (
          <button
            key={s}
            onClick={() => handleDotClick(s)}
            className="flex flex-col items-center gap-1 group"
          >
            <motion.div
              className="relative h-[5px] overflow-hidden rounded-full"
              animate={{ width: scene === s ? 20 : 6 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  backgroundColor: scene === s
                    ? "hsl(var(--wine-muted) / 0.3)"
                    : "hsl(var(--muted-foreground) / 0.2)",
                }}
                transition={{ duration: 0.2 }}
              />
              {scene === s && (
                <motion.div
                  key={`fill-${progressKey}`}
                  className="absolute inset-y-0 left-0 rounded-full wine-gradient"
                  initial={{ width: "0%" }}
                  animate={{ width: paused ? undefined : "100%" }}
                  transition={{ duration: paused ? 0 : currentDuration / 1000, ease: "linear" }}
                />
              )}
            </motion.div>
            <span className={`text-[8px] leading-none transition-colors ${
              scene === s ? "text-wine-deep font-semibold" : "text-muted-foreground/50"
            }`}>
              {SCENE_META[i].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
