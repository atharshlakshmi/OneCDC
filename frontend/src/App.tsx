import React, { useState, useEffect } from "react";
import './index.css'
import NavBar from './components/NavBar';
import ViewShop from './pages/ViewShop';
import ViewItem from './pages/ViewItem';
import ViewCart from './pages/ViewCart';
import Footer from './components/Footer';
import StoreSearch from './pages/storeSearch';
import ItemSearch from './pages/itemSearch';
import SearchBar from "./components/SearchBar";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { api } from './services/api';
import type { Shop } from './types/api';

function App() {
  const Home = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Fetch shops from backend API
      api.getAllShops()
        .then((data) => {
          setShops(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch shops:', err);
          setError(err.message || 'Failed to load shops');
          setLoading(false);
        });
    }, []);

    if (loading) {
      return (
        <>
          <SearchBar />
          <div className="list-container">
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading shops...</p>
          </div>
        </>
      );
    }

    if (error) {
      return (
        <>
          <SearchBar />
          <div className="list-container">
            <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
              Error: {error}
            </p>
          </div>
        </>
      );
    }

    return (
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
  };

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
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

      