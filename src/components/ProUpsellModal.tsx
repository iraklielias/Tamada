import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Zap } from "lucide-react";

interface ProUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const ProUpsellModal: React.FC<ProUpsellModalProps> = ({ open, onOpenChange, message }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="h-14 w-14 rounded-full gold-gradient flex items-center justify-center mx-auto mb-2">
            <Star className="h-7 w-7 text-foreground" />
          </div>
          <DialogTitle className="text-heading-2">PRO-ზე გადასვლა</DialogTitle>
          <DialogDescription className="text-body-sm">
            {message || "ეს ფუნქცია მხოლოდ PRO მომხმარებლებისთვისაა ხელმისაწვდომი."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="text-left space-y-2 bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span>100 AI გენერაცია/დღეში</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span>შეუზღუდავი რჩეულები</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span>მრავალი აქტიური სუფრა</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span>PDF ექსპორტი</span>
            </div>
          </div>
          <Button
            className="w-full gold-gradient text-foreground border-0"
            size="lg"
            onClick={() => { onOpenChange(false); navigate("/upgrade"); }}
          >
            <Star className="h-4 w-4 mr-2" /> გახდი PRO
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            მოგვიანებით
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpsellModal;
