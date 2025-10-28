import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CardDisplay from "../components/CardDisplay";
import { apiFetch } from "../lib/api";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  itemName?: string;
  shopName?: string;
  itemId?: string;
  shopId?: string;
  catalogueId?: string;
  createdAt?: string;
};

export default function ProfileReviews() {
  const navigate = useNavigate();
  const { logout, isAuthed, checked } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
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
        // TODO: Replace with actual API endpoint for user's reviews
        // For now, this will fail until the backend endpoint is implemented
        const resp = await apiFetch("/reviews/my-reviews", { method: "GET" });
        const data = resp?.data?.reviews ?? resp?.data ?? resp;

        if (!active) return;
        setReviews(data);
      } catch (err: any) {
        if (err?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        // If endpoint doesn't exist yet, show a friendly message
        if (err?.status === 404) {
          setError("Reviews feature is coming soon!");
        } else {
          setError(err?.message || "Failed to load reviews");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [logout, navigate]);

  const handleEdit = (reviewId: string, itemId?: string, catalogueId?: string) => {
    // TODO: Navigate to edit review page once implemented
    navigate("/EditReview", { state: { reviewId, itemId, catalogueId } });
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      // TODO: Replace with actual API endpoint for deleting reviews
      await apiFetch(`/reviews/${reviewId}`, { method: "DELETE" });
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err: any) {
      if (err?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      alert(err?.message || "Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        Loading reviews...
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

      <h1 className="text-3xl font-bold mb-2 text-gray-800">My Reviews</h1>
      <p className="text-gray-600 mb-8">All reviews you've posted</p>

      {error && (
        <div className="mb-6 border border-amber-200 bg-amber-50 text-amber-700 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!error && reviews.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-gray-500 text-lg">You haven't posted any reviews yet.</p>
        </div>
      )}

      {!error && reviews.length > 0 && (
        <div className="flex flex-col gap-5">
          {reviews.map((review) => (
            <CardDisplay
              key={review._id}
              title={review.itemName || "Unknown Item"}
              subtitle={review.shopName}
              rating={review.rating}
              content={review.comment}
              onEdit={() => handleEdit(review._id, review.itemId, review.catalogueId)}
              onDelete={() => handleDelete(review._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
