import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import SystemIcon from "@/components/SystemIcon";
import { Sparkles, Check, ArrowRight, Users } from "lucide-react";

/* ═══════════════════════════════════════════
   TYPING HOOK (local, scene-scoped)
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
   SCENE TRANSITIONS
   ═══════════════════════════════════════════ */
const sceneVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.25 } },
};

/* ═══════════════════════════════════════════
   SCENE 1 — "The Ask"
   User types occasion, tags spring in
   ═══════════════════════════════════════════ */
function SceneInput({ active }: { active: boolean }) {
  const typed = useSceneTyping("ქორწილი, 45 სტუმარი", active, 45);
  const tags = ["ქორწილი", "ფორმალური", "კახეთი"];

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-wine-glow" />
        <span className="text-xs font-semibold text-foreground">AI სადღეგრძელო</span>
      </div>

      {/* Input with typing cursor */}
      <div className="relative rounded-lg border border-border bg-surface-1 px-3 py-2.5">
        <span className="text-sm text-foreground">{typed}</span>
        <motion.span
          className="inline-block w-0.5 h-4 bg-wine-deep ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>

      {/* Tags spring in */}
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0, y: 8 }}
            animate={active ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.6 + i * 0.15 }}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-wine-light text-wine-deep border border-wine-muted/30"
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Generate button with pulse */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.3 }}
        className="pt-1"
      >
        <motion.div
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg wine-gradient text-white text-xs font-semibold"
          animate={active ? { boxShadow: ["0 0 0 0 hsla(353,50%,38%,0)", "0 0 12px 4px hsla(353,50%,38%,0.35)", "0 0 0 0 hsla(353,50%,38%,0)"] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1.4 }}
        >
          შექმნა
          <ArrowRight className="h-3 w-3" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 2 — "AI Writes"
   Shimmer skeletons → typed toast text
   ═══════════════════════════════════════════ */
function SceneAIGen({ active }: { active: boolean }) {
  const [showText, setShowText] = useState(false);
  const toastText = "დიდება ღმერთს, რომელმაც მოგვცა ეს დღე — ორი გულის ერთ ცხოვრებად შეკვრის დღე...";
  const typed = useSceneTyping(toastText, showText, 22);

  useEffect(() => {
    if (!active) { setShowText(false); return; }
    const t = setTimeout(() => setShowText(true), 800);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-3">
      <div className="flex items-center gap-2">
        <motion.div
          animate={active ? { rotate: [0, 15, -15, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="h-4 w-4 text-gold" />
        </motion.div>
        <span className="text-xs font-semibold text-foreground">AI სადღეგრძელო</span>
        <motion.div
          className="h-2 w-2 rounded-full bg-wine-glow ml-auto"
          animate={active ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[10px] text-wine-muted font-medium">გენერირებული</span>
      </div>

      {/* Shimmer → text */}
      <div className="p-3 rounded-lg border border-wine-muted/20 bg-wine-light/30 min-h-[72px]">
        {!showText ? (
          <div className="space-y-2">
            {[100, 85, 60].map((w, i) => (
              <motion.div
                key={i}
                className="h-3 rounded shimmer-bar"
                style={{ width: `${w}%`, background: "hsl(var(--wine-muted) / 0.2)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-foreground leading-relaxed font-medium">
            {typed}
            <motion.span
              className="inline-block w-0.5 h-3 bg-wine-deep ml-0.5 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 3 — "Live Feast"
   Progress bar, toast checklist, timer
   ═══════════════════════════════════════════ */
function SceneLiveFeast({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(30);
  const [timer, setTimer] = useState("12:45");
  const [checks, setChecks] = useState([false, false, false]);

  useEffect(() => {
    if (!active) { setProgress(30); setTimer("12:45"); setChecks([false, false, false]); return; }
    const t1 = setTimeout(() => { setChecks([true, false, false]); setProgress(40); setTimer("12:51"); }, 400);
    const t2 = setTimeout(() => { setChecks([true, true, false]); setProgress(50); setTimer("12:55"); }, 800);
    const t3 = setTimeout(() => { setChecks([true, true, true]); setProgress(62); setTimer("13:02"); }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  const toasts = [
    { name: "ღვთის სადღეგრძელო", idx: 0 },
    { name: "სამშობლოს", idx: 1 },
    { name: "მშობლების", idx: 2 },
    { name: "ნეფე-პატარძლის", idx: 3 },
  ];

  return (
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">ნიკას ქორწილი</span>
        <motion.div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 ml-auto"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] font-bold text-green-600 dark:text-green-400">LIVE</span>
        </motion.div>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">{timer}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full wine-gradient rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Toast checklist */}
      <div className="space-y-1">
        {toasts.map((t) => {
          const done = checks[t.idx] === true;
          const isCurrent = t.idx === checks.filter(Boolean).length;
          return (
            <motion.div
              key={t.idx}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] ${
                isCurrent ? "bg-wine-light/40 border border-wine-muted/20 font-semibold text-foreground" :
                done ? "text-foreground/60" : "text-foreground/40"
              }`}
              layout
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                done ? "bg-green-500/15" : isCurrent ? "bg-wine-deep text-white" : "bg-surface-2"
              }`}>
                {done ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </motion.div>
                ) : (
                  <span className="text-[9px] font-semibold">{t.idx + 1}</span>
                )}
              </div>
              <span className={done ? "line-through" : ""}>{t.name}</span>
              {isCurrent && (
                <motion.div className="ml-auto" animate={{ x: [0, 3, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                  <ArrowRight className="h-3 w-3 text-wine-glow" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCENE 4 — "Alaverdi"
   Guest highlight, count bump, +1 float
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
    <motion.div variants={sceneVariants} initial="initial" animate="animate" exit="exit" className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-wine-deep" />
        <span className="text-xs font-semibold text-foreground">ალავერდი</span>
      </div>

      {/* Guest 1 — highlighted */}
      <motion.div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-wine-light/40 border border-wine-muted/25"
        initial={{ opacity: 0, x: -10 }}
        animate={active ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.2 }}
      >
        <div className="w-8 h-8 rounded-full wine-gradient flex items-center justify-center text-white text-xs font-bold">
          გ
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground">გიორგი მამულაშვილი</div>
          <div className="text-[10px] text-muted-foreground">მეჯვარე</div>
        </div>
        <div className="relative flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">ალავერდი:</span>
          <motion.span
            className="text-sm font-bold text-wine-deep tabular-nums"
            key={count}
            initial={{ scale: 1.6, color: "hsl(350,65%,50%)" }}
            animate={{ scale: 1, color: "hsl(353,41%,32%)" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {count}
          </motion.span>
          <AnimatePresence>
            {showPlus && (
              <motion.span
                className="absolute -top-3 right-0 text-xs font-bold text-wine-glow"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Guest 2 — fades in */}
      <AnimatePresence>
        {showSecond && (
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-1 border border-border/50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
              ნ
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-foreground">ნინო ჩხეიძე</div>
              <div className="text-[10px] text-muted-foreground">მოწვეული</div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">ალავერდი:</span>
              <span className="text-sm font-bold text-foreground/60 tabular-nums">1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT — 4-scene story loop
   ═══════════════════════════════════════════ */
const SCENE_DURATION = 2500; // ms per scene
const SCENES = [1, 2, 3, 4] as const;
type SceneNum = typeof SCENES[number];

const SCENE_LABELS = ["შეკითხვა", "AI წერს", "ლაივ სუფრა", "ალავერდი"];

export default function HeroMockupStory({ active = false }: { active?: boolean }) {
  const [scene, setScene] = useState<SceneNum>(1);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setScene((s) => ((s % 4) + 1) as SceneNum);
    }, SCENE_DURATION);
    return () => clearInterval(id);
  }, [active]);

  // Reset scene when becoming active
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={active ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="max-w-[180px] h-5 rounded-md bg-surface-2 flex items-center px-2"
          >
            <span className="text-[9px] text-muted-foreground truncate">tamada.app</span>
          </motion.div>
        </div>
      </div>

      {/* Scene content */}
      <div className="p-5 sm:p-6 bg-background min-h-[260px] sm:min-h-[310px] flex flex-col">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={active ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-7 h-7 rounded-lg wine-gradient flex items-center justify-center">
            <HornIcon size={14} className="text-white" />
          </div>
          <span className="text-[12px] font-semibold text-foreground tracking-tight">თამადა</span>
          <div className="ml-auto h-6 w-6 rounded-full bg-wine-light flex items-center justify-center text-[10px] font-bold text-wine-deep">
            ნ
          </div>
        </motion.div>

        {/* Animated scenes */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {scene === 1 && <SceneInput key="input" active={active} />}
            {scene === 2 && <SceneAIGen key="ai" active={active} />}
            {scene === 3 && <SceneLiveFeast key="live" active={active} />}
            {scene === 4 && <SceneAlaverdi key="alaverdi" active={active} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Scene indicator dots */}
      <div className="flex items-center justify-center gap-2 py-2.5 border-t border-border/50 bg-surface-1/50">
        {SCENES.map((s, i) => (
          <button
            key={s}
            onClick={() => setScene(s)}
            className="flex items-center gap-1 group"
          >
            <motion.div
              className="rounded-full"
              animate={{
                width: scene === s ? 16 : 6,
                height: 6,
                backgroundColor: scene === s ? "hsl(353,41%,32%)" : "hsl(var(--muted-foreground) / 0.25)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
