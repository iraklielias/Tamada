import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSkeleton from "@/components/LoadingSkeleton";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error:", error);
        navigate("/auth/login", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSkeleton variant="avatar" className="mx-auto w-12 h-12" />
        <p className="text-body-sm text-muted-foreground">ავთენტიფიკაცია...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
