import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import "./index.css";
import { shops } from "./data/mockData";
import NavBar from "./components/NavBar";
import ViewShop from "./pages/ViewShop";
import ViewItem from "./pages/ViewItem";
import ViewCart from "./pages/ViewCart";
import MER from "./pages/MER";
import Footer from "./components/Footer";
import StoreSearch from "./pages/storeSearch";
import ItemSearch from "./pages/itemSearch";
import AddReview from "./pages/AddReview";
import EditReview from "./pages/EditReview";
import ActionSuccess from "./pages/ActionSuccess";
import Profile from "./pages/Profile";
import Login from "./pages/LogIn";
import AddReport from "./pages/ReportReview";
import ReportShop from "./pages/ReportShop";
import EditReport from "./pages/EditReport";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import EditShop from "./pages/EditShop";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterShopper from "./pages/RegisterShopper";
import RegisterOwner from "./pages/RegisterOwner";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SeeReviews from "./pages/SeeReviews";
import SeeReports from "./pages/SeeReports";
import SeeViolations from "./pages/SeeViolations";
import { useAuth } from "./context/AuthContext";
import { userContext } from "./contexts/userContext";
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

export default function App() {
  const [username, setUsername] = useState("");

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
      <userContext.Provider value={{ username, setUsername }}>
        <Layout>
        <NavBar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/ViewShop/:id" element={<ViewShop />} />
          <Route path="/ViewItem/:id" element={<ViewItem />} />
          <Route path="/storeSearch" element={<StoreSearch />} />
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
        </Routes>
        <Footer />
        </Layout>
      </userContext.Provider>
    </BrowserRouter>
  );
}
