import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProGate } from "@/hooks/useProGate";
import { Star, Check, Zap, ArrowLeft } from "lucide-react";

const features = [
  { name: "AI სადღეგრძელო გენერაცია", free: "5/დღეში", pro: "100/დღეში" },
  { name: "რჩეულები", free: "10", pro: "შეუზღუდავი" },
  { name: "აქტიური სუფრები", free: "1", pro: "შეუზღუდავი" },
  { name: "სადღეგრძელოების ბიბლიოთეკა", free: "✓", pro: "✓" },
  { name: "კო-თამადა & რეალტაიმი", free: "✓", pro: "✓" },
  { name: "PDF ექსპორტი", free: "—", pro: "✓" },
  { name: "პრიორიტეტული მხარდაჭერა", free: "—", pro: "✓" },
];

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPro } = useProGate();

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-heading-1 text-foreground">PRO გეგმა</h1>
          <p className="text-body-sm text-muted-foreground">განბლოკეთ ყველა ფუნქცია</p>
        </div>
      </div>

      {isPro && (
        <Card className="border-primary">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center shrink-0">
              <Star className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">თქვენ PRO მომხმარებელი ხართ!</p>
              <p className="text-xs text-muted-foreground">ყველა ფუნქცია ხელმისაწვდომია</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      <div className="grid grid-cols-3 gap-0 border border-border rounded-xl overflow-hidden">
        <div className="p-3 bg-muted font-semibold text-sm text-foreground">ფუნქცია</div>
        <div className="p-3 bg-muted text-center font-semibold text-sm text-foreground">უფასო</div>
        <div className="p-3 gold-gradient text-center font-semibold text-sm text-foreground flex items-center justify-center gap-1">
          <Star className="h-3.5 w-3.5" /> PRO
        </div>
        {features.map((f, i) => (
          <React.Fragment key={i}>
            <div className={`p-3 text-sm text-foreground ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
              {f.name}
            </div>
            <div className={`p-3 text-center text-sm text-muted-foreground ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
              {f.free}
            </div>
            <div className={`p-3 text-center text-sm font-medium text-foreground ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
              {f.pro}
            </div>
          </React.Fragment>
        ))}
      </div>

      {!isPro && (
        <Card className="border-primary/30">
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center mx-auto">
              <Star className="h-8 w-8 text-foreground" />
            </div>
            <div>
              <p className="text-display text-foreground">₾9.99<span className="text-body text-muted-foreground">/თვეში</span></p>
              <p className="text-body-sm text-muted-foreground mt-1">ან ₾99/წელიწადში (2 თვე უფასო)</p>
            </div>
            <Button className="w-full gold-gradient text-foreground border-0" size="lg">
              <Zap className="h-4 w-4 mr-2" /> გააქტიურე PRO
            </Button>
            <p className="text-caption text-muted-foreground">
              Stripe-ით უსაფრთხო გადახდა. გაუქმება ნებისმიერ დროს.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpgradePage;
