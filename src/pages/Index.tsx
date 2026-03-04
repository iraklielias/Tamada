import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import QvevriIcon from "@/components/icons/QvevriIcon";
import {
  heroStagger,
  heroReveal,
  staggerChild,
  staggerContainer,
  scrollReveal,
  scrollRevealScale,
} from "@/lib/animations";
import {
  Sparkles,
  CalendarDays,
  Users,
  Crown,
  ArrowRight,
  Star,
  Zap,
  BookOpen,
  Timer,
  ChevronDown,
} from "lucide-react";

/* ─── Floating decorative elements for hero ─── */
const FloatingElement = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.8 + delay, duration: 0.8, ease: [0, 0, 0.2, 1] }}
  >
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </motion.div>
);

/* ─── Scroll-aware landing navbar ─── */
const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav border-b border-border shadow-card py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl wine-gradient flex items-center justify-center shadow-wine group-hover:scale-105 transition-transform">
            <HornIcon size={18} className="text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            TAMADA
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/auth/login">შესვლა</Link>
          </Button>
          <Button variant="wine" size="sm" asChild>
            <Link to="/auth/signup">
              დაიწყე უფასოდ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

/* ─── Feature data ─── */
const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "ჭკვიანი სადღეგრძელოები",
    subtitle: "AI-Powered Toasts",
    description:
      "Generate culturally authentic toasts with AI that learns your style, occasion preferences, and personal touch.",
    gradient: "from-wine-deep to-wine-glow",
  },
  {
    icon: <CalendarDays className="h-6 w-6" />,
    title: "სუფრის მართვა",
    subtitle: "Feast Planning",
    description:
      "Create detailed feast plans with smart templates, timing controls, and real-time progress tracking.",
    gradient: "from-gold to-warning",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "ალავერდი",
    subtitle: "Guest & Alaverdi",
    description:
      "Track guest alaverdi assignments, manage seating, and ensure every voice is heard at the table.",
    gradient: "from-success to-emerald-600",
  },
  {
    icon: <Crown className="h-6 w-6" />,
    title: "პრო თამადა",
    subtitle: "Pro Features",
    description:
      "Unlimited AI generation, co-Tamada collaboration, PDF export, feast analytics, and priority support.",
    gradient: "from-gold to-amber-500",
  },
];

/* ─── Testimonial data ─── */
const testimonials = [
  {
    quote: "TAMADA-მ სრულიად შეცვალა ჩემი სუფრის გამოცდილება. სადღეგრძელოები ბუნებრივი და გულწრფელია.",
    name: "გიორგი მ.",
    role: "თამადა, თბილისი",
    stars: 5,
  },
  {
    quote: "As someone learning Georgian traditions, this app is invaluable. The AI understands context beautifully.",
    name: "Sarah K.",
    role: "Cultural Enthusiast, London",
    stars: 5,
  },
  {
    quote: "პროფესიონალური ღონისძიებებისთვის შეუცვლელია. დროის მართვა და სადღეგრძელოების თანმიმდევრობა იდეალურია.",
    name: "ნინო ბ.",
    role: "ივენთ მენეჯერი, ბათუმი",
    stars: 5,
  },
];

/* ─── Stats ─── */
const stats = [
  { value: "2,500+", label: "სადღეგრძელო", sublabel: "Toasts Generated" },
  { value: "800+", label: "სუფრა", sublabel: "Feasts Planned" },
  { value: "4.9", label: "რეიტინგი", sublabel: "User Rating" },
];

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.97]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />

      {/* ═══════════════ HERO ═══════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden"
      >
        {/* Radial gradient background */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Animated gradient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] animate-gradient-shift"
          style={{
            background: "linear-gradient(135deg, hsl(353 41% 32%), hsl(43 53% 55%), hsl(350 60% 45%))",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Subtle pattern */}
        <div className="absolute inset-0 grapevine-bg opacity-30 pointer-events-none" />

        {/* Floating decorative elements */}
        <FloatingElement className="top-[15%] left-[8%] md:left-[15%] opacity-60" delay={0}>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-wine-light/60 flex items-center justify-center backdrop-blur-sm border border-wine-muted/20">
            <WineGlassIcon size={24} className="text-wine" />
          </div>
        </FloatingElement>
        <FloatingElement className="top-[20%] right-[8%] md:right-[15%] opacity-50" delay={0.5}>
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gold-light/60 flex items-center justify-center backdrop-blur-sm border border-gold/20">
            <Star size={20} className="text-gold" />
          </div>
        </FloatingElement>
        <FloatingElement className="bottom-[25%] left-[5%] md:left-[12%] opacity-40" delay={1}>
          <div className="w-10 h-10 rounded-xl bg-wine-light/50 flex items-center justify-center backdrop-blur-sm border border-wine-muted/20">
            <QvevriIcon size={20} className="text-wine-muted" />
          </div>
        </FloatingElement>
        <FloatingElement className="bottom-[20%] right-[6%] md:right-[10%] opacity-40" delay={0.7}>
          <div className="w-12 h-12 rounded-xl bg-wine-light/40 flex items-center justify-center backdrop-blur-sm border border-wine-muted/10">
            <Sparkles size={18} className="text-wine-muted" />
          </div>
        </FloatingElement>

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={heroStagger}
        >
          {/* Badge */}
          <motion.div variants={heroReveal} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wine-light/80 border border-wine-muted/30 backdrop-blur-sm">
              <Zap size={14} className="text-wine" />
              <span className="text-caption text-wine font-semibold">AI-Powered Feast Management</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={heroReveal}
            className="font-display text-display text-foreground mb-6"
          >
            შენი ციფრული
            <br />
            <span className="bg-gradient-to-r from-wine-deep via-wine-glow to-wine-rich bg-clip-text text-transparent">
              თამადა
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={heroReveal}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Plan, manage, and lead unforgettable Georgian feasts with AI that
            understands tradition, learns your style, and ensures every toast
            lands perfectly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={heroReveal}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth/signup">
                <WineGlassIcon size={20} />
                დაიწყე უფასოდ
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/auth/login">შესვლა</Link>
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={heroReveal}
            className="flex flex-wrap justify-center gap-8 md:gap-12"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground font-display">
                  {stat.value}
                </div>
                <div className="text-caption text-muted-foreground mt-1">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════ PROBLEM / AGITATION ═══════════════ */}
      <section className="py-24 md:py-32 px-6 bg-surface-1">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
        >
          <h2 className="font-display text-heading-1 text-foreground mb-6">
            ტრადიცია იკარგება
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
            The art of the Georgian supra is fading. Younger generations
            struggle with toast sequences, timing, and cultural nuance. Knowledge
            lives in the heads of aging tamadas, not in tools anyone can use.
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "ცოდნა იკარგება",
                desc: "Toast traditions are oral, scattered, and undocumented for modern use.",
              },
              {
                icon: <Timer className="h-6 w-6" />,
                title: "დრო არ არის",
                desc: "Planning a proper supra takes hours of preparation most people can't spare.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "თამადა ძნელია",
                desc: "Leading a feast with confidence requires experience few young hosts have.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  offscreen: { opacity: 0, y: 30 },
                  onscreen: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-wine-light flex items-center justify-center text-wine mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="text-heading-3 text-foreground mb-2">{item.title}</h3>
                <p className="text-body-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-24 md:py-32 px-6">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-heading-1 text-foreground mb-4">
              ყველაფერი, რაც თამადას სჭირდება
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Everything a modern Tamada needs — from intelligent toast
              generation to real-time feast orchestration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  offscreen: { opacity: 0, y: 24 },
                  onscreen: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.08, duration: 0.45, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="group card-interactive p-7"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-wine-light flex items-center justify-center text-wine shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-heading-3 text-foreground mb-0.5">
                      {feature.title}
                    </h3>
                    <p className="text-caption text-wine-muted font-semibold mb-2">
                      {feature.subtitle}
                    </p>
                    <p className="text-body-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-24 md:py-32 px-6 bg-surface-1 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 grapevine-bg opacity-20 pointer-events-none" />

        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-heading-1 text-foreground mb-4">
              როგორ მუშაობს
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to an unforgettable supra
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-[56px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px bg-gradient-to-r from-wine-muted/40 via-wine-muted/60 to-wine-muted/40" />

            {[
              {
                step: "1",
                icon: <CalendarDays className="h-7 w-7" />,
                title: "შექმენი სუფრა",
                subtitle: "Create your feast plan — choose a template or build from scratch with AI assistance.",
              },
              {
                step: "2",
                icon: <QvevriIcon size={28} />,
                title: "მიჰყევი გეგმას",
                subtitle: "Follow the intelligent toast schedule live with timing alerts and alaverdi tracking.",
              },
              {
                step: "3",
                icon: <HornIcon size={28} />,
                title: "ისიამოვნე სუფრით",
                subtitle: "Lead an unforgettable supra where every toast flows naturally and every guest shines.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  offscreen: { opacity: 0, y: 30 },
                  onscreen: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.12, duration: 0.5, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="text-center relative"
              >
                {/* Step number badge */}
                <div className="relative inline-flex mb-5">
                  <div className="w-14 h-14 rounded-2xl wine-gradient flex items-center justify-center text-primary-foreground shadow-wine">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold text-gold-foreground flex items-center justify-center text-xs font-bold shadow-card">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-heading-3 text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {item.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ SOCIAL PROOF ═══════════════ */}
      <section className="py-24 md:py-32 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollReveal}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-heading-1 text-foreground mb-4">
              რას ამბობენ მომხმარებლები
            </h2>
            <p className="text-lg text-muted-foreground">
              Trusted by tamadas across Georgia and beyond
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  offscreen: { opacity: 0, y: 24 },
                  onscreen: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.1, duration: 0.45, ease: [0, 0, 0.2, 1] },
                  },
                }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-wine-muted/40 hover:shadow-card-hover transition-all duration-200"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star
                      key={si}
                      size={14}
                      className="text-gold fill-gold"
                    />
                  ))}
                </div>

                <p className="text-body-sm text-foreground mb-6 leading-relaxed italic">
                  "{t.quote}"
                </p>

                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-caption text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 wine-gradient opacity-[0.04]" />
        <div className="absolute inset-0 hero-gradient opacity-60" />

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, margin: "-80px" }}
          variants={scrollRevealScale}
        >
          <div className="w-16 h-16 rounded-2xl wine-gradient flex items-center justify-center mx-auto mb-8 shadow-wine">
            <HornIcon size={32} className="text-primary-foreground" />
          </div>

          <h2 className="font-display text-heading-1 md:text-display-sm text-foreground mb-6">
            მზად ხარ იყო
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-wine-deep to-wine-glow bg-clip-text text-transparent">
              საუკეთესო თამადა?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Join hundreds of hosts who are rediscovering the beauty of Georgian
            feast traditions with the power of modern technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth/signup">
                <WineGlassIcon size={20} />
                შექმენი ანგარიში
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-border bg-surface-1">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl wine-gradient flex items-center justify-center shadow-wine">
                  <HornIcon size={18} className="text-primary-foreground" />
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  TAMADA
                </span>
              </div>
              <p className="text-body-sm text-muted-foreground leading-relaxed">
                შენი ციფრული თამადა — AI-powered Georgian feast management.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                პროდუქტი
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "სადღეგრძელოები", to: "/toasts" },
                  { label: "AI გენერატორი", to: "/ai-generate" },
                  { label: "ბიბლიოთეკა", to: "/library" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                კომპანია
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "განახლება", to: "/upgrade" },
                  { label: "შესვლა", to: "/auth/login" },
                  { label: "რეგისტრაცია", to: "/auth/signup" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                სამართლებრივი
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <span className="text-body-sm text-muted-foreground">
                    კონფიდენციალურობა
                  </span>
                </li>
                <li>
                  <span className="text-body-sm text-muted-foreground">
                    წესები და პირობები
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-caption text-muted-foreground">
              © 2026 TAMADA — ყველა უფლება დაცულია
            </p>
            <p className="text-caption text-muted-foreground">
              Made with ♥ for Georgian tradition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
