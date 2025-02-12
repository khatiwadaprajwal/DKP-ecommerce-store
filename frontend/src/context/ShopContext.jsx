import React, { useState, createContext } from "react";
import { products } from "../assets/assets";

export const ShopContext = createContext(); // ✅ Correct context creation

const ShopcontextProvider = ({ children }) => {
  const currency = "Rs";
  const delivery_fee = 100;
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState("");
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const value = {
    products,
    currency,
    delivery_fee,
    backend_url,
    token,
    setToken,
    search,
    setSearch,
    showSearch,
    setShowSearch,
  };

  return (
    <ShopContext.Provider value={value}>
      {" "}
      {/* ✅ Correct Provider */}
      {children}
    </ShopContext.Provider>
  );
};

export default ShopcontextProvider;
