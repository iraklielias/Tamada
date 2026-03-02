import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import GrapevineDecor from "@/components/GrapevineDecor";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import QvevriIcon from "@/components/icons/QvevriIcon";
import { staggerContainer, staggerChild } from "@/lib/animations";
import { Sparkles, CalendarDays, Users, Crown } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "ჭკვიანი სადღეგრძელოები",
    subtitle: "Smart Toasts",
    description: "AI-powered toast generation that respects tradition while personalizing for every occasion.",
  },
  {
    icon: <CalendarDays className="h-6 w-6" />,
    title: "სუფრის მართვა",
    subtitle: "Feast Management",
    description: "Plan your supra from start to finish — schedule toasts, track timing, stay in control.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "ალავერდი",
    subtitle: "Alaverdi Tracking",
    description: "Assign and track alaverdi across guests, ensuring everyone gets their moment.",
  },
  {
    icon: <Crown className="h-6 w-6" />,
    title: "პრო თამადა",
    subtitle: "Pro Tamada",
    description: "Unlimited AI toasts, co-Tamada mode, PDF export, feast analytics, and more.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Subtle grapevine background pattern */}
        <div className="absolute inset-0 grapevine-bg opacity-40 pointer-events-none" />

        <motion.div
          className="relative z-10 text-center max-w-3xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Horn icon */}
          <motion.div variants={staggerChild} className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl wine-gradient flex items-center justify-center shadow-elevated">
              <HornIcon size={32} className="text-primary-foreground" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={staggerChild}
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tighter mb-3"
          >
            TAMADA
          </motion.h1>

          {/* Georgian subtitle */}
          <motion.p
            variants={staggerChild}
            className="text-xl md:text-2xl text-wine font-semibold mb-3"
          >
            შენი ციფრული თამადა
          </motion.p>

          {/* English subtitle */}
          <motion.p
            variants={staggerChild}
            className="text-lg text-muted-foreground max-w-lg mx-auto mb-10"
          >
            Plan, manage, and lead unforgettable Georgian feasts with AI-powered intelligence and cultural wisdom.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={staggerChild} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              <WineGlassIcon size={20} />
              დაიწყე უფასოდ
            </Button>
            <Button variant="hero-outline" size="lg">
              გაიგე მეტი
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <GrapevineDecor />

      {/* Features Section */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerChild} className="text-center mb-16">
            <h2 className="text-heading-1 text-foreground mb-3">
              ყველაფერი, რაც თამადას სჭირდება
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything a Tamada needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={staggerChild}
                className="group p-6 rounded-xl border border-border bg-card hover:border-wine-muted hover:shadow-card-hover transition-all duration-200 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-wine-light flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-heading-3 text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-muted-foreground mb-2 font-medium">
                  {feature.subtitle}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <GrapevineDecor />

      {/* How It Works */}
      <section className="py-20 px-6 bg-secondary/50">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerChild} className="text-center mb-16">
            <h2 className="text-heading-1 text-foreground mb-3">
              როგორ მუშაობს
            </h2>
            <p className="text-lg text-muted-foreground">How it works</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: <CalendarDays className="h-7 w-7" />,
                title: "შექმენი სუფრა",
                subtitle: "Create your feast plan with smart templates",
              },
              {
                step: "2",
                icon: <QvevriIcon size={28} />,
                title: "მიჰყევი გეგმას",
                subtitle: "Follow the intelligent toast schedule live",
              },
              {
                step: "3",
                icon: <HornIcon size={28} />,
                title: "ისიამოვნე სუფრით",
                subtitle: "Lead an unforgettable supra experience",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={staggerChild} className="text-center">
                <div className="w-14 h-14 rounded-2xl wine-gradient flex items-center justify-center text-primary-foreground mx-auto mb-4 shadow-card">
                  {item.icon}
                </div>
                <div className="text-caption text-wine-muted font-bold mb-2">
                  ნაბიჯი {item.step}
                </div>
                <h3 className="text-heading-3 text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-body-sm text-muted-foreground">
                  {item.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HornIcon size={20} className="text-primary" />
            <span className="font-bold text-foreground">TAMADA</span>
          </div>
          <p className="text-caption text-muted-foreground">
            © 2026 TAMADA — შენი ციფრული თამადა
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
