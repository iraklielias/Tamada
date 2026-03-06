import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Volume2, Loader2 } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export function VoiceSettings() {
  const [previewText, setPreviewText] = useState("გამარჯობა! მე ვარ თამადა — თქვენი ციფრული სუფრის წამყვანი.");
  const [isGenerating, setIsGenerating] = useState(false);
  const player = useAudioPlayer();

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tamada-external-api`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "tts_preview",
            text: previewText,
            language: "ka",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.audio_url) {
          player.play(data.audio_url);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Current Voice Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Voice ID</Label>
              <p className="font-mono text-xs mt-1">JBFqnCBsd6RMkjVDRZzb (George)</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Model</Label>
              <p className="text-xs mt-1">eleven_v3</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Stability</Label>
              <p className="text-xs mt-1">0.5</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Similarity Boost</Label>
              <p className="text-xs mt-1">0.75</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Style</Label>
              <p className="text-xs mt-1">0.4</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">STT Model</Label>
              <p className="text-xs mt-1">scribe_v2 (Georgian: kat)</p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              ℹ️ Voice settings are stored as backend secrets. To change the voice, update the
              ELEVENLABS_VOICE_ID secret in your backend configuration.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Voice Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Sample Text (Georgian)</Label>
            <Input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handlePreview} disabled={isGenerating || !previewText.trim()}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Volume2 className="h-4 w-4 mr-1" />
            )}
            Preview Voice
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Note: Preview requires a valid API key configured in the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
