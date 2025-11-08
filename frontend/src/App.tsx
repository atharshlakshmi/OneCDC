import "./index.css";
import { Loader2 } from "lucide-react";
import "./index.css";
import NavBar from "./components/NavBar";
import ViewShop from "./pages/ShopperUI/ViewShop";
import ViewItem from "./pages/ShopperUI/ViewItem";
import ViewCart from "./pages/ShopperUI/ViewCart";
import MER from "./pages/ShopperUI/MER";
import Footer from "./components/Footer";
import ActionSuccess from "./pages/ActionSuccess";
import ProfileHome from "./pages/ProfileHome";
import ProfileDetails from "./pages/ProfileDetails";
import ProfileReviews from "./pages/ProfileReviews";
import ProfileReports from "./pages/ProfileReports";
import ProfileStores from "./pages/ProfileStores";
import ProfileFlaggedStores from "./pages/ProfileFlaggedStores";
import ViewRoute from "./pages/ViewRoute";
import AddShop from "./pages/AddShop";
import ManageCatalogue from "./pages/ManageCatalogue";

import ShopSearch from "./pages/ShopperUI/shopSearch";
import ItemSearch from "./pages/ShopperUI/ItemSearch";
import AddReview from "./pages/ShopperUI/AddReview";
import EditReview from "./pages/ShopperUI/EditReview";
import Login from "./pages/AuthUI/LogIn";
import AddReport from "./pages/ShopperUI/ReportReview";
import ReportShop from "./pages/ShopperUI/ReportShop";
import EditReport from "./pages/ShopperUI/EditReport";
import AddItem from "./pages/OwnerUI/AddItem";
import EditItem from "./pages/OwnerUI/EditItem";
import EditShop from "./pages/OwnerUI/EditShop";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterShopper from "./pages/AuthUI/RegisterShopper";
import RegisterOwner from "./pages/AuthUI/RegisterOwner";
import VerifyEmailSent from "./pages/AuthUI/VerifyEmailSent";
import VerifyEmail from "./pages/AuthUI/VerifyEmail";
import ForgotPassword from "./pages/AuthUI/ForgotPassword";
import ResetPassword from "./pages/AuthUI/ResetPassword";
import Welcome from "./pages/AuthUI/Welcome";
import SeeReviews from "./pages/AdminUI/SeeReviews";
import SeeReports from "./pages/AdminUI/SeeReports";
import SeeViolations from "./pages/AdminUI/SeeViolations";
import AdminDashboard from "./pages/AdminUI/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import { useState, useEffect } from "react";
import { apiGet } from "./lib/api";
import { toast } from "sonner";
import { useImageBlobUrls, getImageDisplayUrl } from "./utils/imageUtils";

// Guard: redirects authenticated users away from /login and /register
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, isAuthed, checked } = useAuth();
  const location = useLocation();

  if (!checked) return <div style={{ padding: 16 }}>Checking session…</div>;

  if (isAuthed) {
    // Redirect based on user role
    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user?.role === "owner") {
      return <Navigate to="/profile/stores" replace />;
    } else if (user?.role === "registered_shopper") {
      return <Navigate to="/shopSearch" replace />;
    }
    const from = (location.state as any)?.from || "/";
    return <Navigate to={from} replace />;
  }
  return <>{children}</>;
}

// Guard: admin-only access
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthed, checked } = useAuth();
  const location = useLocation();

  if (!checked) return <div style={{ padding: 16 }}>Checking session…</div>;

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <Link to="/">Go Home</Link>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  interface Shop {
    id: string;
    name: string;
    details: string;
    address: string;
    contact_number: string;
    operating_hours: string;
    images?: string[];
    items: any[];
  }

  const Home = () => {
    const { user } = useAuth();
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    // Convert all shop images to blob URLs for better performance
    const allShopImages = shops.flatMap((shop) => shop.images || []);
    const imageBlobUrls = useImageBlobUrls(allShopImages);

    useEffect(() => {
      const fetchShops = async () => {
        setLoading(true);
        try {
          const response = await apiGet<Shop[]>("/shops");
          setShops(response);
        } catch (error: any) {
          console.error("Failed to fetch shops:", error);
          toast.error("Failed to load shops. Please try again.");
          setShops([]);
        } finally {
          setLoading(false);
        }
      };

      fetchShops();
    }, []);

    // Redirect users based on role (after hooks)
    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (user?.role === "owner") {
      return <Navigate to="/profile/stores" replace />;
    }
    if (user?.role === "registered_shopper") {
      return <Navigate to="/shopSearch" replace />;
    }

    // Redirect non-authenticated users to shop search
    if (!user) {
      return <Navigate to="/shopSearch" replace />;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-3 text-gray-600">Loading shops...</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 items-center m-5 align-center justify-center pb-24">
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No shops available yet.</p>
            <p className="text-sm text-gray-500">Please add shops to the database or check your connection.</p>
          </div>
        ) : (
          shops.map((shop) => (
            <Link
              to={`/ViewShop/${shop.id}`}
              key={shop.id}
              className="w-full max-w-4xl rounded-2xl bg-amber-400 shadow-lg overflow-hidden flex flex-row hover:bg-amber-500 transition-colors"
            >
              {/* Left Half - Image */}
              <div className="w-1/2 h-48 sm:h-56 bg-amber-300 flex items-center justify-center">
                {shop.images && shop.images.length > 0 ? (
                  <img src={getImageDisplayUrl(shop.images[0], imageBlobUrls)} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-amber-300">
                    <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Right Half - Text */}
              <div className="w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl text-white font-bold mb-2">{shop.name}</h2>
                <p className="text-white text-sm sm:text-base">{shop.address}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Layout>
        <NavBar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />

          <Route path="/ViewShop/:id" element={<ViewShop />} />
          <Route path="/ViewItem/:id" element={<ViewItem />} />

          <Route path="/shopSearch" element={<ShopSearch />} />
          <Route path="/itemSearch" element={<ItemSearch />} />
          <Route path="/ActionSuccess" element={<ActionSuccess />} />
          {/* Auth routes (redirect authed users away) */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <Login />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/register/shopper"
            element={
              <RedirectIfAuthed>
                <RegisterShopper />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/register/owner"
            element={
              <RedirectIfAuthed>
                <RegisterOwner />
              </RedirectIfAuthed>
            }
          />

          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfileHome />} />
            <Route path="/profile/details" element={<ProfileDetails />} />
            <Route path="/profile/reviews" element={<ProfileReviews />} />
            <Route path="/profile/reports" element={<ProfileReports />} />
            <Route path="/profile/stores" element={<ProfileStores />} />
            <Route path="/profile/flagged-stores" element={<ProfileFlaggedStores />} />
            <Route path="/ViewCart" element={<ViewCart />} />
            <Route path="/route" element={<ViewRoute />} />
            <Route path="/SeeReviews" element={<SeeReviews />} />
            <Route path="/SeeReports" element={<SeeReports />} />
            <Route path="/SeeViolations" element={<SeeViolations />} />
            <Route path="/AddReview" element={<AddReview />} />
            <Route path="/ReportShop" element={<ReportShop />} />
            <Route path="/ReportReview" element={<AddReport />} />
            <Route path="/ManageCatalogue/:shopId" element={<ManageCatalogue />} />
            <Route path="/AddItem/:shopId" element={<AddItem />} />
            <Route path="/EditItem/:shopId/:itemId" element={<EditItem />} />
            <Route path="/EditReview" element={<EditReview />} />
            <Route path="/EditReport" element={<EditReport />} />
            <Route path="/EditShop" element={<EditShop />} />
            <Route path="/AddShop" element={<AddShop />} />
          </Route>

          {/* Admin-only routes */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
        <Footer />
      </Layout>
    </BrowserRouter>
  );
}
