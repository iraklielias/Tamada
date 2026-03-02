import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function LanguageToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const currentLang = i18n.language;

  const toggle = async () => {
    const next = currentLang === "ka" ? "en" : "ka";
    i18n.changeLanguage(next);
    localStorage.setItem("tamada-lang", next);
    if (user) {
      await supabase.from("profiles").update({ preferred_language: next }).eq("id", user.id);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5 text-xs">
      <Globe className="h-4 w-4" />
      {!collapsed && (currentLang === "ka" ? "EN" : "ქარ")}
    </Button>
  );
}
