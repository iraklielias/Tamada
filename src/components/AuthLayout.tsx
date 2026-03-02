import React from "react";
import HornIcon from "@/components/icons/HornIcon";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex bg-background">
    {/* Left decorative panel — hidden on mobile */}
    <div className="hidden lg:flex lg:w-1/2 wine-gradient items-center justify-center p-12">
      <div className="text-center text-primary-foreground max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-8">
          <HornIcon size={44} className="text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">TAMADA</h1>
        <p className="text-xl font-medium opacity-90 mb-2">შენი ციფრული თამადა</p>
        <p className="text-base opacity-70">
          Plan, manage, and lead unforgettable Georgian feasts with intelligence and tradition.
        </p>
      </div>
    </div>

    {/* Right content panel */}
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl wine-gradient flex items-center justify-center">
            <HornIcon size={22} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">TAMADA</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
