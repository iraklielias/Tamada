import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wine, CheckCircle, XCircle } from "lucide-react";

const JoinFeastPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [feastId, setFeastId] = useState<string | null>(null);
  const [feastTitle, setFeastTitle] = useState<string>("");
  const [lookupError, setLookupError] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  // Look up feast by share code
  useEffect(() => {
    if (!shareCode || authLoading) return;
    if (!user) {
      navigate(`/auth/login?redirect=/feasts/join/${shareCode}`);
      return;
    }

    const lookup = async () => {
      const { data, error } = await supabase
        .from("feasts")
        .select("id, title, host_id")
        .eq("share_code", shareCode)
        .single();

      if (error || !data) {
        setLookupError(true);
        return;
      }

      // If user is the host, redirect directly
      if (data.host_id === user.id) {
        navigate(`/feasts/${data.id}/live`);
        return;
      }

      setFeastId(data.id);
      setFeastTitle(data.title);

      // Check if already a collaborator
      const { data: existing } = await supabase
        .from("feast_collaborators")
        .select("id")
        .eq("feast_id", data.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setAlreadyJoined(true);
      }
    };

    lookup();
  }, [shareCode, user, authLoading, navigate]);

  const joinFeast = useMutation({
    mutationFn: async () => {
      if (!feastId || !user) throw new Error("Missing data");
      const { error } = await supabase.from("feast_collaborators").insert({
        feast_id: feastId,
        user_id: user.id,
        role: "mejavare",
      });
      if (error) throw error;
    },
    onSuccess: () => navigate(`/feasts/${feastId}/live`),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (lookupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-heading-2 text-foreground">სუფრა ვერ მოიძებნა</h2>
            <p className="text-body-sm text-muted-foreground">
              კოდი არასწორია ან სუფრა წაშლილია
            </p>
            <Button onClick={() => navigate("/dashboard")}>მთავარზე დაბრუნება</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyJoined && feastId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-heading-2 text-foreground">უკვე შეუერთდით!</h2>
            <p className="text-body-sm text-muted-foreground">{feastTitle}</p>
            <Button onClick={() => navigate(`/feasts/${feastId}/live`)}>
              <Wine className="h-4 w-4 mr-2" /> გახსნა
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!feastId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-full wine-gradient flex items-center justify-center mx-auto">
            <Wine className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-heading-2 text-foreground">შემოგვიერთდი!</h2>
          <p className="text-body text-foreground font-semibold">{feastTitle}</p>
          <p className="text-body-sm text-muted-foreground">
            თქვენ მოწვეული ხართ როგორც მეჯვარე
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => joinFeast.mutate()}
            disabled={joinFeast.isPending}
          >
            {joinFeast.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> შეერთება...</>
            ) : (
              "შეუერთდი სუფრას"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinFeastPage;
