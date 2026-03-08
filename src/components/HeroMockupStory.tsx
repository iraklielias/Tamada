import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HornIcon from "@/components/icons/HornIcon";
import { Sparkles, Check, ArrowRight, ChevronDown, Star, Heart, Mic, Clock, Wine, Send } from "lucide-react";

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
   SHARED ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const sceneVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.25 } },
};

/* ═══════════════════════════════════════════
   SCENE 1 — AI Generator Form (Selects + Tags)
   ═══════════════════════════════════════════ */
function SceneGenerator({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 600);
    const t3 = setTimeout(() => setStep(3), 900);
    const t4 = setTimeout(() => setStep(4), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [active]);

  const selects = [
    { label: "შემთხვევა", value: "ქორწილი", icon: "💒" },
    { label: "ფორმალობა", value: "ფორმალური", icon: "🎩" },
    { label: "ტონი", value: "ემოციური ❤️", icon: "💝" },
  ];

  const tags = ["ქორწილი", "ფორმალური", "ემოციური"];

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-3.5 w-3.5 text-wine-glow" />
        <span className="text-[11px] font-semibold text-foreground">AI სადღეგრძელო</span>
      </div>

      {/* Select dropdowns */}
      {selects.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: -8 }}
          animate={step > i ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex items-center gap-2"
        >
          <span className="text-[9px] text-muted-foreground w-16 shrink-0">{s.label}</span>
          <div className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11px] transition-colors ${
            step > i ? "border-wine-muted/40 bg-wine-light/20 text-foreground font-medium" : "border-border bg-surface-1 text-muted-foreground"
          }`}>
            <span>{step > i ? `${s.icon} ${s.value}` : "აირჩიეთ..."}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </motion.div>
      ))}

      {/* Summary tag strip */}
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
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-wine-light text-wine-deep border border-wine-muted/30"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate button */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={step >= 4 ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.3 }}
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
   SCENE 2 — AI Result Card (Title + Body + Guidance)
   ═══════════════════════════════════════════ */
function SceneResult({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0); // 0=shimmer, 1=title, 2=body, 3=guidance
  const title = "ნეფე-პატარძლის სადღეგრძელო";
  const body = "დიდება ღმერთს, რომელმაც მოგვცა ეს დღე — ორი გულის ერთ ცხოვრებად შეკვრის დღე...";
  const typedTitle = useSceneTyping(title, phase >= 1, 30);
  const typedBody = useSceneTyping(body, phase >= 2, 18);

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-2.5">
      <div className="flex items-center gap-2">
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
      </div>

      {/* Result card */}
      <div className="rounded-lg border border-wine-muted/25 bg-wine-light/20 overflow-hidden">
        {/* Wine gradient top border */}
        <div className="h-0.5 wine-gradient" />
        <div className="p-3 space-y-2">
          {phase < 1 ? (
            <div className="space-y-2">
              {[100, 70].map((w, i) => (
                <motion.div key={i} className="h-3 rounded bg-wine-muted/15" style={{ width: `${w}%` }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          ) : (
            <>
              <p className="text-[11px] font-bold text-foreground leading-tight">
                {typedTitle}
                {phase < 2 && <motion.span className="inline-block w-0.5 h-3 bg-wine-deep ml-0.5 align-middle" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />}
              </p>
              {phase >= 2 && (
                <p className="text-[10px] text-foreground/80 leading-relaxed">
                  {typedBody}
                  {phase < 3 && <motion.span className="inline-block w-0.5 h-2.5 bg-wine-deep ml-0.5 align-middle" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delivery guidance */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
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
   SCENE 3 — Live Feast (Toast Card Layout)
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
    const t1 = setTimeout(() => { setProgress(42); setTimer("12:51"); }, 800);
    const t2 = setTimeout(() => { setToastIdx(1); setProgress(57); setTimer("12:58"); }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  const current = toasts[toastIdx];

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-foreground">ნიკას ქორწილი</span>
        <motion.div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/15 ml-auto"
          animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[8px] font-bold text-green-600 dark:text-green-400">LIVE</span>
        </motion.div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{timer}</span>
      </div>

      {/* Current toast card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={toastIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-wine-muted/25 bg-wine-light/15 overflow-hidden"
        >
          <div className="h-0.5 wine-gradient" />
          <div className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-foreground">{current.title}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wine-light text-wine-deep font-semibold">{current.type}</span>
            </div>
            <p className="text-[10px] text-foreground/70 leading-relaxed line-clamp-2">{current.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
          <motion.div className="h-full wine-gradient rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground font-medium">{toastIdx + 1}/7 სადღეგრძელო</span>
          <span className="text-[9px] text-wine-deep font-semibold">{progress}%</span>
        </div>
      </div>

      {/* Host controls hint */}
      <div className="flex items-center gap-1.5">
        {["✓ დასრულება", "⏭ გამოტოვება"].map((label) => (
          <span key={label} className="text-[8px] px-2 py-1 rounded-md bg-surface-1 border border-border text-muted-foreground">{label}</span>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 4 — Chat Mode (Bubbles + Voice)
   ═══════════════════════════════════════════ */
function SceneChat({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const aiResponse = "ბატონო, აი ქორწილის სადღეგრძელო: „მზე და მთვარე ერთად...\"";
  const typedResponse = useSceneTyping(aiResponse, step >= 2, 20);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1000);
    const t3 = setTimeout(() => setStep(3), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-wine-glow" />
        <span className="text-[11px] font-semibold text-foreground">AI ჩატი</span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold font-bold ml-auto">PRO</span>
      </div>

      {/* User bubble */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex justify-end">
            <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md bg-wine-deep text-white text-[10px] leading-relaxed">
              ქორწილისთვის სადღეგრძელო მინდა
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI bubble */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1 }} className="flex justify-start gap-2">
            <div className="w-6 h-6 rounded-full wine-gradient flex items-center justify-center shrink-0">
              <HornIcon size={10} className="text-white" />
            </div>
            <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-bl-md bg-surface-1 border border-border text-[10px] text-foreground leading-relaxed">
              {typedResponse}
              {step < 3 && <motion.span className="inline-block w-0.5 h-2.5 bg-wine-deep ml-0.5 align-middle" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice chip + input */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
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
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    if (!active) { setCount(2); setShowPlus(false); setShowSecond(false); return; }
    const t1 = setTimeout(() => { setCount(3); setShowPlus(true); }, 600);
    const t2 = setTimeout(() => setShowPlus(false), 1200);
    const t3 = setTimeout(() => setShowSecond(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Wine className="h-3.5 w-3.5 text-wine-deep" />
        <span className="text-[11px] font-semibold text-foreground">ალავერდი</span>
      </div>

      {/* Guest 1 */}
      <motion.div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-wine-light/40 border border-wine-muted/25"
        initial={{ opacity: 0, x: -8 }} animate={active ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 }}>
        <div className="w-7 h-7 rounded-full wine-gradient flex items-center justify-center text-white text-[10px] font-bold">გ</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-foreground">გიორგი მამულაშვილი</div>
          <div className="text-[9px] text-muted-foreground">მეჯვარე</div>
        </div>
        <div className="relative flex items-center gap-1">
          <motion.span className="text-xs font-bold text-wine-deep tabular-nums" key={count}
            initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            {count}
          </motion.span>
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

      {/* Guest 2 */}
      <AnimatePresence>
        {showSecond && (
          <motion.div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-1 border border-border/50"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold">ნ</div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-foreground">ნინო ჩხეიძე</div>
              <div className="text-[9px] text-muted-foreground">მოწვეული</div>
            </div>
            <span className="text-xs font-bold text-foreground/50 tabular-nums">1</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN — 5-scene story with variable timing
   ═══════════════════════════════════════════ */
const SCENES = [1, 2, 3, 4, 5] as const;
type SceneNum = typeof SCENES[number];

const SCENE_META: { label: string; duration: number }[] = [
  { label: "გენერატორი", duration: 2800 },
  { label: "შედეგი",     duration: 3500 },
  { label: "ლაივ სუფრა", duration: 3200 },
  { label: "AI ჩატი",    duration: 3500 },
  { label: "ალავერდი",   duration: 2800 },
];

export default function HeroMockupStory({ active = false }: { active?: boolean }) {
  const [scene, setScene] = useState<SceneNum>(1);

  useEffect(() => {
    if (!active) return;
    const advance = () => {
      setScene((s) => {
        const next = ((s % 5) + 1) as SceneNum;
        return next;
      });
    };
    const duration = SCENE_META[scene - 1].duration;
    const id = setTimeout(advance, duration);
    return () => clearTimeout(id);
  }, [active, scene]);

  useEffect(() => {
    if (active) setScene(1);
  }, [active]);

  return (
    <div className="mockup-browser">
      {/* Browser chrome */}
      <div className="mockup-browser-bar">
        <div className="mockup-browser-dot bg-red-400/70" />
        <div className="mockup-browser-dot bg-yellow-400/70" />
        <div className="mockup-browser-dot bg-green-400/70" />
        <div className="flex-1 ml-3">
          <motion.div initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ duration: 0.3 }}
            className="max-w-[180px] h-5 rounded-md bg-surface-2 flex items-center px-2">
            <span className="text-[9px] text-muted-foreground truncate">tamada.app</span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 bg-background min-h-[270px] sm:min-h-[320px] flex flex-col">
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
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {scene === 1 && <SceneGenerator key="gen" active={active} />}
            {scene === 2 && <SceneResult key="result" active={active} />}
            {scene === 3 && <SceneLiveFeast key="live" active={active} />}
            {scene === 4 && <SceneChat key="chat" active={active} />}
            {scene === 5 && <SceneAlaverdi key="alaverdi" active={active} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Scene indicators with labels */}
      <div className="flex items-center justify-center gap-3 py-2.5 border-t border-border/50 bg-surface-1/50">
        {SCENES.map((s, i) => (
          <button key={s} onClick={() => setScene(s)} className="flex flex-col items-center gap-1 group">
            <motion.div
              className="rounded-full"
              animate={{
                width: scene === s ? 14 : 5,
                height: 5,
                backgroundColor: scene === s ? "hsl(353,41%,32%)" : "hsl(var(--muted-foreground) / 0.2)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            />
            <span className={`text-[7px] transition-colors ${scene === s ? "text-wine-deep font-semibold" : "text-muted-foreground/50"}`}>
              {SCENE_META[i].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
