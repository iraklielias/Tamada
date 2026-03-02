import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EmptyState from "@/components/EmptyState";
import {
  ArrowLeft, Play, Pause, Square, Plus, Trash2, Users, Clock,
  CalendarDays, Wine, GripVertical, Edit2, Check, X, Share2, Copy, Link,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";

const occasionLabel: Record<string, string> = {
  wedding: "ქორწილი", birthday: "დაბადების დღე", supra: "სუფრა",
  memorial: "პანაშვიდი", holiday: "დღესასწაული", business: "საქმიანი",
  christening: "ნათლობა", guest_reception: "სტუმრის მიღება",
  friendly_gathering: "მეგობრული შეკრება", other: "სხვა",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-secondary text-secondary-foreground",
};

const statusLabel: Record<string, string> = {
  draft: "მონახაზი", scheduled: "დაგეგმილი", active: "მიმდინარე",
  paused: "შეჩერებული", completed: "დასრულებული", cancelled: "გაუქმებული",
};

const toastStatusIcon: Record<string, string> = {
  pending: "⏳", active: "🔴", completed: "✅", skipped: "⏭️",
};

const FeastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newGuestName, setNewGuestName] = useState("");
  const [newToastTitle, setNewToastTitle] = useState("");
  const [newToastType, setNewToastType] = useState("custom");

  // Fetch feast
  const { data: feast, isLoading } = useQuery({
    queryKey: ["feast", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feasts").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch feast toasts
  const { data: feastToasts } = useQuery({
    queryKey: ["feast-toasts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feast_toasts")
        .select("*")
        .eq("feast_id", id!)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch guests
  const { data: guests } = useQuery({
    queryKey: ["feast-guests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feast_guests")
        .select("*")
        .eq("feast_id", id!)
        .order("seat_position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Generate share code
  const generateShareCode = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from("feasts").update({ share_code: code }).eq("id", id!);
      if (error) throw error;
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feast", id] });
      sonnerToast.success("კოდი შეიქმნა!");
    },
  });

  const copyShareLink = () => {
    if (!feast?.share_code) return;
    const link = `${window.location.origin}/feasts/join/${feast.share_code}`;
    navigator.clipboard.writeText(link);
    sonnerToast.success("ლინკი დაკოპირდა!");
  };

  // Update feast status
  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: Record<string, unknown> = { status };
      if (status === "active") updates.actual_start_time = new Date().toISOString();
      if (status === "completed") updates.actual_end_time = new Date().toISOString();
      const { error } = await supabase.from("feasts").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feast", id] });
      sonnerToast.success("სტატუსი განახლდა");
    },
  });

  // Delete feast
  const deleteFeast = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feasts").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      sonnerToast.success("სუფრა წაიშალა");
      navigate("/feasts");
    },
  });

  // Add guest
  const addGuest = useMutation({
    mutationFn: async () => {
      if (!newGuestName.trim()) return;
      const { error } = await supabase.from("feast_guests").insert({
        feast_id: id!,
        name: newGuestName.trim(),
        role: "guest",
        seat_position: (guests?.length || 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewGuestName("");
      queryClient.invalidateQueries({ queryKey: ["feast-guests", id] });
    },
  });

  // Remove guest
  const removeGuest = useMutation({
    mutationFn: async (guestId: string) => {
      const { error } = await supabase.from("feast_guests").delete().eq("id", guestId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-guests", id] }),
  });

  // Add toast to plan
  const addToast = useMutation({
    mutationFn: async () => {
      if (!newToastTitle.trim()) return;
      const { error } = await supabase.from("feast_toasts").insert({
        feast_id: id!,
        position: (feastToasts?.length || 0) + 1,
        toast_type: newToastType,
        title_ka: newToastTitle.trim(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewToastTitle("");
      queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] });
    },
  });

  // Remove toast
  const removeToast = useMutation({
    mutationFn: async (toastId: string) => {
      const { error } = await supabase.from("feast_toasts").delete().eq("id", toastId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feast-toasts", id] }),
  });

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}სთ ${m > 0 ? `${m}წთ` : ""}` : `${m}წთ`;
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>
        ))}
      </div>
    );
  }

  if (!feast) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">სუფრა ვერ მოიძებნა</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/feasts")}>უკან</Button>
      </div>
    );
  }

  const isHost = feast.host_id === user?.id;
  const canStart = feast.status === "draft" || feast.status === "paused";
  const canPause = feast.status === "active";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/feasts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-heading-2 text-foreground truncate">{feast.title}</h1>
              <Badge className={`text-[10px] ${statusColors[feast.status || "draft"]}`}>
                {statusLabel[feast.status || "draft"]}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{occasionLabel[feast.occasion_type] || feast.occasion_type}</span>
              {feast.guest_count && <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{feast.guest_count}</span>}
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{formatDuration(feast.estimated_duration_minutes)}</span>
            </div>
          </div>
        </div>

        {isHost && (
          <div className="flex gap-2 shrink-0">
            {(feast.status === "active" || feast.status === "paused") && (
              <Button size="sm" variant="default" onClick={() => navigate(`/feasts/${id}/live`)}>
                <Play className="h-3.5 w-3.5 mr-1.5" />LIVE
              </Button>
            )}
            {canStart && (
              <Button size="sm" onClick={() => {
                updateStatus.mutate("active");
                navigate(`/feasts/${id}/live`);
              }}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {feast.status === "paused" ? "გაგრძელება" : "დაწყება"}
              </Button>
            )}
            {canPause && (
              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("paused")}>
                <Pause className="h-3.5 w-3.5 mr-1.5" />პაუზა
              </Button>
            )}
            {(feast.status === "active" || feast.status === "paused") && (
              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate("completed")}>
                <Square className="h-3.5 w-3.5 mr-1.5" />დასრულება
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plan">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="plan">📋 გეგმა</TabsTrigger>
          <TabsTrigger value="guests">👥 სტუმრები</TabsTrigger>
          <TabsTrigger value="details">ℹ️ დეტალები</TabsTrigger>
        </TabsList>

        {/* Plan Tab */}
        <TabsContent value="plan" className="mt-4 space-y-3">
          {feastToasts && feastToasts.length > 0 ? (
            <div className="space-y-2">
              {feastToasts.map((ft, i) => (
                <motion.div
                  key={ft.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className={`transition-shadow ${ft.status === "completed" ? "opacity-60" : ""}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-sm font-bold text-accent-foreground">
                        {ft.position}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{ft.title_ka}</p>
                          <span className="text-xs">{toastStatusIcon[ft.status || "pending"]}</span>
                        </div>
                        {ft.description_ka && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{ft.description_ka}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">{ft.toast_type}</Badge>
                          {ft.duration_minutes && (
                            <span className="text-[10px] text-muted-foreground">{ft.duration_minutes}წთ</span>
                          )}
                          {ft.alaverdi_assigned_to && (
                            <Badge variant="secondary" className="text-[10px]">ალავერდი: {ft.alaverdi_assigned_to}</Badge>
                          )}
                        </div>
                      </div>
                      {isHost && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeToast.mutate(ft.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Wine className="h-10 w-10" />}
              title="გეგმა ცარიელია"
              description="დაამატეთ სადღეგრძელოები ან აირჩიეთ თანმიმდევრობა"
            />
          )}

          {isHost && (
            <Card className="border-dashed">
              <CardContent className="p-3 flex gap-2">
                <Input
                  placeholder="სადღეგრძელოს სახელი"
                  value={newToastTitle}
                  onChange={(e) => setNewToastTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToast.mutate()}
                />
                <Button variant="outline" size="icon" onClick={() => addToast.mutate()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="mt-4 space-y-3">
          {guests && guests.length > 0 ? (
            <div className="space-y-2">
              {guests.map((g) => (
                <Card key={g.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-sm font-semibold text-accent-foreground">
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{g.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">{g.role}</Badge>
                          {(g.alaverdi_count ?? 0) > 0 && (
                            <span className="text-[10px] text-muted-foreground">ალავერდი: {g.alaverdi_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isHost && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGuest.mutate(g.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-10 w-10" />}
              title="სტუმრები არ არის"
              description="დაამატეთ სტუმრები ალავერდის თვალთვალისთვის"
            />
          )}

          {isHost && (
            <Card className="border-dashed">
              <CardContent className="p-3 flex gap-2">
                <Input
                  placeholder="სტუმრის სახელი"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGuest.mutate()}
                />
                <Button variant="outline" size="icon" onClick={() => addGuest.mutate()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">წვეულების ტიპი</p>
                  <p className="font-medium text-foreground">{occasionLabel[feast.occasion_type] || feast.occasion_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ფორმალურობა</p>
                  <p className="font-medium text-foreground">{feast.formality_level === "formal" ? "ფორმალური" : feast.formality_level === "casual" ? "არაფორმალური" : "ნახევრად ფორმალური"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">სტუმრების რაოდენობა</p>
                  <p className="font-medium text-foreground">{feast.guest_count || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ხანგრძლივობა</p>
                  <p className="font-medium text-foreground">{formatDuration(feast.estimated_duration_minutes)}</p>
                </div>
                {feast.region && (
                  <div>
                    <p className="text-muted-foreground text-xs">რეგიონი</p>
                    <p className="font-medium text-foreground">{feast.region}</p>
                  </div>
                )}
              </div>
              {feast.notes && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">შენიშვნები</p>
                  <p className="text-sm text-foreground">{feast.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Code */}
          {isHost && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-muted-foreground text-xs">გაზიარება (კო-თამადა)</p>
                {feast.share_code ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-mono font-semibold text-foreground">{feast.share_code}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyShareLink}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> კოპირება
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => generateShareCode.mutate()} disabled={generateShareCode.isPending}>
                    <Share2 className="h-4 w-4 mr-2" /> კოდის გენერაცია
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {isHost && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  სუფრის წაშლა
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ნამდვილად წაშლა?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ეს მოქმედება შეუქცევადია. სუფრა და მასთან დაკავშირებული ყველა მონაცემი წაიშლება.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteFeast.mutate()}>წაშლა</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeastDetailPage;
