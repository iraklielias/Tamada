import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, MapPin, Wine, Star, Globe } from "lucide-react";

const ProfilePage = () => {
  const { profile, signOut } = useAuth();

  const regionLabel: Record<string, string> = {
    kakheti: "კახეთი", kartli: "ქართლი", imereti: "იმერეთი",
    samegrelo: "სამეგრელო", adjara: "აჭარა", guria: "გურია",
    svaneti: "სვანეთი", racha: "რაჭა", mtskheta_mtianeti: "მცხეთა-მთიანეთი",
  };

  const levelLabel: Record<string, string> = {
    beginner: "დამწყები", intermediate: "საშუალო",
    advanced: "გამოცდილი", master: "ოსტატი",
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-heading-1 text-foreground">პროფილი</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {(profile?.display_name || profile?.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-heading-3 text-foreground">
                {profile?.display_name || "თამადა"}
              </h2>
              <p className="text-body-sm text-muted-foreground">{profile?.email}</p>
              {profile?.is_pro && (
                <Badge className="mt-1 bg-gold text-gold-foreground text-[10px]">
                  <Star className="h-3 w-3 mr-1" /> PRO
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-heading-3 text-foreground">პარამეტრები</h3>
          <Separator />

          <div className="grid gap-3">
            {profile?.region && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-caption text-muted-foreground">რეგიონი</p>
                  <p className="text-body-sm text-foreground">{regionLabel[profile.region] || profile.region}</p>
                </div>
              </div>
            )}
            {profile?.experience_level && (
              <div className="flex items-center gap-3">
                <Wine className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-caption text-muted-foreground">გამოცდილება</p>
                  <p className="text-body-sm text-foreground">{levelLabel[profile.experience_level] || profile.experience_level}</p>
                </div>
              </div>
            )}
            {profile?.preferred_language && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-caption text-muted-foreground">ენა</p>
                  <p className="text-body-sm text-foreground">{profile.preferred_language === "ka" ? "ქართული" : "English"}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" />
        გასვლა
      </Button>
    </div>
  );
};

export default ProfilePage;
