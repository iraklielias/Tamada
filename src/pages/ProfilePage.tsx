import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LogOut, Camera, Loader2, Save, Star } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const regionKeys = ["kakheti", "kartli", "imereti", "samegrelo", "adjara", "guria", "svaneti", "racha", "meskheti"];
const levelKeys = ["beginner", "intermediate", "experienced", "master"];

const ProfilePage = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [region, setRegion] = useState(profile?.region || "");
  const [experience, setExperience] = useState(profile?.experience_level || "");
  const [language, setLanguage] = useState<string>(profile?.preferred_language || "ka");
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setRegion(profile.region || "");
      setExperience(profile.experience_level || "");
      setLanguage(profile.preferred_language || "ka");
      setIsDirty(false);
    }
  }, [profile]);

  const markDirty = () => setIsDirty(true);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").update({
        display_name: displayName.trim() || null,
        region: region || null,
        experience_level: experience || null,
        preferred_language: language,
      }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      setIsDirty(false);
      sonnerToast.success(t("profile.saved"));
    },
    onError: () => sonnerToast.error(t("profile.saveFailed")),
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: profErr } = await supabase.from("profiles").update({ avatar_url: `${data.publicUrl}?t=${Date.now()}` }).eq("id", user.id);
      if (profErr) throw profErr;
    },
    onSuccess: async () => { await refreshProfile(); sonnerToast.success(t("profile.avatarUpdated")); },
    onError: () => sonnerToast.error(t("profile.uploadFailed")),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { sonnerToast.error(t("profile.fileTooLarge")); return; }
      uploadAvatar.mutate(file);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <h1 className="text-heading-1 text-foreground">{t("profile.title")}</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {(profile?.display_name || profile?.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploadAvatar.isPending}
              >
                {uploadAvatar.isPending ? <Loader2 className="h-5 w-5 text-background animate-spin" /> : <Camera className="h-5 w-5 text-background" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="flex-1">
              <p className="text-body-sm text-muted-foreground">{profile?.email}</p>
              {profile?.is_pro && (
                <Badge className="mt-1 gold-gradient text-foreground text-[10px] border-0">
                  <Star className="h-3 w-3 mr-1" /> PRO
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-heading-3">{t("profile.settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("profile.displayName")}</label>
            <Input placeholder={t("profile.namePlaceholder")} value={displayName} onChange={(e) => { setDisplayName(e.target.value); markDirty(); }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">{t("profile.region")}</label>
              <Select value={region} onValueChange={(v) => { setRegion(v); markDirty(); }}>
                <SelectTrigger><SelectValue placeholder={t("profile.chooseOption")} /></SelectTrigger>
                <SelectContent>
                  {regionKeys.map((r) => (
                    <SelectItem key={r} value={r}>{t(`profile.regions.${r}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">{t("profile.experience")}</label>
              <Select value={experience} onValueChange={(v) => { setExperience(v); markDirty(); }}>
                <SelectTrigger><SelectValue placeholder={t("profile.chooseOption")} /></SelectTrigger>
                <SelectContent>
                  {levelKeys.map((l) => (
                    <SelectItem key={l} value={l}>{t(`profile.levels.${l}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">{t("profile.language")}</label>
            <Select value={language} onValueChange={(v) => { setLanguage(v); markDirty(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ka">ქართული</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isDirty && (
            <Button className="w-full" onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.saving")}</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> {t("common.save")}</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Button variant="outline" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" />
        {t("profile.logout")}
      </Button>
    </div>
  );
};

export default ProfilePage;
