import { useState } from "react";
import "./index.css";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import ViewShop from "./pages/ViewShop";
import ViewItem from "./pages/ViewItem";
import ViewCart from "./pages/ViewCart";
<<<<<<< HEAD
import Footer from "./components/Footer";
import StoreSearch from "./pages/storeSearch";
=======
import ShopSearch from "./pages/shopSearch";
>>>>>>> origin/lakshmi
import ItemSearch from "./pages/itemSearch";
import AddReview from "./pages/AddReview";
import EditReview from "./pages/EditReview";
import ActionSuccess from "./pages/ActionSuccess";
import ProfileHome from "./pages/ProfileHome";
import ProfileDetails from "./pages/ProfileDetails";
import ProfileReviews from "./pages/ProfileReviews";
import ProfileReports from "./pages/ProfileReports";
<<<<<<< HEAD
import ProfileStores from "./pages/ProfileStores";
import ProfileFlaggedStores from "./pages/ProfileFlaggedStores";
=======
>>>>>>> origin/lakshmi
import ViewRoute from "./pages/ViewRoute";
import Login from "./pages/LogIn";
import AddReport from "./pages/ReportReview";
import ReportShop from "./pages/ReportShop";
import EditReport from "./pages/EditReport";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import EditShop from "./pages/EditShop";
<<<<<<< HEAD
import AddShop from "./pages/AddShop";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
=======
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
>>>>>>> origin/lakshmi
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

  return (
    <BrowserRouter>
      <userContext.Provider value={{ username, setUsername }}>
        <Layout>
<<<<<<< HEAD
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
              <Route path="/AddItem" element={<AddItem />} />
              <Route path="/EditReview" element={<EditReview />} />
              <Route path="/EditReport" element={<EditReport />} />
              <Route path="/EditItem" element={<EditItem />} />
              <Route path="/EditShop" element={<EditShop />} />
              <Route path="/AddShop" element={<AddShop />} />
            </Route>
          </Routes>
          <Footer />
=======
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
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfileHome />} />
            <Route path="/profile/details" element={<ProfileDetails />} />
            <Route path="/profile/reviews" element={<ProfileReviews />} />
            <Route path="/profile/reports" element={<ProfileReports />} />
            <Route path="/ViewCart" element={<ViewCart />} />
            <Route path="/route" element={<ViewRoute />} />
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
          </Route>
        </Routes>
>>>>>>> origin/lakshmi
        </Layout>
      </userContext.Provider>
    </BrowserRouter>
  );
}
