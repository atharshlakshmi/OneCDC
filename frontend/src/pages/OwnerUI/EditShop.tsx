import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { Store, MapPin, Phone, Mail, Clock, Image as ImageIcon, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SHOP_CATEGORIES = [
  { value: "fashion & apparel", label: "Fashion & Apparel" },
  { value: "home products", label: "Home Products" },
  { value: "health & beauty", label: "Health & Beauty" },
  { value: "toys & hobbies", label: "Toys & Hobbies" },
  { value: "grocery", label: "Grocery" },
  { value: "food & beverage", label: "Food & Beverage" },
  { value: "electronics", label: "Electronics" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface OperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Shop {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  category: string;
  images: string[];
  operatingHours: OperatingHours[];
  isActive: boolean;
  verifiedByOwner: boolean;
}

export default function EditShop() {
  const location = useLocation();
  const navigate = useNavigate();
  const shopId = location.state?.shopId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    category: "grocery",
    images: [] as string[],
  });

  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: false,
    }))
  );

  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch shop data
  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) {
        setError("No shop ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiFetch<{ success: boolean; data: Shop }>(`/owner/shops/${shopId}`, { method: "GET" });

        if (response?.success && response?.data) {
          const shopData = response.data;
          setShop(shopData);

          // Populate form data
          setFormData({
            name: shopData.name,
            description: shopData.description,
            address: shopData.address,
            phone: shopData.phone,
            email: shopData.email || "",
            category: shopData.category,
            images: shopData.images || [],
          });

          // Populate operating hours
          if (shopData.operatingHours && shopData.operatingHours.length > 0) {
            const hoursMap = new Map(shopData.operatingHours.map((oh) => [oh.dayOfWeek, oh]));

            const allHours = DAYS_OF_WEEK.map((day) => {
              const existing = hoursMap.get(day.value);
              return (
                existing || {
                  dayOfWeek: day.value,
                  openTime: "09:00",
                  closeTime: "18:00",
                  isClosed: true,
                }
              );
            });

            setOperatingHours(allHours);
          }
        }
      } catch (err: any) {
        console.error("Error fetching shop:", err);
        setError(err?.message || "Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOperatingHoursChange = (index: number, field: keyof OperatingHours, value: string | boolean) => {
    setOperatingHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        const response = await fetch(`${apiBase}/upload/image`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          credentials: "include",
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data?.success && data?.data?.url) {
          return data.data.url;
        }
        throw new Error("Upload failed");
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (err: any) {
      console.error("Error uploading images:", err);
      toast.error(err?.message || "Failed to upload images. Please try again.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Shop name is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    const phoneRegex = /^[689]\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid Singapore phone number (8 digits starting with 6, 8, or 9)");
      return;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setSaving(true);

      const shopData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        category: formData.category,
        images: formData.images,
        operatingHours: operatingHours.filter((oh) => !oh.isClosed),
        verifiedByOwner: true,
      };

      const response = await apiFetch<{ success: boolean; data: any; message: string }>(`/owner/shops/${shopId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shopData),
      });

      if (response?.success) {
        toast.success("Shop updated successfully!");
        setTimeout(() => {
          navigate("/profile/stores", { replace: true });
        }, 500);
      } else {
        toast.error("Failed to update shop. Please try again.");
      }
    } catch (err: any) {
      console.error("Error updating shop:", err);
      toast.error(err?.message || "Failed to update shop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading shop details…</div>;
  }

  if (error && !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Store" />

      <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Store size={32} className="text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-800">Update Your Store</h2>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="Enter shop name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="Describe your shop..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                required
              >
                {SHOP_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Location
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="Enter full address (e.g., 123 Main Street, Singapore 123456)"
                required
              />
              <p className="text-sm text-gray-500 mt-1">We'll automatically update coordinates if you change the address</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Phone size={16} />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="81234567"
                required
              />
              <p className="text-sm text-gray-500 mt-1">8 digits starting with 6, 8, or 9</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Mail size={16} />
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="shop@example.com"
              />
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Images (Optional, max 10)
            </h3>

            <div className="mb-4">
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors duration-200"
              >
                <ImageIcon size={20} className="text-gray-400" />
                <span className="text-gray-600">{uploadingImage ? "Uploading..." : "Click to browse and upload images"}</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageUpload}
                disabled={formData.images.length >= 10 || uploadingImage}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">Accepted formats: JPEG, JPG, PNG, GIF, WEBP (Max 5MB per image)</p>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((img, index) => {
                  const imageUrl = img.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${img}` : img;

                  return (
                    <div key={index} className="relative group">
                      <img src={imageUrl} alt={`Shop ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-300" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operating Hours */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Operating Hours
            </h3>

            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day.value} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                  <div className="w-24 font-medium text-gray-700">{day.label}</div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={operatingHours[index].isClosed}
                      onChange={(e) => handleOperatingHoursChange(index, "isClosed", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>

                  {!operatingHours[index].isClosed && (
                    <>
                      <input
                        type="time"
                        value={operatingHours[index].openTime}
                        onChange={(e) => handleOperatingHoursChange(index, "openTime", e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={operatingHours[index].closeTime}
                        onChange={(e) => handleOperatingHoursChange(index, "closeTime", e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button type="button" onClick={() => navigate(-1)} variant="outline" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-white">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
