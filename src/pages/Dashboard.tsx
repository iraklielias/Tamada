import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import {
  Wine,
  CalendarDays,
  Plus,
  Sparkles,
  Star,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: recentFeasts, isLoading: feastsLoading } = useQuery({
    queryKey: ["recent-feasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentToasts, isLoading: toastsLoading } = useQuery({
    queryKey: ["recent-toasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toasts")
        .select("*")
        .eq("is_system", true)
        .order("popularity_score", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: favCount } = useQuery({
    queryKey: ["fav-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "დილა მშვიდობისა";
    if (h < 18) return "შუადღე მშვიდობისა";
    return "საღამო მშვიდობისა";
  };

  const occasionLabel: Record<string, string> = {
    wedding: "ქორწილი",
    birthday: "დაბადების დღე",
    supra: "სუფრა",
    memorial: "პანაშვიდი",
    business: "საქმიანი",
    holiday: "დღესასწაული",
    christening: "ნათლობა",
    guest_reception: "სტუმრის მიღება",
    friendly_gathering: "მეგობრული შეკრება",
    other: "სხვა",
  };

  const statusLabel: Record<string, string> = {
    draft: "მონახაზი",
    active: "მიმდინარე",
    completed: "დასრულებული",
  };

  const quickActions = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: "ახალი სუფრა",
      desc: "შექმენი ახალი წვეულება",
      onClick: () => navigate("/feasts/new"),
      color: "wine-gradient text-primary-foreground",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: "AI სადღეგრძელო",
      desc: "გენერირება AI-ით",
      onClick: () => navigate("/ai-generate"),
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: <Wine className="h-5 w-5" />,
      label: "ბიბლიოთეკა",
      desc: "სადღეგრძელოების ბაზა",
      onClick: () => navigate("/library"),
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "რჩეულები",
      desc: `${favCount ?? 0} შენახული`,
      onClick: () => navigate("/favorites"),
      color: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-heading-1 text-foreground">
          {greeting()}, {profile?.display_name || "თამადა"} 👋
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          მოდი მოვამზადოთ შემდეგი სუფრა
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <button
              onClick={a.onClick}
              className={`${a.color} w-full rounded-xl p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="mb-2">{a.icon}</div>
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{a.desc}</p>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Feasts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-heading-3 text-foreground">ბოლო წვეულებები</h2>
        </div>

        {feastsLoading ? (
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-20" />
              </Card>
            ))}
          </div>
        ) : recentFeasts && recentFeasts.length > 0 ? (
          <div className="grid gap-3">
            {recentFeasts.map((feast) => (
              <Card
                key={feast.id}
                className="hover:shadow-card-hover transition-shadow cursor-pointer"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {feast.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {occasionLabel[feast.occasion_type] || feast.occasion_type}
                        </span>
                        {feast.guest_count && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Users className="h-3 w-3" />
                            {feast.guest_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {statusLabel[feast.status || "draft"] || feast.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="ჯერ არ გაქვთ წვეულება"
            description="შექმენით პირველი სუფრა და მოამზადეთ სადღეგრძელოების თანმიმდევრობა"
            actionLabel="ახალი სუფრა"
            onAction={() => navigate("/feasts/new")}
          />
        )}
      </section>

      {/* Popular Toasts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-heading-3 text-foreground">პოპულარული სადღეგრძელოები</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/library")}>
            ყველა
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {toastsLoading ? (
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3 h-16" />
              </Card>
            ))}
          </div>
        ) : recentToasts && recentToasts.length > 0 ? (
          <div className="grid gap-2">
            {recentToasts.map((toast, i) => (
              <Card
                key={toast.id}
                className="hover:shadow-card-hover transition-shadow"
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Wine className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      {toast.title_ka}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {toast.body_ka}
                    </p>
                  </div>
                  {toast.tags && toast.tags.length > 0 && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {toast.tags[0]}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Wine className="h-10 w-10" />}
            title="სადღეგრძელოები მალე დაემატება"
            description="ბიბლიოთეკა ივსება საუკეთესო ქართული სადღეგრძელოებით"
          />
        )}
      </section>
    </div>
  );
};

export default Dashboard;
