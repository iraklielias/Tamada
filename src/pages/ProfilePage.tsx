import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2, AlertTriangle, LogOut } from "lucide-react";
import SystemIcon from "@/components/SystemIcon";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import i18n from "@/i18n/index";
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerChild } from "@/lib/animations";

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
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

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

  const initials = (profile?.display_name || profile?.email || "U").charAt(0).toUpperCase();

  return (
    <motion.div
      className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Hero avatar card */}
      <motion.div variants={staggerChild}>
        <Card className="overflow-hidden">
          <div className="h-20 wine-gradient" />
          <CardContent className="p-6 -mt-12 relative">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20 border-4 border-card shadow-elevated">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                    {initials}
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
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-heading-3 font-display text-foreground">{profile?.display_name || t("profile.namePlaceholder")}</h2>
                  {profile?.is_pro && (
                    <Badge className="gold-gradient text-foreground text-[10px] border-0 shadow-gold">
                      <SystemIcon name="nav.upgrade" size="xs" className="mr-0.5" /> PRO
                    </Badge>
                  )}
                </div>
                <p className="text-body-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings cards */}
      <motion.div variants={staggerChild}>
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-heading-3 text-foreground flex items-center gap-2">
              <SystemIcon name="nav.profile" size="sm" tone="primary" />
              {t("profile.settings")}
            </h3>

            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">{t("profile.displayName")}</label>
              <Input placeholder={t("profile.namePlaceholder")} value={displayName} onChange={(e) => { setDisplayName(e.target.value); markDirty(); }} className="bg-surface-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <SystemIcon name="status.info" size="xs" tone="primary" /> {t("profile.region")}
                </label>
                <Select value={region} onValueChange={(v) => { setRegion(v); markDirty(); }}>
                  <SelectTrigger className="bg-surface-1"><SelectValue placeholder={t("profile.chooseOption")} /></SelectTrigger>
                  <SelectContent>
                    {regionKeys.map((r) => (
                      <SelectItem key={r} value={r}>{t(`profile.regions.${r}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <SystemIcon name="status.success" size="xs" tone="primary" /> {t("profile.experience")}
                </label>
                <Select value={experience} onValueChange={(v) => { setExperience(v); markDirty(); }}>
                  <SelectTrigger className="bg-surface-1"><SelectValue placeholder={t("profile.chooseOption")} /></SelectTrigger>
                  <SelectContent>
                    {levelKeys.map((l) => (
                      <SelectItem key={l} value={l}>{t(`profile.levels.${l}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-caption text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <SystemIcon name="status.info" size="xs" tone="primary" /> {t("profile.language")}
              </label>
              <Select value={language} onValueChange={(v) => { setLanguage(v); markDirty(); i18n.changeLanguage(v); localStorage.setItem("tamada-lang", v); }}>
                <SelectTrigger className="bg-surface-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ka">ქართული</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isDirty && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Button variant="wine" className="w-full shadow-wine" onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("common.saving")}</>
                  ) : (
                    <>
                      <SystemIcon name="action.complete" size="sm" tone="primary" className="mr-2" /> {t("common.save")}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={staggerChild}>
        <Card className="border-destructive/20">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("profile.dangerZone", "Danger Zone")}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("profile.logout")}
              </Button>
              <Button variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => setShowDeleteAccount(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t("profile.deleteAccount", "Delete Account")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.deleteAccountTitle", "Delete your account?")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.deleteAccountDesc", "This action cannot be undone. All your data will be permanently deleted.")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { sonnerToast.info(t("profile.deleteAccountPending", "Account deletion request sent. Contact support.")); setShowDeleteAccount(false); }}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ProfilePage;
