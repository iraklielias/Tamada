import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Wine, Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        className="text-center max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        {/* Branded icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto"
        >
          <div className="h-24 w-24 rounded-3xl wine-gradient flex items-center justify-center mx-auto shadow-wine">
            <Wine className="h-12 w-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Number */}
        <h1 className="text-7xl font-extrabold font-display text-foreground tracking-tighter">
          404
        </h1>

        <div className="space-y-2">
          <p className="text-heading-3 text-foreground">
            {t("notFound.title")}
          </p>
          <p className="text-body-sm text-muted-foreground">
            {t("notFound.description")}
          </p>
        </div>

        <Button
          variant="wine"
          size="lg"
          className="shadow-wine"
          onClick={() => navigate("/")}
        >
          <Home className="h-4 w-4 mr-2" />
          {t("notFound.goHome")}
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
