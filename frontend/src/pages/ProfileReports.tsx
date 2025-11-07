import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CardDisplay from "../components/CardDisplay";
import { apiFetch } from "../lib/api";
import { Flag, AlertTriangle } from "lucide-react";

type FlaggedReview = {
  _id: string;
  rating: number;
  comment: string;
  itemName?: string;
  shopName?: string;
  itemId?: string;
  shopId?: string;
  catalogueId?: string;
  createdAt?: string;
  isFlagged?: boolean;
  flaggedReason?: string;
  reportCount?: number;
};

export default function ProfileReports() {
  const navigate = useNavigate();
  const { logout, isAuthed, checked } = useAuth();
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Defensive check: redirect if not authenticated
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Fetch the user's reviews that have been flagged by admin
        // This could be a dedicated endpoint or filtered from my-reviews
        const resp = await apiFetch("/reviews/my-flagged-reviews", { method: "GET" });
        const data = resp?.data?.reviews ?? resp?.data ?? resp;

        if (!active) return;
        setFlaggedReviews(data);
      } catch (err: any) {
        if (err?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        // If endpoint doesn't exist yet, show a friendly message
        if (err?.status === 404) {
          setError("Flagged reviews feature is coming soon!");
        } else {
          setError(err?.message || "Failed to load flagged reviews");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        Loading flagged reviews...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          ← Back to Profile
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Flagged Reviews</h1>
        <AlertTriangle className="text-red-500" size={28} />
      </div>
      <p className="text-gray-600 mb-8">
        Your reviews that have been reported by other users and flagged by admin
      </p>

      {error && (
        <div className="mb-6 border border-amber-200 bg-amber-50 text-amber-700 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!error && flaggedReviews.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <Flag className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500 text-lg">None of your reviews have been flagged.</p>
          <p className="text-gray-400 text-sm mt-2">Keep posting helpful and respectful reviews!</p>
        </div>
      )}

      {!error && flaggedReviews.length > 0 && (
        <div className="space-y-6">
          {flaggedReviews.map((review) => (
            <div key={review._id} className="relative">
              {/* Flagged indicator banner */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-t-xl px-4 py-3 flex items-center gap-2">
                <Flag className="text-red-600" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    This review has been flagged by admin
                  </p>
                  {review.flaggedReason && (
                    <p className="text-xs text-red-600 mt-1">
                      Reason: {review.flaggedReason}
                    </p>
                  )}
                  {review.reportCount && review.reportCount > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Reported by {review.reportCount} user{review.reportCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Review card */}
              <div className="border-2 border-red-200 rounded-b-xl overflow-hidden">
                <CardDisplay
                  title={review.itemName || "Unknown Item"}
                  subtitle={review.shopName}
                  rating={review.rating}
                  content={review.comment}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
