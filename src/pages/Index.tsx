import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import QvevriIcon from "@/components/icons/QvevriIcon";
import {
  heroStagger,
  heroBadgeReveal,
  heroHeadlineReveal,
  heroSubReveal,
  heroCTAReveal,
  heroTestimonialReveal,
  heroMockupReveal,
  scrollReveal,
  scrollRevealScale,
  revealFromLeft,
  revealFromRight,
  mockupReveal,
  timelineStep,
} from "@/lib/animations";
import SystemIcon from "@/components/SystemIcon";
import {
  ArrowUp,
  Menu,
  Globe,
  Zap,
  Clock,
  Star,
  Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/* ═══════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════ */

const NAV_LINKS = [
  { id: "features", label: "ფუნქციები", labelEn: "Features" },
  { id: "how-it-works", label: "როგორ მუშაობს", labelEn: "How It Works" },
  { id: "pricing", label: "ფასები", labelEn: "Pricing" },
];

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isKa = i18n.language === "ka";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const toggleLang = async () => {
    const next = isKa ? "en" : "ka";
    i18n.changeLanguage(next);
    localStorage.setItem("tamada-lang", next);
    if (user) {
      await supabase
        .from("profiles")
        .update({ preferred_language: next })
        .eq("id", user.id);
    }
  };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav border-b border-border/60 shadow-card py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo with brand accent */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg wine-gradient flex items-center justify-center shadow-wine group-hover:scale-105 transition-transform">
            <HornIcon size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-foreground tracking-tight leading-none">
              TAMADA
            </span>
            <span className="hidden sm:block h-[2px] w-[60%] rounded-full wine-gradient mt-0.5" />
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`relative text-sm font-medium transition-colors pb-1 ${
                activeSection === link.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isKa ? link.label : link.labelEn}
              {activeSection === link.id && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-wine-deep"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-accent"
          >
            <Globe className="h-3.5 w-3.5" />
            {isKa ? "EN" : "ქარ"}
          </button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:inline-flex"
          >
            <Link to="/auth/login">{isKa ? "შესვლა" : "Log in"}</Link>
          </Button>

          <div className="hidden md:block w-px h-5 bg-border" />

          <Button variant="wine" size="sm" asChild className="hidden md:inline-flex">
            <Link to="/auth/signup">
              {isKa ? "დაიწყე უფასოდ" : "Start free"}
              <SystemIcon name="action.next" size="sm" className="ml-1" />
            </Link>
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] pt-10">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-2">
                {/* Brand in drawer */}
                <div className="flex items-center gap-2.5 px-2 mb-2">
                  <div className="w-8 h-8 rounded-lg wine-gradient flex items-center justify-center">
                    <HornIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="font-display text-lg font-bold text-foreground leading-none">TAMADA</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isKa ? "შენი ციფრული თამადა" : "Your digital tamada"}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-border mb-2" />
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`text-left text-lg font-medium py-3 px-2 rounded-lg hover:bg-accent transition-colors ${
                      activeSection === link.id
                        ? "text-wine-deep bg-wine-light/30"
                        : "text-foreground"
                    }`}
                  >
                    {isKa ? link.label : link.labelEn}
                  </button>
                ))}
                <div className="h-px bg-border my-4" />
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-3 px-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  {isKa ? "Switch to English" : "ქართულზე გადასვლა"}
                </button>
                <div className="h-px bg-border my-2" />
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                    {isKa ? "შესვლა" : "Log in"}
                  </Link>
                </Button>
                <Button variant="wine" asChild>
                  <Link to="/auth/signup" onClick={() => setMobileOpen(false)}>
                    {isKa ? "დაიწყე უფასოდ" : "Start free"}
                    <SystemIcon name="action.next" size="sm" className="ml-1" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED MOCKUP UTILITIES
   ═══════════════════════════════════════════ */

function useTypingEffect(text: string, active: boolean, delay = 0, speed = 25) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    let i = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(intervalId);
      }, speed);
    }, delay * 1000);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [active, text, delay, speed]);
  return displayed;
}

function AnimatedCount({ to, active, delay = 0 }: { to: number; active: boolean; delay?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frameId: number;
    const timeoutId = setTimeout(() => {
      const duration = 600;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * to));
        if (t < 1) frameId = requestAnimationFrame(step);
      };
      frameId = requestAnimationFrame(step);
    }, delay * 1000);
    return () => {
      clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [active, to, delay]);
  return <>{value}</>;
}

/* ═══════════════════════════════════════════
   PRODUCT MOCKUP — animated live dashboard
   ═══════════════════════════════════════════ */

function ProductMockup({ active = false }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const TOASTS = [
    { name: "ღვთის სადღეგრძელო", done: true },
    { name: "სამშობლოს", done: true },
    { name: "მშობლების", active: true },
  ];

  return (
    <div className="mockup-browser" ref={ref}>
      <div className="mockup-browser-bar">
        <div className="mockup-browser-dot bg-red-400/70" />
        <div className="mockup-browser-dot bg-yellow-400/70" />
        <div className="mockup-browser-dot bg-green-400/70" />
        <div className="flex-1 ml-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={active ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-[180px] h-5 rounded-md bg-surface-2 flex items-center px-2"
          >
            <span className="text-[9px] text-muted-foreground truncate">tamada.app/dashboard</span>
          </motion.div>
        </div>
      </div>
      <div className="p-5 sm:p-7 space-y-4 bg-background min-h-[240px] sm:min-h-[320px]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg wine-gradient flex items-center justify-center">
              <HornIcon size={16} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-foreground tracking-tight">თამადა</span>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-surface-1 flex items-center justify-center">
              <SystemIcon name="nav.ai" size="sm" tone="muted" />
            </div>
            <div className="h-8 w-8 rounded-full bg-wine-light flex items-center justify-center text-[11px] font-bold text-wine-deep">ნ</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { bg: "bg-wine-light/60", border: "border-wine-muted/20", icon: <HornIcon size={18} className="text-wine-deep" />, label: "სუფრა", d: 0.2 },
            { bg: "bg-gold-light/60", border: "border-gold/20", icon: <SystemIcon name="nav.ai" size="sm" className="text-gold" />, label: "AI", d: 0.3 },
            { bg: "bg-surface-1", border: "border-border", icon: <WineGlassIcon size={18} className="text-muted-foreground" />, label: "ფავორიტი", d: 0.4 },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={active ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: c.d }}
              className={`p-3.5 rounded-lg ${c.bg} border ${c.border}`}
            >
              <div className="mb-2">{c.icon}</div>
              <div className="text-[11px] font-medium text-foreground/60">{c.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.97 }}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-4 rounded-xl border border-wine-muted/30 bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={active ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
              className="h-2 w-2 rounded-full bg-green-500"
            />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">LIVE</span>
            <span className="text-xs text-muted-foreground ml-auto">ნიკას ქორწილი</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={active ? { scale: 1, rotate: 0 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.65 }}
                className="w-9 h-9 rounded-lg wine-gradient flex items-center justify-center text-white text-xs font-bold"
              >
                3
              </motion.div>
              <div className="flex-1">
                <div className="text-xs font-medium text-foreground">მშობლების</div>
                <div className="text-[11px] text-muted-foreground">სადღეგრძელო #3</div>
              </div>
              <motion.span
                animate={active ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity, delay: 1 }}
                className="text-xs text-wine-muted font-mono font-medium tabular-nums"
              >
                4:32
              </motion.span>
            </div>
            <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={active ? { width: "38%" } : {}}
                transition={{ duration: 1.4, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full wine-gradient rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="space-y-1.5">
          {TOASTS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={active ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.8 + i * 0.12 }}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg ${
                t.active ? "bg-wine-light/40 border border-wine-muted/20" : "bg-surface-1/80"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold ${
                t.active ? "bg-wine-deep text-white" : "bg-surface-2 text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-[13px] font-medium ${t.active ? "text-foreground font-semibold" : "text-foreground/80"}`}>
                {t.name}
              </span>
              {t.done && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={active ? { scale: 1 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 12, delay: 1.1 + i * 0.15 }}
                  className="ml-auto"
                >
                  <SystemIcon name="status.success" size="sm" className="text-green-500" />
                </motion.div>
              )}
              {t.active && (
                <motion.div
                  animate={active ? { x: [0, 3, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 1.2 }}
                  className="ml-auto"
                >
                  <SystemIcon name="action.next" size="sm" className="text-wine-glow" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FEATURE SHOWCASE — zig-zag layout
   ═══════════════════════════════════════════ */

interface FeatureShowcaseProps {
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
  number?: string;
  reversed?: boolean;
  bgClass?: string;
  bgStyle?: React.CSSProperties;
  learnMoreHref?: string;
  learnMoreText?: string;
  glowClass?: string;
  children: React.ReactNode;
}

function FeatureShowcase({
  title,
  subtitle,
  description,
  bullets,
  number,
  reversed = false,
  bgClass = "",
  bgStyle,
  learnMoreHref,
  learnMoreText,
  glowClass = "glow-behind",
  children,
}: FeatureShowcaseProps) {
  const textBlock = (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, margin: "-60px" }}
      variants={reversed ? revealFromRight : revealFromLeft}
      className={reversed ? "order-first md:order-none" : ""}
    >
      <div className="flex items-center gap-2.5 mb-3">
        {number && (
          <span className="w-8 h-8 rounded-full wine-gradient flex items-center justify-center text-xs font-bold text-white shadow-wine">
            {number}
          </span>
        )}
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-wine-muted">
          {subtitle}
        </p>
      </div>
      <h2 className="font-display text-heading-1 text-foreground mb-4">
        {title}
      </h2>
      <p className="text-muted-foreground leading-relaxed max-w-md mb-4">
        {description}
      </p>
      {bullets && bullets.length > 0 && (
        <ul className="space-y-2 mb-5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-foreground/80">
              <SystemIcon name="status.success" size="sm" className="text-wine-glow shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {learnMoreHref && (
        <Button variant="wine-outline" size="default" asChild className="mt-1">
          <Link to={learnMoreHref}>
            {learnMoreText || "Learn more"}
            <SystemIcon name="action.next" size="sm" className="ml-1.5" />
          </Link>
        </Button>
      )}
    </motion.div>
  );

  const visualBlock = (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, margin: "-60px" }}
      variants={reversed ? revealFromLeft : revealFromRight}
      className={`${reversed ? "order-last md:order-none" : ""} ${glowClass}`}
      style={{ willChange: "transform" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );

  return (
    <section className={`py-20 md:py-28 px-6 relative ${bgClass}`} style={bgStyle}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {reversed ? (
          <>
            {visualBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {visualBlock}
          </>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FEATURE MOCKUPS — animated app-like visuals
   ═══════════════════════════════════════════ */

function AIMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const TOAST_TEXT =
    "ძვირფასო ნეფე-პატარძალო! გისურვებთ სიყვარულს, რომელიც წლებთან ერთად მხოლოდ ღრმავდება, ოჯახს — სიხარულითა და სითბოთი სავსეს. გაუმარჯოს!";
  const typedText = useTypingEffect(TOAST_TEXT, inView, 1.8, 28);
  const showCursor = inView && typedText.length < TOAST_TEXT.length;

  return (
    <div className="mockup-browser" ref={ref}>
      <div className="mockup-browser-bar">
        <div className="mockup-browser-dot bg-red-400/70" />
        <div className="mockup-browser-dot bg-yellow-400/70" />
        <div className="mockup-browser-dot bg-green-400/70" />
      </div>
      <div className="p-5 sm:p-7 bg-background space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={inView ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <SystemIcon name="nav.ai" size="sm" className="text-wine-glow" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground">AI სადღეგრძელო</span>
          </div>
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">შემთხვევა:</span>
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                className="px-2.5 py-1 bg-wine-light rounded-md text-xs font-medium text-wine-deep"
              >
                ქორწილი
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">ფორმალობა:</span>
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.7 }}
                className="px-2.5 py-1 bg-gold-light rounded-md text-xs font-medium text-gold"
              >
                ფორმალური
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            <motion.div
              animate={inView ? {
                boxShadow: [
                  "0 0 0 0 hsla(353,41%,32%,0)",
                  "0 0 0 8px hsla(353,41%,32%,0.15)",
                  "0 0 0 0 hsla(353,41%,32%,0)",
                ],
              } : {}}
              transition={{ duration: 1.5, delay: 1.1, times: [0, 0.5, 1] }}
              className="h-9 rounded-lg wine-gradient flex items-center justify-center cursor-default"
            >
              <span className="text-xs text-white font-semibold">შექმნა</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="p-5 rounded-xl bg-wine-light/50 border border-wine-muted/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={inView ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity, delay: 1.6 }}
              className="h-2 w-2 rounded-full bg-wine-glow"
            />
            <span className="text-xs font-semibold text-wine-deep">გენერირებული</span>
          </div>
          <div className="min-h-[60px]">
            <p className="text-[13px] leading-relaxed text-wine-deep/80">
              {typedText}
              {showCursor && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-[1px] h-3.5 bg-wine-deep ml-0.5 align-middle"
                />
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeastMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const ITEMS: { n: string; done?: boolean; active?: boolean }[] = [
    { n: "ღვთის", done: true },
    { n: "სამშობლოს", done: true },
    { n: "მშობლების", done: true },
    { n: "გარდაცვლილთა", done: true },
    { n: "პატარძლისა და სიძის", done: true },
    { n: "სტუმრების", active: true },
    { n: "სიყვარულის" },
  ];

  return (
    <div className="mockup-browser" ref={ref}>
      <div className="mockup-browser-bar">
        <div className="mockup-browser-dot bg-red-400/70" />
        <div className="mockup-browser-dot bg-yellow-400/70" />
        <div className="mockup-browser-dot bg-green-400/70" />
      </div>
      <div className="p-5 sm:p-7 bg-background space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-between mb-2"
        >
          <div>
            <div className="text-sm font-bold text-foreground">ნიკას ქორწილი</div>
            <div className="text-xs text-muted-foreground">12 სადღეგრძელო</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-md">
            <motion.div
              animate={inView ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="h-2 w-2 rounded-full bg-green-500"
            />
            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">LIVE</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>პროგრესი</span>
            <span>5/12</span>
          </div>
          <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={inView ? { width: "42%" } : {}}
              transition={{ duration: 1.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full wine-gradient rounded-full"
            />
          </div>
        </motion.div>

        <div className="space-y-1.5">
          {ITEMS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.12 }}
              className={`flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs ${
                t.active
                  ? "bg-wine-light/70 border border-wine-muted/30 font-semibold text-foreground"
                  : t.done
                    ? "text-muted-foreground"
                    : "text-foreground/70"
              }`}
            >
              <span className="w-4 text-right text-[10px] text-muted-foreground font-mono">{i + 1}</span>
              <span className={t.done ? "line-through opacity-60" : ""}>{t.n}</span>
              {t.done && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={inView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.9 + i * 0.18 }}
                  className="ml-auto"
                >
                  <SystemIcon name="status.success" size="xs" className="text-green-500" />
                </motion.div>
              )}
              {t.active && (
                <motion.div
                  animate={inView ? { x: [0, 3, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity, delay: 2.0 }}
                  className="ml-auto"
                >
                  <SystemIcon name="action.next" size="xs" className="text-wine-glow" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlaverdiMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const GUESTS = [
    { name: "გიორგი", role: "მეჯვარე", count: 3, active: true },
    { name: "ნინო", role: "სტუმარი", count: 2 },
    { name: "დავითი", role: "პატივის სტუმარი", count: 4 },
    { name: "მარიამი", role: "სტუმარი", count: 1 },
    { name: "ლევანი", role: "ოჯახი", count: 2 },
  ] as const;

  return (
    <div className="mockup-browser" ref={ref}>
      <div className="mockup-browser-bar">
        <div className="mockup-browser-dot bg-red-400/70" />
        <div className="mockup-browser-dot bg-yellow-400/70" />
        <div className="mockup-browser-dot bg-green-400/70" />
      </div>
      <div className="p-5 sm:p-7 bg-background space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-sm font-bold text-foreground mb-1"
        >
          სტუმრები & ალავერდი
        </motion.div>
        {GUESTS.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.1 }}
            className={`flex items-center gap-3 py-3 px-3.5 rounded-lg bg-card border ${
              ('active' in g && g.active) ? "border-wine-muted/40 bg-wine-light/20" : "border-border"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 + i * 0.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                ('active' in g && g.active) ? "bg-wine-deep text-white" : "bg-wine-light text-wine-deep"
              }`}
            >
              {g.name[0]}
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground">{g.name}</div>
              <div className="text-[11px] text-muted-foreground">{g.role}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <QvevriIcon size={14} className="text-wine-muted" />
              <span className="text-xs font-bold text-foreground tabular-nums">
                <AnimatedCount to={g.count} active={inView} delay={0.5 + i * 0.12} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CULTURAL MISSION — animated stat counters
   ═══════════════════════════════════════════ */

function MissionStats({ isKa }: { isKa: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const STATS = [
    { to: 3000, suffix: "+", label: isKa ? "წლოვანი ტრადიცია" : "Years of Tradition" },
    { to: 12, suffix: "", label: isKa ? "სადღეგრძელოს კატეგორია" : "Toast Categories Preserved" },
    { to: 9, suffix: "", label: isKa ? "რეგიონის კულტურა" : "Regional Cultures Mapped" },
  ];

  return (
    <div className="max-w-4xl mx-auto text-center relative z-10" ref={ref}>
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, margin: "-60px" }}
        variants={scrollRevealScale}
      >
        <QvevriIcon
          size={64}
          className="text-white/60 mx-auto mb-6"
        />
        <h2 className="font-display text-heading-1 text-white mb-6">
          {isKa
            ? "ტრადიცია ტექნოლოგიასთან ერთად"
            : "Tradition Meets Technology"}
        </h2>
        <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-6">
          {isKa
            ? "ქართულ სუფრას 3,000 წელი აქვს. ჩვენ ვზრუნავთ, რომ კიდევ 3,000 იცოცხლოს."
            : "The Georgian supra is 3,000 years old. We're making sure it lives another 3,000."}
        </p>

        <div className="grid grid-cols-3 gap-4 md:gap-6 mt-12">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-5 md:p-6 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/10">
              <div className="text-4xl md:text-5xl font-bold text-white font-display tabular-nums">
                <AnimatedCount to={stat.to} active={inView} delay={0.2 + i * 0.15} />
                <span className="text-gold">{stat.suffix}</span>
              </div>
              <div className="text-sm text-white/60 font-medium mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRICING SECTION — with monthly/annual toggle
   ═══════════════════════════════════════════ */

function PricingSection({ isKa }: { isKa: boolean }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28 px-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 30%, hsla(353,41%,32%,0.04) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
          className="text-center mb-10"
        >
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-wine-muted mb-3">
            {isKa ? "ფასები" : "Pricing"}
          </p>
          <h2 className="font-display text-heading-1 text-foreground mb-3">
            {isKa ? "დაიწყე უფასოდ. გააძლიერე, როცა სუფრა მოითხოვს." : "Start free. Upgrade when your supra demands it."}
          </h2>

          {/* Monthly/Annual toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-xl bg-surface-1 border border-border">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !annual ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isKa ? "თვიური" : "Monthly"}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                annual ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isKa ? "წლიური" : "Annual"}
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-wine-light text-wine-deep">
                -17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Free plan */}
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, margin: "-40px" }}
            variants={timelineStep(0)}
            className="p-6 md:p-8 rounded-2xl bg-card border border-border transition-all duration-200 hover:border-wine-muted/40 hover:shadow-card-hover"
          >
            <h3 className="text-heading-3 text-foreground mb-1">
              {isKa ? "უფასო" : "Free"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {isKa ? "ყველაფერი, რაც ერთი სუფრისთვის გჭირდება" : "Everything you need for a single supra"}
            </p>
            <div className="text-3xl font-bold text-foreground mb-6">
              ₾0
              <span className="text-sm font-normal text-muted-foreground">
                /{isKa ? "თვე" : "mo"}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {(isKa
                ? [
                    "5 AI სადღეგრძელო/დღე",
                    "1 აქტიური სუფრა",
                    "10 ფავორიტი",
                    "სადღეგრძელოების ბიბლიოთეკა",
                    "9 რეგიონის ტრადიცია",
                  ]
                : [
                    "5 AI toasts/day",
                    "1 active feast",
                    "10 favorites",
                    "Toast library access",
                    "9 regional traditions",
                  ]
              ).map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                  <SystemIcon name="status.success" size="sm" tone="success" className="shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth/signup">
                {isKa ? "დაიწყე" : "Get Started"}
              </Link>
            </Button>
          </motion.div>

          {/* Pro plan — elevated */}
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, margin: "-40px" }}
            variants={timelineStep(1)}
            className="p-6 md:p-8 rounded-2xl bg-wine-light/20 border-2 border-wine-muted/50 relative overflow-hidden transition-all duration-200 hover:border-wine-muted/70 shadow-wine md:scale-[1.03] md:origin-top"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full bg-wine-deep/10 border border-wine-muted/30 text-[10px] font-bold text-wine-deep">
                {isKa ? "რეკომენდებული" : "Recommended"}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-[10px] font-bold text-gold flex items-center gap-1">
                <SystemIcon name="nav.upgrade" size="xs" />
                PRO
              </span>
            </div>
            <h3 className="text-heading-3 text-foreground mb-1">
              {isKa ? "პრო თამადა" : "Pro Tamada"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {isKa ? "თამადისთვის, რომელიც მთელ წელს მასპინძლობს" : "For the tamada who hosts all year"}
            </p>
            <div className="text-3xl font-bold text-foreground mb-2">
              {annual ? "₾8.25" : "₾9.99"}
              <span className="text-sm font-normal text-muted-foreground">
                /{isKa ? "თვე" : "mo"}
              </span>
            </div>
            {annual && (
              <p className="text-xs text-wine-muted mb-6">
                {isKa
                  ? "₾99/წელი — 2 თვე უფასოდ"
                  : "₾99/year — 2 months free"}
              </p>
            )}
            {!annual && (
              <p className="text-xs text-muted-foreground mb-6">
                {isKa ? "გადაერთე წლიურზე და დაზოგე 17%" : "Switch to annual and save 17%"}
              </p>
            )}
            <ul className="space-y-3 mb-8">
              {(isKa
                ? [
                    "100 AI სადღეგრძელო/დღე",
                    "99 აქტიური სუფრა",
                    "თანა-თამადა & რეალტაიმი",
                    "PDF ექსპორტი",
                    "AI პერსონალიზაცია",
                    "პრიორიტეტული მხარდაჭერა",
                  ]
                : [
                    "100 AI toasts/day",
                    "99 active feasts",
                    "Co-Tamada & Realtime",
                    "PDF export",
                    "AI personalization",
                    "Priority support",
                  ]
              ).map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                  <SystemIcon name="status.success" size="sm" className="text-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="wine" className="w-full" asChild>
              <Link to="/upgrade">
                {isKa ? "გახდი პრო" : "Go Pro"}
                <SystemIcon name="action.next" size="sm" className="ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [mockupActive, setMockupActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMockupActive(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, 80]);
  const heroMockupY = useTransform(scrollYProgress, [0, 0.8], [0, 50]);

  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  });
  const timelineScale = useTransform(timelineProgress, [0, 1], [0, 1]);

  const { i18n } = useTranslation();
  const isKa = i18n.language === "ka";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />

      {/* ═══════════════ HERO ═══════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden noise-overlay"
      >
        {/* Dramatic gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none gradient-mesh-hero" />

        {/* Animated breathing orbs -- 2 only, higher opacity, organic easing */}
        <motion.div
          className="absolute top-[8%] left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(353,55%,38%,0.22) 0%, transparent 70%)", filter: "blur(50px)" }}
          animate={{ x: [0, 35, 0], y: [0, -25, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95], x: { ease: "easeInOut" } }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[8%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(43,60%,50%,0.18) 0%, transparent 70%)", filter: "blur(50px)" }}
          animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95], y: { ease: "easeInOut" }, delay: 1.5 }}
        />

        {/* Floating cultural icons -- 2 only, entrance then CSS float */}
        <motion.div
          className="absolute top-[18%] right-[7%] pointer-events-none hidden lg:block"
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 0.16, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 1.5, ease: "easeOut" }}
        >
          <div className="icon-float-1">
            <HornIcon size={56} className="text-wine-deep" />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-[22%] left-[4%] pointer-events-none hidden lg:block"
          initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
          animate={{ opacity: 0.13, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 1.8, ease: "easeOut" }}
        >
          <div className="icon-float-2">
            <WineGlassIcon size={42} className="text-wine-muted" />
          </div>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Left: text -- parallax at 80px */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={heroStagger}
              style={{ y: heroY }}
            >
              {/* Badge pill */}
              <motion.div variants={heroBadgeReveal} className="mb-5">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wine-light/60 border border-wine-muted/25 text-xs font-semibold text-wine-deep tracking-wide">
                  <SystemIcon name="nav.ai" size="xs" />
                  {isKa ? "AI-ით გაძლიერებული სუფრის დაგეგმვა" : "AI-Powered Feast Planning"}
                </span>
              </motion.div>

              <motion.h1
                variants={heroHeadlineReveal}
                className="font-display text-foreground mb-5"
                style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
              >
                {isKa ? (
                  <>
                    იყავი თამადა,
                    <br />
                    <span
                      className="hero-headline-shimmer bg-clip-text text-transparent"
                      style={{
                        backgroundImage: "linear-gradient(90deg, hsl(var(--wine-deep)) 0%, hsl(350,65%,50%) 30%, hsl(var(--wine-glow)) 50%, hsl(350,65%,50%) 70%, hsl(var(--wine-deep)) 100%)",
                        filter: "drop-shadow(0 2px 6px hsla(353,41%,32%,0.18))",
                      }}
                    >
                      რომელსაც დაიმახსოვრებენ
                    </span>
                  </>
                ) : (
                  <>
                    Be the tamada
                    <br />
                    <span
                      className="hero-headline-shimmer bg-clip-text text-transparent"
                      style={{
                        backgroundImage: "linear-gradient(90deg, hsl(var(--wine-deep)) 0%, hsl(350,65%,50%) 30%, hsl(var(--wine-glow)) 50%, hsl(350,65%,50%) 70%, hsl(var(--wine-deep)) 100%)",
                        filter: "drop-shadow(0 2px 6px hsla(353,41%,32%,0.18))",
                      }}
                    >
                      everyone remembers
                    </span>
                  </>
                )}
              </motion.h1>

              <motion.p
                variants={heroSubReveal}
                className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-8"
              >
                {isKa
                  ? "დაგეგმე სუფრა 60 წამში. AI დაწერს სადღეგრძელოებს. გააქტიურე ლაივ რეჟიმი და მიეცი ტრადიციას გზა."
                  : "Plan your supra in 60 seconds. AI writes your toasts. Go live and let the tradition flow."}
              </motion.p>

              <motion.div variants={heroCTAReveal} className="flex flex-col sm:flex-row items-start gap-4 mb-10">
                <Button variant="hero" size="lg" asChild className="btn-shimmer cta-glow h-14 px-10 text-lg rounded-xl shadow-wine">
                  <Link to="/auth/signup">
                    {isKa ? "დაიწყე უფასოდ" : "Start free"}
                    <SystemIcon name="action.next" size="md" className="ml-1.5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="text-muted-foreground h-14 px-8 text-base" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                  {isKa ? "როგორ მუშაობს?" : "See how it works"}
                </Button>
              </motion.div>

              {/* Mini-testimonial social proof */}
              <motion.div variants={heroTestimonialReveal} className="p-4 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm max-w-md">
                <div className="flex items-start gap-3.5">
                  <div className="flex -space-x-2.5 shrink-0">
                    {["გ", "ნ", "დ", "მ"].map((initial, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 1.8 + i * 0.08 }}
                        className="w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: [
                            "hsl(353,41%,32%)", "hsl(350,60%,45%)",
                            "hsl(43,53%,55%)", "hsl(349,69%,32%)",
                          ][i],
                          color: "white",
                        }}
                      >
                        {initial}
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80 italic leading-snug">
                      {isKa
                        ? `„ძმის ქორწილის სუფრა 10 წუთში დავგეგმე. 12 სადღეგრძელო AI-მ დაწერა. ყველა სტუმარი ტიროდა."`
                        : "\"Planned my brother's wedding supra in 10 minutes. AI wrote 12 toasts. Every guest cried.\""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                      {isKa ? "გიორგი კ., ქორწილის თამადა" : "Giorgi K., Wedding Host"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: product mockup -- parallax at 50px, float delayed */}
            <motion.div
              className="relative glow-behind hidden lg:block"
              style={{ perspective: "1200px", y: heroMockupY }}
              initial="initial"
              animate="animate"
              variants={heroMockupReveal}
            >
              <div className="mockup-float-delayed">
                <ProductMockup active={mockupActive} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border-2 border-wine-muted/40 flex items-start justify-center pt-1.5"
            animate={{ borderColor: ["hsla(350,30%,50%,0.4)", "hsla(350,30%,50%,0.15)", "hsla(350,30%,50%,0.4)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 rounded-full bg-wine-muted/60"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════ TRUST BAR ═══════════════ */}
      <motion.section
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, margin: "-20px" }}
        variants={scrollReveal}
        className="py-12 md:py-14 px-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsla(350,30%,93%,0.5) 0%, hsla(38,25%,97%,1) 40%, hsla(43,80%,94%,0.3) 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
          {[
            {
              icon: <SystemIcon name="nav.ai" size="lg" className="text-gold" />,
              number: "2,500+",
              text: isKa ? "სადღეგრძელო წარმოთქმული" : "Toasts Delivered",
              bg: "bg-gold-light/60",
            },
            {
              icon: <HornIcon size={24} className="text-wine-deep" />,
              number: "500+",
              text: isKa ? "სუფრა ჩატარებული" : "Feasts Hosted",
              bg: "bg-wine-light/60",
            },
            {
              icon: <WineGlassIcon size={24} className="text-wine-glow" />,
              number: "9",
              text: isKa ? "რეგიონი დაფარული" : "Regions Covered",
              bg: "bg-wine-light/40",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 justify-center ${
                i < 2 ? "md:border-r md:border-border/40" : ""
              } py-2 md:py-0`}
            >
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div>
                <span className="text-xl font-bold text-foreground block leading-tight">{item.number}</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ FEATURES (zig-zag) ═══════════════ */}
      <div id="features">
        <FeatureShowcase
          number="01"
          title={isKa ? "სადღეგრძელო, რომელიც გულს ეხება" : "Never Speechless at Supra"}
          subtitle={isKa ? "AI რომელიც შენს სტილს ესმის" : "AI that gets your style"}
          description={
            isKa
              ? "მიეცი AI-ს შემთხვევა და რეგიონი — მიიღე სადღეგრძელო, რომელიც ისე ჟღერს, თითქოს შენ დაწერე. კახეთი, იმერეთი თუ გურია — ტრადიცია ავთენტურია."
              : "Give AI the occasion and your region — get a toast that sounds like you wrote it. Kakheti, Imereti, or Guria — the tradition stays authentic."
          }
          bullets={
            isKa
              ? ["ავთენტური 9 რეგიონისთვის — კახეთიდან აჭარამდე", "არეგულირე: სახალისოდან ფორმალურამდე", "ქართულად და ინგლისურად, ერთი ღილაკით"]
              : ["Authentic for 9 regions — from Kakheti to Adjara", "Dial it in: from playful to formal", "Georgian & English, one tap away"]
          }
          bgStyle={{
            background: "radial-gradient(ellipse 60% 50% at 85% 20%, hsla(353,41%,32%,0.05) 0%, transparent 70%)",
          }}
          learnMoreHref="/auth/signup"
          learnMoreText={isKa ? "შექმენი პირველი სადღეგრძელო" : "Generate your first toast"}
          glowClass="glow-behind"
        >
          <AIMockup />
        </FeatureShowcase>

        <div className="section-divider max-w-lg mx-auto" />

        <FeatureShowcase
          number="02"
          title={isKa ? "შენი სუფრა, ავტოპილოტზე" : "Your Supra, on Autopilot"}
          subtitle={isKa ? "დაგეგმე ერთხელ, მართე მარტივად" : "Plan once, run effortlessly"}
          description={
            isKa
              ? "AI აწყობს სრულ სუფრის გეგმას. ლაივ რეჟიმში ტაიმერი, პროგრესი და ალავერდი თავისთავად მიედინება — შენ მხოლოდ ისიამოვნე."
              : "AI builds your full feast plan. In live mode, timers tick, progress tracks, and alaverdi flows by itself — you just enjoy the table."
          }
          bullets={
            isKa
              ? ["აღარ დაიკარგები — სუფრა თავად მიედინება", "ტაიმერი და პროგრესი ყველა სტუმრისთვის ჩანს", "ავტომატური რიგი ალავერდისთვის"]
              : ["Never lose track — your supra runs itself", "Timer and progress visible to every guest", "Automatic alaverdi ordering"]
          }
          reversed
          bgClass="bg-[hsl(38,20%,94%)]"
          learnMoreHref="/auth/signup"
          learnMoreText={isKa ? "დაგეგმე პირველი სუფრა" : "Plan your first feast"}
          glowClass="glow-behind-gold"
        >
          <FeastMockup />
        </FeatureShowcase>

        <div className="section-divider max-w-lg mx-auto" />

        <FeatureShowcase
          number="03"
          title={isKa ? "ყველას ხმა გაისმის" : "Every Voice Gets Heard"}
          subtitle={isKa ? "ალავერდი, რომელიც არავის ავიწყდება" : "Alaverdi no one forgets"}
          description={
            isKa
              ? "ვინ ილაპარაკა? ვინ არის შემდეგი? TAMADA აკონტროლებს ალავერდის რიგს და სტუმრების სიას — რომ სუფრაზე ყველას ადგილი ჰქონდეს."
              : "Who spoke? Who's next? TAMADA tracks alaverdi turns and your guest list — so no one is left out at the table."
          }
          bullets={
            isKa
              ? ["ხედავ ვინ ილაპარაკა და ვის რიგია", "AI-ი გთავაზობს შემდეგ მოლაპარაკეს", "რეალტაიმ სინქრო ყველა მოწყობილობაზე"]
              : ["See who spoke and whose turn is next", "AI suggests the next speaker", "Real-time sync across every device"]
          }
          bgStyle={{
            background: "radial-gradient(ellipse 50% 40% at 10% 70%, hsla(353,41%,32%,0.04) 0%, transparent 60%)",
          }}
          learnMoreHref="/auth/signup"
          learnMoreText={isKa ? "სცადე უფასოდ" : "Try it free"}
          glowClass="glow-behind-wine"
        >
          <AlaverdiMockup />
        </FeatureShowcase>
      </div>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-20 md:py-28 px-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsla(350,30%,93%,0.6) 0%, hsla(38,25%,97%,1) 35%, hsla(43,80%,94%,0.4) 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />

        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-wine-muted mb-3">
              {isKa ? "შეფასებები" : "Testimonials"}
            </p>
            <h2 className="font-display text-heading-1 text-foreground">
              {isKa ? "რას ამბობენ მომხმარებლები" : "What Our Users Say"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: isKa
                  ? "ძმის ქორწილის სუფრა 10 წუთში დავგეგმე. AI-მ 12 სადღეგრძელო დაწერა. ყველა სტუმარი ტიროდა."
                  : "I planned my brother's wedding supra in 10 minutes. AI wrote 12 toasts. Every guest cried.",
                name: isKa ? "გიორგი კ." : "Giorgi K.",
                role: isKa ? "ქორწილის თამადა" : "Wedding Host",
                initial: "გ",
              },
              {
                quote: isKa
                  ? "მამის დაბადების დღეზე თამადობა მეშინოდა. TAMADA-მ სიტყვებიც მომცა და თავდაჯერებულობაც."
                  : "I was terrified of being tamada at my father's birthday. TAMADA gave me the words and the confidence.",
                name: isKa ? "ნათია მ." : "Natia M.",
                role: isKa ? "პირველი თამადა" : "First-time Tamada",
                initial: "ნ",
              },
              {
                quote: isKa
                  ? "წელს 6 სუფრა ჩავატარეთ TAMADA-ით. ჩვენი კახური ტრადიციები ასე ცოცხალი არასდროს ყოფილა."
                  : "We've hosted 6 supras with TAMADA this year. Our Kakhetian traditions have never been this alive.",
                name: isKa ? "დავით ბ." : "Davit B.",
                role: isKa ? "ოჯახის უფროსი, კახეთი" : "Family Patriarch, Kakheti",
                initial: "დ",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotate: i === 0 ? -1 : i === 2 ? 1 : 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.15, ease: [0, 0, 0.2, 1] }}
                className="p-6 md:p-7 rounded-2xl bg-card border border-border hover:border-wine-muted/40 transition-all duration-300 hover:shadow-card-hover group"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <Quote className="h-5 w-5 text-wine-muted/40 mb-3" />
                <p className="text-foreground/80 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="h-px bg-border mb-4" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full wine-gradient flex items-center justify-center text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section
        id="how-it-works"
        className="py-20 md:py-28 px-6 bg-gradient-to-b from-surface-1 to-background"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, margin: "-80px" }}
            variants={scrollReveal}
            className="mb-14"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-wine-muted mb-3">
              {isKa ? "როგორ მუშაობს" : "How It Works"}
            </p>
            <h2 className="font-display text-heading-1 text-foreground">
              {isKa
                ? "სუფრამდე ოთხი ნაბიჯია"
                : "Four steps to a flawless supra"}
            </h2>
          </motion.div>

          <div className="relative" ref={timelineRef}>
            <motion.div
              className="timeline-line"
              style={{
                scaleY: timelineScale,
                transformOrigin: "top",
                bottom: "calc(100% - 100% + 56px)",
                width: "3px",
                left: "27px",
              }}
            />

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: isKa ? "აღწერე შენი სუფრა" : "Describe Your Feast",
                  desc: isKa
                    ? "მიუთითე შემთხვევა, სტილი და სტუმრების რაოდენობა. AI დანარჩენს თავად გააკეთებს."
                    : "Tell us the occasion, your style, and guest count. AI handles the rest.",
                  icon: <HornIcon size={22} className="text-white" />,
                  badge: isKa ? "~30 წამი" : "~30 sec",
                  mini: (
                    <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16">{isKa ? "შემთხვევა:" : "Occasion:"}</span>
                        <span className="px-2 py-0.5 bg-wine-light rounded text-[10px] font-medium text-wine-deep">{isKa ? "ქორწილი" : "Wedding"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16">{isKa ? "სტილი:" : "Style:"}</span>
                        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full w-[70%] wine-gradient rounded-full" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{isKa ? "ფორმალური" : "Formal"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16">{isKa ? "სტუმრები:" : "Guests:"}</span>
                        <span className="text-[10px] font-semibold text-foreground">45</span>
                      </div>
                    </div>
                  ),
                },
                {
                  step: "02",
                  title: isKa ? "მიიღე სუფრის გეგმა" : "Get Your Feast Plan",
                  desc: isKa
                    ? "AI გენერირებს სრულ სადღეგრძელოების ჩამონათვალს — შენი რეგიონის, შემთხვევის და პიროვნული სტილის მიხედვით."
                    : "AI generates your complete toast lineup — customized to your region, occasion, and personal style.",
                  icon: <SystemIcon name="nav.ai" size="md" className="text-white" />,
                  badge: isKa ? "მყისიერი" : "Instant",
                  mini: (
                    <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border space-y-1.5">
                      {[
                        { n: isKa ? "ღვთის სადღეგრძელო" : "Toast to God", done: true },
                        { n: isKa ? "სამშობლოს" : "To the homeland", done: true },
                        { n: isKa ? "მშობლების" : "To parents", active: true },
                      ].map((t, ti) => (
                        <div key={ti} className={`flex items-center gap-2 py-1 px-2 rounded text-[10px] ${t.active ? "bg-wine-light/50 font-semibold text-foreground" : t.done ? "text-muted-foreground" : "text-foreground/60"}`}>
                          <span className="w-3 text-[9px] text-muted-foreground font-mono">{ti + 1}</span>
                          <span className={t.done ? "line-through opacity-60" : ""}>{t.n}</span>
                          {t.done && <SystemIcon name="status.success" size="xs" className="text-green-500 ml-auto" />}
                          {t.active && <SystemIcon name="action.next" size="xs" className="text-wine-glow ml-auto" />}
                        </div>
                      ))}
                      <div className="text-[9px] text-muted-foreground text-center pt-1">{isKa ? "+ 9 სხვა სადღეგრძელო" : "+ 9 more toasts"}</div>
                    </div>
                  ),
                },
                {
                  step: "03",
                  title: isKa ? "გააქტიურე ლაივ რეჟიმი" : "Go Live",
                  desc: isKa
                    ? "დააჭირე ლაივ ღილაკს. ტაიმერები ეშვება. სადღეგრძელოები თანმიმდევრულად ჩნდება. ალავერდი ავტომატურად მიედინება."
                    : "Hit the live button. Timers start. Toasts appear one by one. Alaverdi flows automatically.",
                  icon: <Clock className="h-5 w-5 text-white" />,
                  badge: isKa ? "1 ღილაკი" : "1 tap",
                  mini: (
                    <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400">LIVE</span>
                        <span className="text-[10px] text-muted-foreground ml-auto font-mono">4:32</span>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full w-[38%] wine-gradient rounded-full" />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>{isKa ? "მშობლების" : "To parents"}</span>
                        <span>3/12</span>
                      </div>
                    </div>
                  ),
                },
                {
                  step: "04",
                  title: isKa ? "შეინახე და გააუმჯობესე" : "Save & Refine",
                  desc: isKa
                    ? "შეინახე საყვარელი სადღეგრძელოები. გააუმჯობესე AI-ით. ააშენე პერსონალური ბიბლიოთეკა შემდეგი სუფრისთვის."
                    : "Save your best toasts. Refine with AI feedback. Build a personal library for your next supra.",
                  icon: <WineGlassIcon size={22} className="text-white" />,
                  badge: isKa ? "სუფრის შემდეგ" : "Post-feast",
                  mini: (
                    <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <span className="text-[10px] font-semibold text-foreground">{isKa ? "ჩემი ფავორიტები" : "My Favorites"}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">7</span>
                      </div>
                      <div className="space-y-1">
                        {[isKa ? "მშობლების — ქორწილი" : "To parents — Wedding", isKa ? "მეგობრობის — დაბადების დღე" : "To friendship — Birthday"].map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2 text-[10px] text-foreground/70">
                            <Star className="h-2.5 w-2.5 fill-gold/50 text-gold/50" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={timelineStep(i)}
                  className="relative pl-20"
                >
                  <div className="absolute left-0 top-4 w-14 h-14 rounded-xl wine-gradient flex items-center justify-center shadow-wine z-10 ring-4 ring-wine-light/50">
                    {item.icon}
                  </div>
                  <div className="p-6 md:p-7 rounded-2xl bg-card border border-border hover:border-wine-muted/30 transition-all duration-200 hover:shadow-card-hover">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-wine-muted">
                        {isKa ? "ნაბიჯი" : "Step"} {item.step}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-wine-light/60 text-[9px] font-bold text-wine-deep tracking-wide">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-heading-3 text-foreground mt-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      {item.desc}
                    </p>
                    {item.mini}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* End-of-timeline CTA */}
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, margin: "-40px" }}
              variants={scrollReveal}
              className="mt-16 text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                {isKa ? "პირველი სუფრა უფასოა. კრედიტ ბარათი არ სჭირდება." : "Your first feast is free. No credit card needed."}
              </p>
              <Button variant="wine" size="lg" asChild className="shadow-wine">
                <Link to="/auth/signup">
                  {isKa ? "შექმენი პირველი სუფრა" : "Create Your First Feast"}
                  <SystemIcon name="action.next" size="sm" className="ml-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CULTURAL MISSION ═══════════════ */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden noise-overlay"
        style={{
          background: "linear-gradient(135deg, hsl(353,38%,22%) 0%, hsl(349,50%,26%) 40%, hsl(350,42%,22%) 100%)",
        }}
      >
        {/* Georgian ornamental pattern overlay */}
        <div className="absolute inset-0 grapevine-bg opacity-[0.10] pointer-events-none" style={{ filter: "invert(1)" }} />
        {/* Large qvevri watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-[0.08] pointer-events-none">
          <QvevriIcon size={320} className="text-white" />
        </div>
        <div className="absolute -left-8 top-12 opacity-[0.05] pointer-events-none rotate-12">
          <HornIcon size={200} className="text-white" />
        </div>

        <MissionStats isKa={isKa} />
      </section>

      {/* ═══════════════ PRICING PREVIEW ═══════════════ */}
      <PricingSection isKa={isKa} />

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-28 md:py-36 px-6 wine-bg-full relative overflow-hidden noise-overlay">
        {/* Animated floating toast quote fragments */}
        {[
          { text: "გაუმარჯოს!", pos: "top-12 left-[8%]", rotate: -6, opacity: 0.15, duration: 6 },
          { text: "ალავერდი!", pos: "bottom-16 right-[10%]", rotate: 4, opacity: 0.12, duration: 7 },
          { text: "სიყვარულს!", pos: "top-1/3 right-[5%]", rotate: -3, opacity: 0.10, duration: 8 },
          { text: "მშობლებს!", pos: "bottom-1/3 left-[5%]", rotate: 5, opacity: 0.08, duration: 9 },
        ].map((q, i) => (
          <motion.span
            key={i}
            className={`absolute ${q.pos} font-display text-white text-2xl md:text-3xl pointer-events-none select-none`}
            style={{ transform: `rotate(${q.rotate}deg)`, opacity: q.opacity }}
            animate={{ y: [0, -10, 0], rotate: [q.rotate, q.rotate + 2, q.rotate] }}
            transition={{ duration: q.duration, repeat: Infinity, ease: "easeInOut" }}
          >
            {q.text}
          </motion.span>
        ))}

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
        >
          <HornIcon size={56} className="text-white/70 mx-auto mb-6" />

          {/* Testimonial quote */}
          <p className="text-white/50 italic text-base mb-6 max-w-md mx-auto">
            {isKa
              ? `„მამის დაბადების დღეზე თამადობა მეშინოდა. TAMADA-მ თავდაჯერებულობა მომცა."`
              : "\"I was terrified of being tamada. TAMADA gave me the confidence.\""}
          </p>

          <h2
            className="font-display text-white mb-6"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {isKa ? (
              <>
                შენი შემდეგი სუფრა მოდის.
                <br />
                მზად იქნები?
              </>
            ) : (
              <>
                Your next supra is coming.
                <br />
                Will you be ready?
              </>
            )}
          </h2>
          <p className="text-lg text-white/60 max-w-lg mx-auto mb-10 leading-relaxed">
            {isKa
              ? "შეუერთდი მზარდ საზოგადოებას, რომელიც ქართული სუფრის ტრადიციას AI-ის ძალით აღადგენს."
              : "Join a growing community bringing Georgian feast traditions back to life with the power of AI."}
          </p>
          <Button
            variant="hero"
            size="lg"
            asChild
            className="btn-shimmer bg-white text-wine-deep hover:bg-white/95 shadow-elevated h-14 px-10 text-lg rounded-xl font-semibold"
          >
            <Link to="/auth/signup">
              {isKa ? "დაიწყე უფასოდ" : "Start free"}
              <SystemIcon name="action.next" size="md" className="ml-1.5" />
            </Link>
          </Button>
          <p className="text-sm text-white/40 mt-5">
            {isKa ? "კრედიტ ბარათი არ სჭირდება" : "No credit card required"}
          </p>
        </motion.div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-surface-1 relative">
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg wine-gradient flex items-center justify-center">
                  <HornIcon size={16} className="text-white" />
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  TAMADA
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                {isKa
                  ? "ტრადიცია ტექნოლოგიასთან ერთად — AI-ით გაძლიერებული სუფრა."
                  : "Tradition meets technology — AI-powered Georgian feasts."}
              </p>
              {/* Social icons */}
              <div className="flex gap-2.5 mt-5">
                {[
                  {
                    label: "Facebook",
                    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  },
                  {
                    label: "Instagram",
                    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
                  },
                  {
                    label: "X",
                    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-3 hover:scale-110 transition-all duration-200"
                    aria-label={s.label}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Product & Resources (consolidated) */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {isKa ? "პროდუქტი" : "Product"}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: isKa ? "ფუნქციები" : "Features", anchor: "#features" },
                  { label: isKa ? "როგორ მუშაობს" : "How It Works", anchor: "#how-it-works" },
                  { label: isKa ? "ფასები" : "Pricing", anchor: "#pricing" },
                  { label: isKa ? "AI გენერატორი" : "AI Generator", anchor: "#features" },
                ].map((link) => (
                  <li key={link.anchor + link.label}>
                    <a
                      href={link.anchor}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {isKa ? "სამართლებრივი" : "Legal"}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {isKa ? "კონფიდენციალურობა" : "Privacy Policy"}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {isKa ? "წესები და პირობები" : "Terms of Service"}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {isKa ? "დახმარება" : "Help"}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar with back-to-top */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 TAMADA — {isKa ? "ყველა უფლება დაცულია" : "All rights reserved"}
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                {isKa ? "შექმნილია საქართველოში ♥" : "Made in Georgia ♥"}
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-all duration-200"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
