import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const ProfilePage = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-heading-1 text-foreground mb-4">პროფილი</h1>
      <div className="space-y-3 text-body-sm text-muted-foreground">
        <p><span className="text-foreground font-medium">სახელი:</span> {profile?.display_name || "—"}</p>
        <p><span className="text-foreground font-medium">ელფოსტა:</span> {profile?.email}</p>
        <p><span className="text-foreground font-medium">რეგიონი:</span> {profile?.region || "—"}</p>
      </div>
      <Button variant="outline" className="mt-6" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" />
        გასვლა
      </Button>
    </div>
  );
};
export default ProfilePage;
