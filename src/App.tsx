import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { MessageNotificationProvider } from "@/components/MessageNotificationProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Discovery from "./pages/Discovery";
import Connections from "./pages/Connections";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Stories from "./pages/Stories";
import Challenges from "./pages/Challenges";
import Collaborations from "./pages/Collaborations";
import NotFound from "./pages/NotFound";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MessageNotificationProvider />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/connections/:userId" element={<Connections />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/collaborations" element={<Collaborations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
