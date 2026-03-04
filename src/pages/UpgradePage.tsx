import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProGate } from "@/hooks/useProGate";
import { Star, Check, Zap, ArrowLeft, X } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerChild } from "@/lib/animations";

const features = [
  { name: "AI სადღეგრძელო გენერაცია", free: "5/დღეში", pro: "100/დღეში", highlight: true },
  { name: "რჩეულები", free: "10", pro: "შეუზღუდავი", highlight: true },
  { name: "აქტიური სუფრები", free: "1", pro: "შეუზღუდავი", highlight: true },
  { name: "სადღეგრძელოების ბიბლიოთეკა", free: true, pro: true },
  { name: "კო-თამადა & რეალტაიმი", free: true, pro: true },
  { name: "PDF ექსპორტი", free: false, pro: true },
  { name: "პრიორიტეტული მხარდაჭერა", free: false, pro: true },
];

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPro } = useProGate();

  const renderCell = (val: string | boolean) => {
    if (val === true) return <Check className="h-4 w-4 text-success mx-auto" />;
    if (val === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
    return <span>{val}</span>;
  };

  return (
    <motion.div
      className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-24"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={staggerChild} className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl bg-surface-1 hover:bg-surface-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-heading-1 font-display text-foreground flex items-center gap-2">
            PRO გეგმა
            <Badge className="gold-gradient text-foreground text-xs border-0 shadow-gold">
              <Star className="h-3 w-3 mr-0.5" /> PRO
            </Badge>
          </h1>
          <p className="text-body-sm text-muted-foreground">განბლოკეთ ყველა ფუნქცია</p>
        </div>
      </motion.div>

      {/* Active PRO status */}
      {isPro && (
        <motion.div variants={staggerChild}>
          <Card className="border-gold/30 overflow-hidden">
            <div className="h-1 gold-gradient" />
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shrink-0 shadow-gold">
                <Star className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">თქვენ PRO მომხმარებელი ხართ!</p>
                <p className="text-xs text-muted-foreground">ყველა ფუნქცია ხელმისაწვდომია</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Table */}
      <motion.div variants={staggerChild}>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-3">
            {/* Header row */}
            <div className="p-3.5 bg-surface-1 font-semibold text-sm text-foreground border-b border-border">ფუნქცია</div>
            <div className="p-3.5 bg-surface-1 text-center font-semibold text-sm text-muted-foreground border-b border-border">უფასო</div>
            <div className="p-3.5 gold-gradient text-center font-semibold text-sm text-foreground border-b border-border flex items-center justify-center gap-1.5">
              <Star className="h-3.5 w-3.5" /> PRO
            </div>

            {/* Feature rows */}
            {features.map((f, i) => (
              <React.Fragment key={i}>
                <div className={`p-3.5 text-sm text-foreground border-b border-border/50 flex items-center ${i % 2 === 0 ? "bg-card" : "bg-surface-1/50"}`}>
                  {f.name}
                </div>
                <div className={`p-3.5 text-center text-sm text-muted-foreground border-b border-border/50 ${i % 2 === 0 ? "bg-card" : "bg-surface-1/50"}`}>
                  {renderCell(f.free)}
                </div>
                <div className={`p-3.5 text-center text-sm font-medium border-b border-border/50 ${f.highlight ? "text-primary font-semibold" : "text-foreground"} ${i % 2 === 0 ? "bg-card" : "bg-surface-1/50"}`}>
                  {renderCell(f.pro)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* CTA */}
      {!isPro && (
        <motion.div variants={staggerChild}>
          <Card className="border-gold/30 overflow-hidden">
            <div className="h-1 gold-gradient" />
            <CardContent className="p-8 text-center space-y-5">
              <div className="h-20 w-20 rounded-2xl gold-gradient flex items-center justify-center mx-auto shadow-gold">
                <Star className="h-10 w-10 text-foreground" />
              </div>
              <div>
                <p className="text-4xl font-bold font-display text-foreground">₾9.99<span className="text-lg text-muted-foreground font-normal">/თვეში</span></p>
                <p className="text-body-sm text-muted-foreground mt-2">ან ₾99/წელიწადში <Badge variant="outline" className="ml-1 text-success border-success/30 text-[10px]">2 თვე უფასო</Badge></p>
              </div>
              <Button className="w-full gold-gradient text-foreground border-0 shadow-gold hover:opacity-90" size="lg" onClick={() => sonnerToast.info("მალე დაემატება! Stripe ინტეგრაცია მზადდება.")}>
                <Zap className="h-4 w-4 mr-2" /> გააქტიურე PRO
              </Button>
              <p className="text-caption text-muted-foreground">
                Stripe-ით უსაფრთხო გადახდა. გაუქმება ნებისმიერ დროს.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UpgradePage;
