import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { Activity, Brain, Clock, ThumbsUp, Zap, Users } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--secondary))",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
];

const AdminTelemetryPage: React.FC = () => {
  // Generation stats by day (last 14 days)
  const { data: dailyGenerations } = useQuery({
    queryKey: ["telemetry-daily-generations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_generation_log")
        .select("created_at, latency_ms, generation_type")
        .gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Group by day
      const byDay: Record<string, { count: number; totalLatency: number; latencyCount: number }> = {};
      data?.forEach((row) => {
        const day = (row.created_at || "").slice(0, 10);
        if (!byDay[day]) byDay[day] = { count: 0, totalLatency: 0, latencyCount: 0 };
        byDay[day].count++;
        if (row.latency_ms) {
          byDay[day].totalLatency += row.latency_ms;
          byDay[day].latencyCount++;
        }
      });

      return Object.entries(byDay).map(([date, v]) => ({
        date: date.slice(5), // MM-DD
        generations: v.count,
        avgLatency: v.latencyCount > 0 ? Math.round(v.totalLatency / v.latencyCount) : null,
      }));
    },
  });

  // Generation type breakdown
  const { data: typeBreakdown } = useQuery({
    queryKey: ["telemetry-type-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_generation_log")
        .select("generation_type");
      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((row) => {
        const t = row.generation_type || "unknown";
        counts[t] = (counts[t] || 0) + 1;
      });

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  // Knowledge coverage - how many users have knowledge entries
  const { data: knowledgeCoverage } = useQuery({
    queryKey: ["telemetry-knowledge-coverage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_ai_knowledge")
        .select("knowledge_type, knowledge_key, confidence_score, signal_count");
      if (error) throw error;

      // Group by knowledge_key
      const byKey: Record<string, { count: number; avgConfidence: number; totalSignals: number }> = {};
      data?.forEach((row) => {
        const key = row.knowledge_key;
        if (!byKey[key]) byKey[key] = { count: 0, avgConfidence: 0, totalSignals: 0 };
        byKey[key].count++;
        byKey[key].avgConfidence += (row.confidence_score || 0);
        byKey[key].totalSignals += (row.signal_count || 0);
      });

      return Object.entries(byKey).map(([key, v]) => ({
        key,
        users: v.count,
        avgConfidence: v.count > 0 ? +(v.avgConfidence / v.count).toFixed(2) : 0,
        totalSignals: v.totalSignals,
      }));
    },
  });

  // Feedback rates from knowledge (tone_preference signals)
  const { data: feedbackStats } = useQuery({
    queryKey: ["telemetry-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_ai_knowledge")
        .select("knowledge_key, signal_count, confidence_score")
        .eq("knowledge_key", "tone_preference");
      if (error) throw error;

      const totalSignals = data?.reduce((s, r) => s + (r.signal_count || 0), 0) || 0;
      const avgConfidence = data && data.length > 0
        ? +(data.reduce((s, r) => s + (r.confidence_score || 0), 0) / data.length).toFixed(2)
        : 0;

      return { totalFeedbacks: totalSignals, usersWithFeedback: data?.length || 0, avgConfidence };
    },
  });

  // Overall stats
  const { data: overallStats } = useQuery({
    queryKey: ["telemetry-overall"],
    queryFn: async () => {
      const { count: totalGenerations } = await supabase
        .from("ai_generation_log")
        .select("*", { count: "exact", head: true });

      const { data: latencyData } = await supabase
        .from("ai_generation_log")
        .select("latency_ms")
        .not("latency_ms", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      const latencies = latencyData?.map(r => r.latency_ms).filter(Boolean) as number[] || [];
      const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
      const p95 = latencies.length > 0
        ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)]
        : 0;

      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: knowledgeEntries } = await supabase
        .from("user_ai_knowledge")
        .select("*", { count: "exact", head: true });

      return {
        totalGenerations: totalGenerations || 0,
        avgLatency,
        p95Latency: p95,
        totalUsers: totalUsers || 0,
        knowledgeEntries: knowledgeEntries || 0,
      };
    },
  });

  const statCards = [
    { label: "სულ გენერაციები", value: overallStats?.totalGenerations || 0, icon: <Zap className="h-5 w-5" />, color: "text-primary" },
    { label: "საშ. ლატენტობა", value: `${overallStats?.avgLatency || 0}ms`, icon: <Clock className="h-5 w-5" />, color: "text-amber-500" },
    { label: "P95 ლატენტობა", value: `${overallStats?.p95Latency || 0}ms`, icon: <Activity className="h-5 w-5" />, color: "text-destructive" },
    { label: "ფიდბექ სიგნალები", value: feedbackStats?.totalFeedbacks || 0, icon: <ThumbsUp className="h-5 w-5" />, color: "text-green-500" },
    { label: "მომხმარებლები", value: overallStats?.totalUsers || 0, icon: <Users className="h-5 w-5" />, color: "text-secondary-foreground" },
    { label: "ცოდნის ჩანაწერები", value: overallStats?.knowledgeEntries || 0, icon: <Brain className="h-5 w-5" />, color: "text-indigo-500" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-heading-1 text-foreground flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          ტელემეტრია & მეტრიკები
        </h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          AI გენერაციის პერფორმანსი, ფიდბექი და ადაპტიური სწავლების მეტრიკები
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className={`mx-auto mb-2 ${s.color}`}>{s.icon}</div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily generations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">დღიური გენერაციები (14 დღე)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyGenerations || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="generations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="გენერაციები" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latency trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">საშუალო ლატენტობა (ms)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(dailyGenerations || []).filter(d => d.avgLatency !== null)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="avgLatency" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="ms" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Generation type pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">გენერაციის ტიპები</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            {typeBreakdown && typeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">მონაცემები არ არის</p>
            )}
          </CardContent>
        </Card>

        {/* Knowledge coverage table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ცოდნის დაფარვა</CardTitle>
          </CardHeader>
          <CardContent>
            {knowledgeCoverage && knowledgeCoverage.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {knowledgeCoverage.map((k) => (
                  <div key={k.key} className="flex items-center justify-between p-2 rounded-md bg-accent/30 border border-border">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{k.key}</p>
                      <p className="text-[11px] text-muted-foreground">{k.users} მომხმ. · {k.totalSignals} სიგნ.</p>
                    </div>
                    <Badge variant={k.avgConfidence >= 0.7 ? "default" : k.avgConfidence >= 0.4 ? "secondary" : "outline"} className="text-[10px] shrink-0">
                      {(k.avgConfidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">მონაცემები არ არის</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTelemetryPage;
