import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

// Pages
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Feed from "./pages/user/Feed";
import Stories from "./pages/user/Stories";
import Saved from "./pages/user/Saved";
import Orders from "./pages/user/Orders";
import PartnerProfile from "./pages/user/PartnerProfile";

import PartnerLogin from "./pages/partner/PartnerLogin";
import PartnerRegister from "./pages/partner/PartnerRegister";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import UploadReel from "./pages/partner/UploadReel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

const PartnerRoute = ({ children }) => {
  const { partner } = useAuthStore();
  return partner ? children : <Navigate to="/partner/login" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1F2937",
              color: "#fff",
              borderRadius: "12px",
            },
          }}
        />
        <Routes>
          {/* User Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Features (PWA screens) */}
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/partner/:id" element={<ProtectedRoute><PartnerProfile /></ProtectedRoute>} />

          {/* Partner Auth */}
          <Route path="/partner/login" element={<PartnerLogin />} />
          <Route path="/partner/register" element={<PartnerRegister />} />

          {/* Partner Features */}
          <Route path="/partner/dashboard" element={<PartnerRoute><PartnerDashboard /></PartnerRoute>} />
          <Route path="/partner/upload" element={<PartnerRoute><UploadReel /></PartnerRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
