import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

type GoogleCredentialResponse = { credential: string };

export default function GoogleLoginButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Only accept a relative pathname from router state; default to '/'
  const from = (location.state as any)?.from || "/";

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    if (!window.google || !containerRef.current || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res: GoogleCredentialResponse) => {
        if (!res?.credential) {
          console.warn("No credential from Google (origin not allowed or popup blocked)");
          alert("Google didn’t issue a token. Ensure this origin is whitelisted in Google Cloud Console.");
          return;
        }
        try {
          const data = await apiFetch<{ success: boolean; data: { user: any; token: string } }>("/auth/google/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: res.credential }),
          });

          const { user, token } = data.data;
          login(user, token, true);
          // Redirect based on user role
          if (user.role === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else if (user.role === "owner") {
            navigate("/profile/stores", { replace: true });
          } else if (user.role === "registered_shopper") {
            navigate("/shopSearch", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        } catch (err) {
          console.error("Google login failed:", err);
          alert("Google login failed. Please try again.");
        }
      },
      auto_select: false,
      context: "signin",
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      shape: "pill",
      text: "signin_with",
      logo_alignment: "left",
      width: 320,
    });
  }, [login, navigate, from]);

  return (
    <div className="flex justify-center mt-6 mb-2">
      <div ref={containerRef} />
    </div>
  );
}
