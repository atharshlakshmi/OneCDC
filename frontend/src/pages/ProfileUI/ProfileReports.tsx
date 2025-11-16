import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../lib/api";
import { Flag, AlertTriangle } from "lucide-react";

type FlaggedReview = {
  _id: string;
  itemId: string;
  itemName: string;
  catalogueId: string;
  shopName: string;
  description: string;
  images: string[];
  availability: boolean;
  warnings: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
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
        // Fetch the user's flagged reviews
        const resp = await apiGet<{ success: boolean; data: FlaggedReview[] }>("/reviews/flagged");
        const data = resp?.data ?? [];

        if (!active) return;
        setFlaggedReviews(data);
      } catch (err: any) {
        if (err?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setError(err?.message || "Failed to load flagged reviews");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [logout, navigate]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading flagged reviews...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/profile")} className="text-gray-600 hover:text-gray-800 text-sm font-medium">
          ← Back to Profile
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Flagged Reviews</h1>
        <AlertTriangle className="text-red-500" size={28} />
      </div>
      <p className="text-gray-600 mb-8">Your reviews that have been reported by other users and flagged by admin</p>

      {error && <div className="mb-6 border border-amber-200 bg-amber-50 text-amber-700 rounded-lg px-4 py-3">{error}</div>}

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
            <div key={review._id} className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              {/* Flagged indicator banner */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-red-200">
                <Flag className="text-red-600 mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">This review has been flagged by administrators</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      {review.warnings} {review.warnings === 1 ? "Warning" : "Warnings"}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                      {review.reportCount} {review.reportCount === 1 ? "Report" : "Reports"}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${review.availability ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {review.availability ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review content */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{review.itemName}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Shop: {review.shopName}</p>
                <p className="text-gray-700 mb-4">{review.description}</p>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Review ${idx + 1}`} className="h-20 w-20 object-cover rounded border-2 border-red-200" />
                    ))}
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-red-200">
                  <p>Created: {new Date(review.createdAt).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(review.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Warning message */}
              <div className="mt-4 pt-4 border-t border-red-300">
                <p className="text-sm text-red-800 font-medium">⚠️ This review is no longer visible to other users.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
