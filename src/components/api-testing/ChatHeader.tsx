import React from "react";
import { Wine, Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UsageInfo } from "@/types/external-api";

interface ChatHeaderProps {
  language: "ka" | "en";
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  onReset?: () => void;
  usage: UsageInfo | null;
  extractedParams: Record<string, unknown> | null;
  hasMessages?: boolean;
}

const PARAM_LABELS: Record<string, Record<string, string>> = {
  occasion_type: { wedding: "💒 ქორწილი", birthday: "🎂 დაბადების დღე", memorial: "🕯️ ქელეხი", christening: "⛪ ნათლობა", guest: "🏠 სტუმარი", friendly: "🤝 მეგობრული", holiday: "🎉 სადღესასწაულო", corporate: "💼 კორპორატიული", supra: "🍷 სუფრა" },
};

export function ChatHeader({ language, onToggleLanguage, onOpenSettings, onReset, usage, extractedParams, hasMessages }: ChatHeaderProps) {
  const paramBadges: string[] = [];
  if (extractedParams) {
    const occ = extractedParams.occasion_type as string;
    if (occ) paramBadges.push(PARAM_LABELS.occasion_type[occ] || occ);
    if (extractedParams.person_name) paramBadges.push(`👤 ${extractedParams.person_name}`);
    if (extractedParams.formality_level) paramBadges.push(String(extractedParams.formality_level));
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
        <Wine className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-xs md:text-sm font-display font-bold text-foreground leading-tight truncate">
          {language === "ka" ? "თამადა AI" : "TAMADA AI"}
        </h1>
        {paramBadges.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 overflow-x-auto scrollbar-none">
            {paramBadges.map((b, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 whitespace-nowrap">
                {b}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {usage && (
        <Badge variant="outline" className="text-[10px] h-5 flex-shrink-0 hidden sm:flex">
          {usage.used_today}/{usage.daily_limit}
        </Badge>
      )}

      {hasMessages && onReset && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          onClick={onReset}
          title={language === "ka" ? "თავიდან დაწყება" : "Start over"}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        className="h-6 md:h-7 px-1.5 md:px-2 text-[10px] md:text-xs font-bold flex-shrink-0 border-primary/30 hover:bg-primary/10"
        onClick={onToggleLanguage}
        title={language === "ka" ? "Switch to English" : "ქართულზე გადართვა"}
      >
        {language === "ka" ? "KA" : "EN"}
      </Button>

      <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0" onClick={onOpenSettings}>
        <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </Button>
    </div>
  );
}
