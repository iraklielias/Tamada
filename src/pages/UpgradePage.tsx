import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProGate } from "@/hooks/useProGate";
import SystemIcon from "@/components/SystemIcon";
import { motion } from "framer-motion";
import { staggerContainer, staggerChild } from "@/lib/animations";

type FeatureRow = {
  nameKey: string;
  free: string | boolean;
  freeKey?: string;
  pro: string | boolean;
  proKey?: string;
  highlight?: boolean;
};

const featureRows: FeatureRow[] = [
  { nameKey: "upgrade.aiGeneration", free: "5/day", freeKey: "5", pro: "100/day", proKey: "100", highlight: true },
  { nameKey: "favorites.title", free: "10", pro: "unlimited", proKey: "upgrade.unlimited", highlight: true },
  { nameKey: "upgrade.activeFeasts", free: "1", pro: "unlimited", proKey: "upgrade.unlimited", highlight: true },
  { nameKey: "upgrade.toastLibrary", free: true, pro: true },
  { nameKey: "upgrade.cotamadaRealtime", free: true, pro: true },
  { nameKey: "upgrade.pdfExport", free: false, pro: true },
  { nameKey: "upgrade.prioritySupport", free: false, pro: true },
];

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPro } = useProGate();
  const { t } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);

  const renderCell = (val: string | boolean) => {
    if (val === true) return <SystemIcon name="status.success" size="sm" tone="success" className="mx-auto" />;
    if (val === false) return <SystemIcon name="status.error" size="sm" tone="muted" className="mx-auto" />;
    return <span>{val}</span>;
  };

  const getFreeLabel = (row: FeatureRow): string | boolean => {
    if (typeof row.free === "boolean") return row.free;
    if (row.nameKey === "upgrade.aiGeneration") return `5/${t("ai.today")}`;
    return row.free;
  };

  const getProLabel = (row: FeatureRow): string | boolean => {
    if (typeof row.pro === "boolean") return row.pro;
    if (row.proKey === "upgrade.unlimited") return t("upgrade.unlimited");
    if (row.nameKey === "upgrade.aiGeneration") return `100/${t("ai.today")}`;
    return row.pro;
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
          <SystemIcon name="action.back" size="md" />
        </Button>
        <div>
          <h1 className="text-heading-1 font-display text-foreground flex items-center gap-2">
            {t("upgrade.title")}
            <Badge className="gold-gradient text-foreground text-xs border-0 shadow-gold">
              <SystemIcon name="nav.upgrade" size="xs" className="mr-0.5" /> PRO
            </Badge>
          </h1>
          <p className="text-body-sm text-muted-foreground">{t("upgrade.subtitle")}</p>
        </div>
      </motion.div>

      {/* Active PRO status */}
      {isPro && (
        <motion.div variants={staggerChild}>
          <Card className="border-gold/30 overflow-hidden">
            <div className="h-1 gold-gradient" />
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shrink-0 shadow-gold">
                <SystemIcon name="nav.upgrade" size="sm" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("upgrade.youArePro")}</p>
                <p className="text-xs text-muted-foreground">{t("upgrade.allUnlocked")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Benefit highlights */}
      {!isPro && (
        <motion.div variants={staggerChild} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-4 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <SystemIcon name="nav.ai" size="sm" tone="primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("upgrade.benefit1Title", "100 AI Toasts/Day")}</p>
              <p className="text-[11px] text-muted-foreground">{t("upgrade.benefit1Desc", "Generate unlimited personalized toasts with AI")}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-4 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <SystemIcon name="nav.feasts" size="sm" tone="primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("upgrade.benefit2Title", "Unlimited Feasts")}</p>
              <p className="text-[11px] text-muted-foreground">{t("upgrade.benefit2Desc", "Host as many feasts as you want simultaneously")}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-4 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <SystemIcon name="nav.upgrade" size="sm" tone="primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("upgrade.benefit3Title", "PDF Export")}</p>
              <p className="text-[11px] text-muted-foreground">{t("upgrade.benefit3Desc", "Export your feast plans to beautiful PDF documents")}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Table */}
      <motion.div variants={staggerChild}>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-3">
            <div className="p-3.5 bg-surface-1 font-semibold text-sm text-foreground border-b border-border">{t("upgrade.feature")}</div>
            <div className="p-3.5 bg-surface-1 text-center font-semibold text-sm text-muted-foreground border-b border-border">{t("upgrade.free")}</div>
            <div className="p-3.5 gold-gradient text-center font-semibold text-sm text-foreground border-b border-border flex items-center justify-center gap-1.5">
              <SystemIcon name="nav.upgrade" size="xs" /> PRO
            </div>

            {featureRows.map((f, i) => (
              <React.Fragment key={i}>
                <div className={`p-3.5 text-sm text-foreground border-b border-border/50 flex items-center ${i % 2 === 0 ? "bg-card" : "bg-surface-1/50"}`}>
                  {t(f.nameKey)}
                </div>
                <div className={`p-3.5 text-center text-sm text-muted-foreground border-b border-border/50 ${i % 2 === 0 ? "bg-card" : "bg-surface-1/50"}`}>
                  {renderCell(getFreeLabel(f))}
                </div>
                <div className={`p-3.5 text-center text-sm font-medium border-b border-border/50 ${f.highlight ? "text-primary font-semibold" : "text-foreground"} ${i % 2 === 0 ? "bg-card" : "bg-surface-1/50"}`}>
                  {renderCell(getProLabel(f))}
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
                <SystemIcon name="nav.upgrade" size="lg" />
              </div>

              {/* Monthly/Annual toggle */}
              <div className="inline-flex items-center rounded-xl bg-surface-1 p-1">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!isAnnual ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setIsAnnual(false)}
                >
                  {t("upgrade.monthly")}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isAnnual ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setIsAnnual(true)}
                >
                  {t("upgrade.annual")}
                  <Badge variant="outline" className="ml-1.5 text-success border-success/30 text-[10px]">
                    {t("upgrade.annualSave")}
                  </Badge>
                </button>
              </div>

              <div>
                <p className="text-4xl font-bold font-display text-foreground">
                  {isAnnual ? "₾99" : "₾9.99"}
                  <span className="text-lg text-muted-foreground font-normal">
                    {isAnnual ? t("upgrade.perYear") : t("upgrade.perMonth")}
                  </span>
                </p>
                {isAnnual && (
                  <p className="text-body-sm text-success mt-1 font-medium">
                    ₾8.25{t("upgrade.perMonth")} — {t("upgrade.annualSave")}
                  </p>
                )}
              </div>

              {/* Coming soon state */}
              <div className="rounded-xl bg-surface-1 border border-border p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                  <SystemIcon name="status.time" size="sm" tone="primary" />
                  {t("upgrade.comingSoon")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("upgrade.comingSoonDesc")}
                </p>
              </div>

              <p className="text-caption text-muted-foreground">
                {t("upgrade.securePayment")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UpgradePage;
