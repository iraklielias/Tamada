import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ChevronDown } from "lucide-react";
import SystemIcon from "@/components/SystemIcon";
import { toast as sonnerToast } from "sonner";

const occasionKeys = ["wedding","birthday","memorial","christening","guest_reception","holiday","business","friendly_gathering","supra","other"];
const formalityKeys = ["formal","semi_formal","casual"];
const regionKeys = ["kakheti","imereti","kartli","racha","samegrelo","guria","adjara","svaneti","meskheti"];

interface GuestInput { name: string; role: string; }

const NewFeastPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();

  const templateOccasion = searchParams.get("template");

  const [title, setTitle] = useState("");
  const [occasionType, setOccasionType] = useState(templateOccasion || "supra");
  const [guestCount, setGuestCount] = useState<number>(10);
  const [formality, setFormality] = useState("formal");
  const [region, setRegion] = useState("");
  const [duration, setDuration] = useState<number[]>([180]);
  const [notes, setNotes] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestInput[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);

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
          estimated_duration_minutes: duration[0], region: region && region !== "none" ? region : null,
          notes: notes || null, template_id: selectedTemplateId, status: "draft",
        })
        .select().single();
      if (feastErr) throw feastErr;

      if (selectedTemplateId && templates) {
        const tmpl = templates.find((t) => t.id === selectedTemplateId);
        if (tmpl) {
          const seq = tmpl.toast_sequence as unknown as Array<{
            position?: number; toast_type: string; title_ka: string; title_en?: string; duration_minutes?: number;
            description_ka?: string; description_en?: string;
          }>;
          const toastRows = seq.map((s, idx) => ({
            feast_id: feast.id, position: s.position ?? idx + 1, toast_type: s.toast_type || "traditional",
            title_ka: s.title_ka, title_en: s.title_en || null,
            description_ka: s.description_ka || null, description_en: s.description_en || null,
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
          <SystemIcon name="action.back" size="sm" tone="muted" />
        </Button>
        <div>
          <h1 className="text-heading-1 text-foreground">{t("feasts.newFeast")}</h1>
          <p className="text-body-sm text-muted-foreground">{t("feasts.createNewFeast")}</p>
        </div>
      </div>

      {/* AI vs Manual creation choice */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-primary/40 bg-primary/5 cursor-default">
          <CardContent className="p-4 text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <SystemIcon name="nav.feasts" size="sm" tone="primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">{t("feasts.manualCreate", "Create Manually")}</p>
            <p className="text-[10px] text-muted-foreground">{t("feasts.manualCreateDesc", "Full control over your feast plan")}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/ai-generate")}>
          <CardContent className="p-4 text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto">
              <SystemIcon name="nav.ai" size="sm" className="text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-foreground">{t("feastDetail.aiGenerate", "AI Plan")}</p>
            <p className="text-[10px] text-muted-foreground">{t("feasts.aiCreateDesc", "Let AI create a complete feast plan")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-heading-3">{t("feasts.basicInfo")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("feasts.feastName")} *</label>
            <Input
              placeholder={t("feasts.feastNamePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              className={titleTouched && !title.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {titleTouched && !title.trim() && (
              <p className="text-xs text-destructive mt-1">{t("feasts.nameRequired")}</p>
            )}
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
                      <SystemIcon name="nav.toasts" size="sm" className="text-accent-foreground" />
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

      <Collapsible>
        <Card>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-2">
                <SystemIcon name="nav.profile" size="sm" tone="muted" />
                <span className="text-heading-3">{t("feasts.guestList")}</span>
                {guests.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{guests.length}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t("feasts.addLater", "add later")}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="flex gap-2">
                <Input placeholder={t("feasts.guestNamePlaceholder")} value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGuest()} />
                <Button variant="outline" size="icon" onClick={addGuest}>
                  <SystemIcon name="action.add" size="sm" tone="muted" />
                </Button>
              </div>
              {guests.length > 0 && (
                <div className="space-y-1.5">
                  {guests.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">{g.name}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGuest(i)}>
                          <SystemIcon name="action.delete" size="sm" tone="muted" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Creation Preview Summary */}
      {title.trim() && (
        <Card className="border-dashed border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-caption text-muted-foreground mb-2 font-medium">{t("common.ready")}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">{title.trim()}</Badge>
              <Badge variant="outline">{t(`feasts.occasion.${occasionType}`)}</Badge>
              <Badge variant="outline">{t(`feasts.formalityOptions.${formality}`)}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {guestCount}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDuration(duration[0])}
              </Badge>
              {region && region !== "none" && (
                <Badge variant="outline">{t(`profile.regions.${region}`)}</Badge>
              )}
              {selectedTemplateId && (
                <Badge variant="secondary" className="text-[10px]">
                  {templates?.find(tp => tp.id === selectedTemplateId)?.name_ka}
                </Badge>
              )}
              {guests.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {guests.length} {t("feastDetail.guestsTab").toLowerCase()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky create button on mobile */}
      <div className="hidden md:block space-y-3">
        <Button variant="wine" className="w-full shadow-wine" size="lg" onClick={() => createFeast.mutate()} disabled={createFeast.isPending || !title.trim()}>
          {createFeast.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.creating")}</> : t("feasts.createFeast")}
        </Button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border md:hidden z-40">
        <Button variant="wine" className="w-full shadow-wine" size="lg" onClick={() => createFeast.mutate()} disabled={createFeast.isPending || !title.trim()}>
          {createFeast.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.creating")}</> : t("feasts.createFeast")}
        </Button>
      </div>
    </div>
  );
};

export default NewFeastPage;
