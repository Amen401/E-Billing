import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AdminAuthProvider } from "./Components/Context/AdminContext.tsx";
import { OfficerAuthProvider } from "./Components/Context/OfficerContext.tsx";
import { CustomerAuthProvider } from "./Components/Context/AuthContext.tsx";
import { AuthProvider } from "./components/context/UnifiedContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
    <AdminAuthProvider>
      <OfficerAuthProvider>
        <CustomerAuthProvider>
          <App />
        </CustomerAuthProvider>
      </OfficerAuthProvider>
    </AdminAuthProvider>
    </AuthProvider>
  </StrictMode>
);
