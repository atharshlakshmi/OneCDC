import { createContext, useState } from "react";
import "./index.css";
import { shops } from "./data/mockData";
import NavBar from "./components/NavBar";
import ViewShop from "./pages/ViewShop";
import ViewItem from "./pages/ViewItem";
import ViewCart from "./pages/ViewCart";
import Footer from "./components/Footer";
import StoreSearch from "./pages/storeSearch";
import ItemSearch from "./pages/itemSearch";
import SearchBar from "./components/SearchBar";
import AddReview from "./pages/AddReview";
import ActionSuccess from "./pages/ActionSuccess";
import Profile from "./pages/Profile";
import Login from "./pages/LogIn";
import AddReport from "./pages/ReportReview";
import AddItem from "./pages/AddItem";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterShopper from "./pages/RegisterShopper";
import RegisterOwner from "./pages/RegisterOwner";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
// inside <Routes>

export const UserContext = createContext({
  username: "",
  setUsername: (name: string) => {},
});

function App() {
  const [username, setUsername] = useState("");
  const Home = () => (
    <>
      <SearchBar />
      <div className="flex flex-col gap-5 items-center m-5 align-center justify-center">
        {shops.map((shop) => (
          <Link to={`/ViewShop/${shop.id}`} key={shop.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
            <h2 className="text-xl text-amber-400">{shop.name}</h2>
            <p>{shop.address}</p>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ username, setUsername }}>
        <NavBar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/ViewShop/:id" element={<ViewShop />} />
          <Route path="/ViewItem/:id" element={<ViewItem />} />
          <Route path="/storeSearch" element={<StoreSearch />} />
          <Route path="/itemSearch" element={<ItemSearch />} />
          <Route path="/AddReview" element={<AddReview />} />
          <Route path="/ActionSuccess" element={<ActionSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/shopper" element={<RegisterShopper />} />
          <Route path="/register/owner" element={<RegisterOwner />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/ReportReview" element={<AddReport />} />
          <Route path="/AddItem" element={<AddItem />} />

          {/* Private routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/ViewCart" element={<ViewCart />} />
            {/* add more private routes here */}
          </Route>
        </Routes>

        <Footer />
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
