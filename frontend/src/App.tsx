import React, { useState } from "react";
import './index.css'
import { shops } from "./data/mockData";
import NavBar from './components/NavBar';
import ViewShop from './pages/ViewShop';
import ViewItem from './pages/ViewItem';
import ViewCart from './pages/ViewCart';
import Footer from './components/Footer';
import StoreSearch from './pages/storeSearch';
import ItemSearch from './pages/itemSearch';
import SearchBar from "./components/SearchBar";
import AddReview from "./pages/AddReview";
import ActionSuccess from "./pages/ActionSuccess";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';


function App() {
  const Home = () => (
    <>
      <SearchBar />
      <div className="list-container">
        {shops.map(shop => (
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
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ViewShop/:id" element={<ViewShop />} />
        <Route path="/ViewItem/:id" element={<ViewItem />} />
        <Route path="/ViewCart" element={<ViewCart />} />
        <Route path="/storeSearch" element={<StoreSearch />} />
        <Route path="/itemSearch" element={<ItemSearch />} />
        <Route path="/AddReview" element={<AddReview />} />
        <Route path="/ActionSuccess" element={<ActionSuccess />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

      