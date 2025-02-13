import React, { useState, createContext, useEffect } from "react";
import { products } from "../assets/assets";
import { ToastContainer, toast } from "react-toastify";

export const ShopContext = createContext(); // ✅ Correct context creation

const ShopcontextProvider = ({ children }) => {
  const currency = "Rs";
  const delivery_fee = 100;
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [cartData, setCartData] = useState({});

  const addToCart = async (itemId, size, quantity) => {

    if(!size){
        toast.error("Select Size")
        return;
    }

    setCartData(prevCart => {
        // Check if item already exists in cart with the same size
        const existingItem = prevCart[itemId]?.find(item => item.size === size);
        
        if (existingItem) {
            // Update quantity if item already exists
            return {
                ...prevCart,
                [itemId]: prevCart[itemId].map(item => 
                    item.size === size ? { ...item, quantity: item.quantity + quantity } : item
                )
            };
        } else {
            // Add new item if not present
            return {
                ...prevCart,
                [itemId]: [...(prevCart[itemId] || []), { size, quantity }]
            };
        }
    });
    
};

const getCartCount = () => {
    return Object.values(cartData).flat().reduce((total, item) => total + item.quantity, 0);
};

  useEffect(() => {
    console.log(cartData);
  }, [cartData]);

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
    addToCart,
    getCartCount,
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
