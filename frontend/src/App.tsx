import { BadgeCheck } from "lucide-react";
import "./index.css";
import { shops } from "./data/mockData";
import NavBar from "./components/NavBar";
import ViewShop from "./pages/ShopperUI/ViewShop";
import ViewItem from "./pages/ShopperUI/ViewItem";
import ViewCart from "./pages/ShopperUI/ViewCart";
import MER from "./pages/ShopperUI/MER";
import Footer from "./components/Footer";
import StoreSearch from "./pages/ShopperUI/StoreSearch";
import ItemSearch from "./pages/ShopperUI/ItemSearch";
import AddReview from "./pages/ShopperUI/AddReview";
import EditReview from "./pages/ShopperUI/EditReview";
import Profile from "./pages/AuthUI/Profile";
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
import SeeReviews from "./pages/AdminUI/SeeReviews";
import SeeReports from "./pages/AdminUI/SeeReports";
import SeeViolations from "./pages/AdminUI/SeeViolations";
import AdminDashboard from "./pages/AdminUI/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

// Guard: redirects authenticated users away from /login and /register
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthed, checked } = useAuth();
  const location = useLocation();

  if (!checked) return <div style={{ padding: 16 }}>Checking session…</div>;

  if (isAuthed) {
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
  const Home = () => (
    <>
      <div className="flex flex-col gap-5 items-center m-5 align-center justify-center">
        {shops.map((shop) => (
          <Link to={`/ViewShop/${shop.id}`} key={shop.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
            
            <div className = "flex flex-row">
              <h2 className="text-xl text-amber-400">{shop.name}</h2>
              {shop.ownerVerified  ? (
                <p className="text-green-700 font-medium absolute right-10"><BadgeCheck /></p>
              ) : (
                <></>
              )}
            </div>
              
            <p>{shop.address}</p>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <BrowserRouter>
      <Layout>
        <NavBar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/ViewShop/:id" element={<ViewShop />} />
          <Route path="/ViewItem/:id" element={<ViewItem />} />
          <Route path="/storeSearch" element={<StoreSearch />} />
          <Route path="/itemSearch" element={<ItemSearch />} />

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
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/ViewCart" element={<ViewCart />} />
            <Route path="/SeeReviews" element={<SeeReviews />} />
            <Route path="/SeeReports" element={<SeeReports />} />
            <Route path="/SeeViolations" element={<SeeViolations />} />
            <Route path="/AddReview" element={<AddReview />} />
            <Route path="/ReportShop" element={<ReportShop />} />
            <Route path="/ReportReview" element={<AddReport />} />
            <Route path="/AddItem" element={<AddItem />} />
            <Route path="/EditReview" element={<EditReview />} />
            <Route path="/EditReport" element={<EditReport />} />
            <Route path="/EditItem" element={<EditItem />} />
            <Route path="/EditShop" element={<EditShop />} />
            <Route path="/MER" element={<MER />} />
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
