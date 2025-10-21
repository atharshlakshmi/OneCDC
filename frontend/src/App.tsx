import React, { createContext, useState } from "react";
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
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

export const UserContext = createContext({
  username: "",
  setUsername: (name: string) => {},
});

function App() {
  const [username, setUsername] = useState("");
  const Home = () => (
    <>
      <SearchBar />
      <div className="list-container">
        {shops.map((shop) => (
          <Link to={`/ViewShop/${shop.id}`} key={shop.id} className="list-card">
            <h2>{shop.name}</h2>
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
