import React from "react";
import { Wine, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UsageInfo } from "@/types/external-api";

interface ChatHeaderProps {
  language: "ka" | "en";
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  usage: UsageInfo | null;
  extractedParams: Record<string, unknown> | null;
}

const PARAM_LABELS: Record<string, Record<string, string>> = {
  occasion_type: { wedding: "💒 ქორწილი", birthday: "🎂 დაბადების დღე", memorial: "🕯️ ქელეხი", christening: "⛪ ნათლობა", guest: "🏠 სტუმარი", friendly: "🤝 მეგობრული", holiday: "🎉 სადღესასწაულო", corporate: "💼 კორპორატიული", supra: "🍷 სუფრა" },
};

export function ChatHeader({ language, onToggleLanguage, onOpenSettings, usage, extractedParams }: ChatHeaderProps) {
  const paramBadges: string[] = [];
  if (extractedParams) {
    const occ = extractedParams.occasion_type as string;
    if (occ) paramBadges.push(PARAM_LABELS.occasion_type[occ] || occ);
    if (extractedParams.person_name) paramBadges.push(`👤 ${extractedParams.person_name}`);
    if (extractedParams.formality_level) paramBadges.push(String(extractedParams.formality_level));
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
        <Wine className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-display font-bold text-foreground leading-tight">
          {language === "ka" ? "თამადა AI" : "TAMADA AI"}
        </h1>
        {paramBadges.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 overflow-x-auto">
            {paramBadges.map((b, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 whitespace-nowrap">
                {b}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {usage && (
        <Badge variant="outline" className="text-[10px] h-5 flex-shrink-0">
          {usage.used_today}/{usage.daily_limit}
        </Badge>
      )}

      <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={onToggleLanguage}>
        <Globe className="h-4 w-4" />
      </Button>

      <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={onOpenSettings}>
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
