import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SplashScreen } from "./components/SplashScreen";
import { initializeTheme } from "./lib/theme";
import Auth from "./pages/Auth.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

import Research from "./pages/Research.tsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/machines" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/research" element={<Research />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { useAnimatedCursors } from "./hooks/useAnimatedCursors";

const App = () => {
  // Skip splash screen entirely for auth route
  const isAuthRoute = window.location.pathname === "/auth";
  const [splashHidden, setSplashHidden] = useState(isAuthRoute);
  const handleSplashHidden = useCallback(() => setSplashHidden(true), []);

  // Initialize animated cursors
  useAnimatedCursors();

  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Render app immediately so Canvas/3D models start loading */}
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
      {/* Splash overlays on top — hides once all assets are truly ready */}
      {!splashHidden && <SplashScreen onHidden={handleSplashHidden} />}
    </>
  );
};

export default App;
