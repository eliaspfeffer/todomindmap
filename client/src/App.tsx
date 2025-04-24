import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// Layouts
import MainLayout from "@/components/layouts/MainLayout";
import AuthLayout from "@/components/layouts/AuthLayout";

// Pages
import HomePage from "@/components/pages/HomePage";
import LoginPage from "@/components/pages/LoginPage";
import RegisterPage from "@/components/pages/RegisterPage";
import MindMapPage from "@/components/pages/MindMapPage";
import DemoPage from "@/components/pages/DemoPage";
import NotFoundPage from "@/components/pages/NotFoundPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main app routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/map/:id" element={<MindMapPage />} />
        </Route>

        {/* Demo route - no auth required */}
        <Route path="/demo" element={<DemoPage />} />

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </ThemeProvider>
  );
}

export default App;
