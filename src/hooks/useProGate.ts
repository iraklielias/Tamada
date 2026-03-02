import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface ProLimits {
  maxAIPerDay: number;
  maxFavorites: number;
  maxActiveFeasts: number;
}

const FREE_LIMITS: ProLimits = {
  maxAIPerDay: 5,
  maxFavorites: 10,
  maxActiveFeasts: 1,
};

const PRO_LIMITS: ProLimits = {
  maxAIPerDay: 100,
  maxFavorites: 999,
  maxActiveFeasts: 99,
};

export function useProGate() {
  const { profile, user } = useAuth();

  const isPro = !!(profile?.is_pro && (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date()));
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS;

  // Daily AI count
  const { data: dailyAICount = 0 } = useQuery({
    queryKey: ["daily-ai-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase.rpc("get_daily_ai_count", { p_user_id: user.id });
      if (error) return 0;
      return data as number;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Favorites count
  const { data: favCount = 0 } = useQuery({
    queryKey: ["fav-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Active feasts count
  const { data: activeFeastCount = 0 } = useQuery({
    queryKey: ["active-feast-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("feasts")
        .select("*", { count: "exact", head: true })
        .eq("host_id", user.id)
        .in("status", ["draft", "active", "paused"]);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const canGenerateAI = dailyAICount < limits.maxAIPerDay;
  const canAddFavorite = favCount < limits.maxFavorites;
  const canCreateFeast = activeFeastCount < limits.maxActiveFeasts;

  const checkFeature = useCallback((feature: "ai" | "favorite" | "feast"): { allowed: boolean; message: string } => {
    if (isPro) return { allowed: true, message: "" };
    switch (feature) {
      case "ai":
        return canGenerateAI
          ? { allowed: true, message: "" }
          : { allowed: false, message: `დღიური ლიმიტი ამოიწურა (${limits.maxAIPerDay}/${limits.maxAIPerDay}). განაახლეთ PRO-ზე!` };
      case "favorite":
        return canAddFavorite
          ? { allowed: true, message: "" }
          : { allowed: false, message: `რჩეულების ლიმიტი ამოიწურა (${limits.maxFavorites}). განაახლეთ PRO-ზე!` };
      case "feast":
        return canCreateFeast
          ? { allowed: true, message: "" }
          : { allowed: false, message: `აქტიური სუფრის ლიმიტი ამოიწურა (${limits.maxActiveFeasts}). განაახლეთ PRO-ზე!` };
    }
  }, [isPro, canGenerateAI, canAddFavorite, canCreateFeast, limits]);

  return {
    isPro,
    limits,
    dailyAICount,
    favCount,
    activeFeastCount,
    canGenerateAI,
    canAddFavorite,
    canCreateFeast,
    checkFeature,
  };
}
