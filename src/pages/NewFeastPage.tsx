import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Plus, Trash2, ArrowLeft, Wine } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const occasionKeys = ["wedding","birthday","memorial","christening","guest_reception","holiday","business","friendly_gathering","supra","other"];
const formalityKeys = ["formal","semi_formal","casual"];
const regionKeys = ["kakheti","imereti","kartli","racha","samegrelo","guria","adjara","svaneti","meskheti"];

interface GuestInput { name: string; role: string; }

const NewFeastPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [occasionType, setOccasionType] = useState("supra");
  const [guestCount, setGuestCount] = useState<number>(10);
  const [formality, setFormality] = useState("formal");
  const [region, setRegion] = useState("");
  const [duration, setDuration] = useState<number[]>([180]);
  const [notes, setNotes] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestInput[]>([]);
  const [newGuestName, setNewGuestName] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["templates-for-occasion", occasionType],
    queryFn: async () => {
      const { data, error } = await supabase.from("toast_templates").select("*").eq("occasion_type", occasionType);
      if (error) throw error;
      return data;
    },
  });

  const createFeast = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!title.trim()) throw new Error(t("feasts.nameRequired"));

      const { data: feast, error: feastErr } = await supabase
        .from("feasts")
        .insert({
          host_id: user.id, title: title.trim(), occasion_type: occasionType,
          formality_level: formality, guest_count: guestCount,
          estimated_duration_minutes: duration[0], region: region || null,
          notes: notes || null, template_id: selectedTemplateId, status: "draft",
        })
        .select().single();
      if (feastErr) throw feastErr;

      if (selectedTemplateId && templates) {
        const tmpl = templates.find((t) => t.id === selectedTemplateId);
        if (tmpl) {
          const seq = tmpl.toast_sequence as unknown as Array<{
            position: number; toast_type: string; title_ka: string; title_en?: string; duration_minutes?: number;
          }>;
          const toastRows = seq.map((s) => ({
            feast_id: feast.id, position: s.position, toast_type: s.toast_type,
            title_ka: s.title_ka, title_en: s.title_en || null,
            duration_minutes: s.duration_minutes || 5, status: "pending",
          }));
          const { error: toastErr } = await supabase.from("feast_toasts").insert(toastRows);
          if (toastErr) throw toastErr;
        }
      }

      if (guests.length > 0) {
        const guestRows = guests.map((g, idx) => ({
          feast_id: feast.id, name: g.name, role: g.role, seat_position: idx + 1,
        }));
        const { error: gErr } = await supabase.from("feast_guests").insert(guestRows);
        if (gErr) throw gErr;
      }

      return feast;
    },
    onSuccess: (feast) => { sonnerToast.success(t("feasts.created")); navigate(`/feasts/${feast.id}`); },
    onError: (err: Error) => sonnerToast.error(err.message),
  });

  const addGuest = () => {
    if (!newGuestName.trim()) return;
    setGuests([...guests, { name: newGuestName.trim(), role: "guest" }]);
    setNewGuestName("");
  };
  const removeGuest = (idx: number) => setGuests(guests.filter((_, i) => i !== idx));

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-heading-1 text-foreground">{t("feasts.newFeast")}</h1>
          <p className="text-body-sm text-muted-foreground">{t("feasts.createNewFeast")}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-heading-3">{t("feasts.basicInfo")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("feasts.feastName")} *</label>
            <Input placeholder={t("feasts.feastNamePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("ai.occasionType")}</label>
            <Select value={occasionType} onValueChange={setOccasionType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {occasionKeys.map((o) => (
                  <SelectItem key={o} value={o}>{t(`feasts.occasion.${o}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-heading-3">{t("feasts.details")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">{t("feasts.guestCount")}</label>
              <Input type="number" min={2} value={guestCount} onChange={(e) => setGuestCount(Math.max(2, parseInt(e.target.value) || 2))} />
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">{t("profile.region")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue placeholder={t("profile.chooseOption")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("feasts.regionOptions.none")}</SelectItem>
                  {regionKeys.map((r) => (
                    <SelectItem key={r} value={r}>{t(`profile.regions.${r}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("feasts.formality")}</label>
            <div className="grid grid-cols-3 gap-2">
              {formalityKeys.map((f) => (
                <button key={f} onClick={() => setFormality(f)}
                  className={`p-3 rounded-xl border text-left transition-all ${formality === f ? "border-primary bg-accent" : "border-border hover:border-primary/30"}`}>
                  <p className="text-sm font-semibold text-foreground">{t(`feasts.formalityOptions.${f}`)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t(`feasts.formalityOptions.${f}Desc`)}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">
              {t("feasts.duration")}: {formatDuration(duration[0])}
            </label>
            <Slider value={duration} onValueChange={setDuration} min={60} max={480} step={30} className="mt-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1h</span><span>4h</span><span>8h</span>
            </div>
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("feasts.notes")}</label>
            <Textarea placeholder={t("feasts.notesPlaceholder")} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {templates && templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-heading-3">{t("feasts.templateSelect")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {templates.map((tmpl) => {
              const seq = tmpl.toast_sequence as unknown as Array<{ position: number }>;
              return (
                <button key={tmpl.id} onClick={() => setSelectedTemplateId(selectedTemplateId === tmpl.id ? null : tmpl.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${selectedTemplateId === tmpl.id ? "border-primary bg-accent" : "border-border hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <Wine className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tmpl.name_ka}</p>
                      <p className="text-[10px] text-muted-foreground">{seq?.length || 0} {t("live.toastProgress")} · {tmpl.estimated_duration_minutes ? formatDuration(tmpl.estimated_duration_minutes) : ""}</p>
                    </div>
                  </div>
                  {selectedTemplateId === tmpl.id && <Badge className="bg-primary text-primary-foreground text-[10px]">{t("feasts.selected")}</Badge>}
                </button>
              );
            })}
            <button onClick={() => setSelectedTemplateId(null)}
              className={`w-full p-3 rounded-xl border text-left transition-all ${selectedTemplateId === null ? "border-primary bg-accent" : "border-border hover:border-primary/30"}`}>
              <p className="text-sm font-semibold text-foreground">{t("feasts.customTemplate")}</p>
              <p className="text-[10px] text-muted-foreground">{t("feasts.customTemplateDesc")}</p>
            </button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-heading-3">{t("feasts.guestList")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder={t("feasts.guestNamePlaceholder")} value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGuest()} />
            <Button variant="outline" size="icon" onClick={addGuest}><Plus className="h-4 w-4" /></Button>
          </div>
          {guests.length > 0 && (
            <div className="space-y-1.5">
              {guests.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm text-foreground">{g.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGuest(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={() => createFeast.mutate()} disabled={createFeast.isPending || !title.trim()}>
        {createFeast.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.creating")}</> : t("feasts.createFeast")}
      </Button>
    </div>
  );
};

export default NewFeastPage;
