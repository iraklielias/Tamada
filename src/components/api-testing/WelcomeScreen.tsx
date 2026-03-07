import React from "react";
import { motion } from "framer-motion";
import { Wine, Sparkles, Mic } from "lucide-react";

interface WelcomeScreenProps {
  language: "ka" | "en";
  onSuggestion: (message: string) => void;
}

const SUGGESTIONS_KA = [
  { emoji: "💒", label: "ქორწილის სადღეგრძელო", message: "ქორწილის სადღეგრძელო მინდა" },
  { emoji: "🎂", label: "დაბადების დღე", message: "დაბადების დღის სადღეგრძელო მინდა" },
  { emoji: "🤝", label: "მეგობარს", message: "მეგობრობის სადღეგრძელო მინდა" },
  { emoji: "🏠", label: "სტუმარს", message: "სტუმრის მისალმების სადღეგრძელო მინდა" },
];

const SUGGESTIONS_EN = [
  { emoji: "💒", label: "Wedding Toast", message: "I need a wedding toast" },
  { emoji: "🎂", label: "Birthday Toast", message: "I need a birthday toast" },
  { emoji: "🤝", label: "Friendship", message: "I need a toast for a friend" },
  { emoji: "🏠", label: "Guest Welcome", message: "I need a toast to welcome a guest" },
];

export function WelcomeScreen({ language, onSuggestion }: WelcomeScreenProps) {
  const suggestions = language === "ka" ? SUGGESTIONS_KA : SUGGESTIONS_EN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-4 py-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-lg"
      >
        <Wine className="w-8 h-8 text-primary-foreground" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-display font-bold text-foreground mb-1"
      >
        {language === "ka" ? "თამადა AI" : "TAMADA AI"}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground text-center max-w-xs mb-8"
      >
        {language === "ka"
          ? "შენი ციფრული თამადა. მითხარი, რა შემთხვევისთვის გჭირდება სადღეგრძელო 🍷"
          : "Your digital feastmaster. Tell me what occasion you need a toast for 🍷"}
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestion(s.message)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 hover:shadow-md transition-all text-left group"
          >
            <span className="text-lg">{s.emoji}</span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {s.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Voice mode hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2 mt-6 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/10"
      >
        <Mic className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          {language === "ka"
            ? "💡 სცადეთ ხმოვანი რეჟიმი — დააჭირეთ 🎤 ღილაკს"
            : "💡 Try Voice Mode — tap the 🎤 button for hands-free conversation"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground/60"
      >
        <Sparkles className="w-3 h-3" />
        <span>{language === "ka" ? "AI-ით გაძლიერებული" : "Powered by AI"}</span>
      </motion.div>
    </motion.div>
  );
}
