import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import ShopPage from "./pages/ShopPage";
import SellPage from "./pages/SellPage";
import LearnPage from "./pages/LearnPage";
import ExplorePage from "./pages/ExplorePage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/product/:id" element={<ProductDetailPage />} />
                <Route path="/sell" element={<SellPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
