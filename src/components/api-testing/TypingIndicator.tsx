import React from "react";
import { motion } from "framer-motion";
import WineGlassIcon from "@/components/icons/WineGlassIcon";

export function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2.5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-md ring-1 ring-primary/10">
        <WineGlassIcon className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 border border-border/40 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/50"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
