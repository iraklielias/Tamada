import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface UsageAnalyticsProps {
  api: ReturnType<typeof import("@/hooks/useTamadaExternalApi").useTamadaExternalApi>;
}

export function UsageAnalytics({ api }: UsageAnalyticsProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    setLoading(true);
    const { data: usage } = await supabase
      .from("external_usage_tracking")
      .select("*")
      .order("usage_date", { ascending: false })
      .limit(30);
    setData(usage || []);
    setLoading(false);
  };

  const totals = data.reduce(
    (acc, d) => ({
      generations: acc.generations + (d.generation_count || 0),
      voice: acc.voice + (d.voice_generation_count || 0),
      tokens: acc.tokens + (d.total_tokens_used || 0),
      audio: acc.audio + (d.total_audio_seconds || 0),
    }),
    { generations: 0, voice: 0, tokens: 0, audio: 0 }
  );

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Generations" value={totals.generations} />
        <StatCard label="Voice Generations" value={totals.voice} />
        <StatCard label="Tokens Used" value={totals.tokens.toLocaleString()} />
        <StatCard label="Audio Seconds" value={`${Math.round(totals.audio)}s`} />
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Recent Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No usage data yet</p>
          ) : (
            <div className="space-y-1">
              {data.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-2 rounded-md border text-xs">
                  <span className="font-mono text-muted-foreground">{d.usage_date}</span>
                  <span className="text-muted-foreground truncate max-w-[120px]">{d.external_user_id}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {d.generation_count} text
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {d.voice_generation_count} voice
                  </Badge>
                  <span className="text-muted-foreground ml-auto">
                    {d.total_tokens_used} tokens
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
