import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Tag, MapPin } from "lucide-react";
import { normalizeToDataUrl, useImageBlobUrls, getImageDisplayUrl } from "../../utils/imageUtils";

interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  availability?: boolean;
  images?: string[];
  category?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
  catalogueId: string;
  shopId: string;
  shopName: string;
}

interface Review {
  id: string;
  itemId: string;
  shopperName: string;
  shopperId: string;
  description: string;
  availability: boolean;
  images: string[];
  createdAt: string;
}

const ViewItem: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [itemReviews, setItemReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Flatten all review images for blob conversion
  const allReviewImages = itemReviews.flatMap(review => review.images || []);
  const imageBlobUrls = useImageBlobUrls(allReviewImages);

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await apiGet<Item>(`/items/${id}`);
        setItem(response);
      } catch (error: any) {
        console.error("Failed to fetch item:", error);
        toast.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      setReviewsLoading(true);
      try {
        const reviews = await apiGet<Review[]>(`/items/${id}/reviews`);
        console.log('📊 Fetched reviews:', reviews);

        // Debug: Log image data for each review
        reviews.forEach((review, idx) => {
          console.log(`Review ${idx + 1}:`, {
            id: review.id,
            hasImages: review.images && review.images.length > 0,
            imageCount: review.images?.length || 0,
            firstImagePreview: review.images?.[0]?.substring(0, 100) || 'No images'
          });
        });

        setItemReviews(reviews);
      } catch (error: any) {
        console.error("Failed to fetch reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-gray-600">Loading item...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Item not found.
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/EditItem/`, { state: { item } });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      // TODO: Implement delete API call
      toast.info("Delete functionality coming soon");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title={item.name} />
      <Tabs defaultValue="Details">
        <TabsList className="w-full bg-transparent">
          <TabsTrigger value="Details" className="data-[state=active]:bg-amber-400 data-[state=active]:text-white text-lg">Details</TabsTrigger>
          <TabsTrigger value="Reviews" className="data-[state=active]:bg-amber-400 data-[state=active]:text-white text-lg">Reviews</TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="Details">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-6 mx-auto">
              {/* Item Image */}
              {item.images && item.images.length > 0 && (
                <div className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}

              {item.description && (
                <p className="text-gray-800 text-left">{item.description}</p>
              )}

              <div className="flex items-center gap-3 text-gray-800 text-left">
                <Tag className="w-5 h-5 flex-shrink-0" />
                <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-3 text-gray-800 text-left">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <p><strong>Available at:</strong> {item.shopName}</p>
              </div>

              {item.category && (
                <div className="text-left">
                  <p className="text-gray-800"><strong>Category:</strong> {item.category}</p>
                </div>
              )}

              {/* Last Updated Info */}
              <div className="text-left text-xs text-gray-500 mt-2">
                {item.lastUpdatedDate && (
                  <p>Last updated: {new Date(item.lastUpdatedDate).toLocaleDateString()}</p>
                )}
                {item.lastUpdatedBy && (
                  <p>Updated by: {item.lastUpdatedBy}</p>
                )}
              </div>

              {/* Conditional buttons based on user role */}
              {user?.role === "owner" && (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={handleEdit} className="shadow-lg">
                      Edit Item
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleDelete}
                      className="shadow-lg"
                    >
                      Delete Item
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="Reviews">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <span className="ml-3 text-gray-600">Loading reviews...</span>
              </div>
            ) : itemReviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews yet.</p>
            ) : (
              itemReviews.map((review) => (
                <div
                  key={review.id}
                  className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 mx-auto"
                >
                  <div className={`flex ${review.images && review.images.length > 0 ? 'flex-row gap-6' : 'flex-col gap-4'} items-start`}>
                    {/* Left side - Content */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">
                          {review.shopperName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            review.availability
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {review.availability ? "Available" : "Not Available"}
                        </span>
                      </div>

                      <p className="text-gray-700 w-full text-left">
                        {review.description}
                      </p>

                      {user?.role === "registered_shopper" && user._id !== review.shopperId && (
                        <button
                          onClick={() =>
                            navigate("/ReportReview", {
                              state: {
                                reviewId: review.id,
                                reviewerId: review.shopperId,
                                reporterId: user._id,
                                itemId: item.id,
                              },
                            })
                          }
                          className="text-xs text-gray-500 underline hover:text-gray-700 text-left self-start"
                        >
                          Report
                        </button>
                      )}
                    </div>

                    {/* Right side - Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex-1 flex flex-col gap-3">
                        {review.images.map((img, idx) => {
                          const displayUrl = getImageDisplayUrl(img, imageBlobUrls);

                          return (
                            <div
                              key={idx}
                              className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => window.open(displayUrl, '_blank')}
                            >
                              <img
                                src={displayUrl}
                                alt={`Review image ${idx + 1}`}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                  e.currentTarget.classList.add('opacity-50');
                                }}
                                loading="lazy"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Add Review Button */}
            {user?.role === "registered_shopper" && (
              <div className="w-full flex flex-col items-center mt-4 gap-3">
                <p className="text-center text-gray-600">
                  Tried purchasing this item before?
                  <br />
                  Leave a review to help others!
                </p>
                <Button
                  className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg"
                  size="lg"
                  onClick={() =>
                    navigate("/AddReview", {
                      state: {
                        itemId: item.id,
                        itemName: item.name,
                        catalogueId: item.catalogueId,
                        userId: user._id,
                      },
                    })
                  }
                >
                  Add Review
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewItem;
