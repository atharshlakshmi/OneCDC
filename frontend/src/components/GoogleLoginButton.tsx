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
  // If user came from a protected route, go back there after login
  // Otherwise, just go to home page
  const from = (location.state && (location.state as any).from) || document.referrer || "/";

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    // SDK not loaded yet or container missing
    if (!window.google || !containerRef.current || !clientId) return;

    // Initialize the Google Identity Services client
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res: GoogleCredentialResponse) => {
        if (!res?.credential) {
          console.warn("No credential from Google (origin not allowed or popup blocked)");
          alert("Google didn’t issue a token. Ensure this origin is whitelisted in Google Cloud Console.");
          return;
        }
        try {
          // Send Google ID token to your backend to exchange for your JWT
          const data = await apiFetch<{ success: boolean; data: { user: any; token: string } }>("/auth/google/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: res.credential }),
          });

          const { user, token } = data.data;
          login(user, token, true); // remember by default
          navigate(from, { replace: true });
        } catch (err) {
          console.error("Google login failed:", err);
          alert("Google login failed. Please try again.");
        }
      },
      auto_select: false,
      context: "signin",
    });

    // Render the button
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      shape: "pill",
      text: "signin_with",
      logo_alignment: "left",
      width: 320,
    });
  }, [login, navigate, location.state]);

  // ✨ Center the button horizontally
  return (
    <div className="flex justify-center mt-6 mb-2">
      <div ref={containerRef} />
    </div>
  );
}
