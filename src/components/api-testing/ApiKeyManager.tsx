import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { toast as sonnerToast } from "sonner";

interface ApiKey {
  id: string;
  key_prefix: string;
  client_name: string;
  client_id: string;
  is_active: boolean;
  daily_limit_per_user: number;
  created_at: string;
  last_used_at: string | null;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ApiKeyManager() {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const loadKeys = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("api_keys")
      .select("id, key_prefix, client_name, client_id, is_active, daily_limit_per_user, created_at, last_used_at")
      .order("created_at", { ascending: false });
    setKeys((data as ApiKey[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleGenerate = async () => {
    if (!clientName.trim() || !clientId.trim()) return;
    const rawKey = `tmda_${crypto.randomUUID().replace(/-/g, "")}`;
    const keyHash = await hashKey(rawKey);
    const keyPrefix = rawKey.substring(0, 12);

    const { error } = await supabase.from("api_keys").insert({
      key_hash: keyHash,
      key_prefix: keyPrefix,
      client_name: clientName,
      client_id: clientId,
    });

    if (error) {
      sonnerToast.error("Failed to create key");
      return;
    }

    setGeneratedKey(rawKey);
    setClientName("");
    setClientId("");
    loadKeys();
    sonnerToast.success("API key generated!");
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("api_keys").update({ is_active: !active }).eq("id", id);
    loadKeys();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("api_keys").delete().eq("id", id);
    loadKeys();
  };

  return (
    <div className="space-y-4">
      {/* Generate new key */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{t("apiTesting.keys.generate")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Hotcard"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Client ID</Label>
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g., hotcard_prod"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={!clientName.trim() || !clientId.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Generate Key
          </Button>

          {generatedKey && (
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2">
              <p className="text-xs font-semibold text-green-700">
                ⚠️ Copy this key now — it won't be shown again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-background p-2 rounded border">
                  {showKey ? generatedKey : "••••••••••••••••••••"}
                </code>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    sonnerToast.success("Copied!");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing keys */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{t("apiTesting.keys.existing")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : keys.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No API keys yet</p>
          ) : (
            <div className="space-y-2">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 p-2 rounded-md border text-xs">
                  <code className="font-mono text-muted-foreground">{key.key_prefix}...</code>
                  <span className="font-medium">{key.client_name}</span>
                  <Badge variant={key.is_active ? "default" : "secondary"} className="text-[10px]">
                    {key.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-muted-foreground ml-auto">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never used"}
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleToggle(key.id, key.is_active)}>
                    {key.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(key.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
