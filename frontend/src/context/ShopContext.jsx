import React, { useState, createContext, useEffect } from "react";
import { products } from "../assets/assets";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext(); // ✅ Correct context creation

const ShopcontextProvider = ({ children }) => {
  const currency = "Rs";
  const delivery_fee = 100;
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [cartData, setCartData] = useState({});

  const navigate= useNavigate();

  const addToCart = async (itemId, size, quantity, name, price, image) => {
    if (!size) {
        toast.error("Select Size");
        return;
    }

    setCartData(prevCart => {
        // Check if item already exists in the cart with the same size
        const existingItem = prevCart[itemId]?.find(item => item.size === size);

        if (existingItem) {
            // Update quantity if item already exists
            return {
                ...prevCart,
                [itemId]: prevCart[itemId].map(item => 
                    item.size === size 
                        ? { ...item, quantity: item.quantity + quantity } 
                        : item
                )
            };
        } else {
            // Add new item if not present
            return {
                ...prevCart,
                [itemId]: [
                    ...(prevCart[itemId] || []), 
                    { itemId, name, price, image, size, quantity }
                ]
            };
        }
    });
};


const getCartCount = () => {
    return Object.values(cartData).flat().reduce((total, item) => total + item.quantity, 0);
};

const removeFromCart = (productId, size) => {
  setCartData((prevCart) => {
    // If there are no items of this productId, return the same object
    if (!prevCart[productId]) return prevCart;

    // Filter out the item with the specified size
    const updatedItems = prevCart[productId].filter((item) => item.size !== size);

    // If no items are left for this productId, remove the key from the cartData
    const updatedCart = { ...prevCart };
    if (updatedItems.length === 0) {
      delete updatedCart[productId];
    } else {
      updatedCart[productId] = updatedItems;
    }

    return updatedCart;
  });
};


const updateCartQuantity = (productId, size, quantity) => {
  setCartData((prevCart) => {
    // Check if the productId exists in cartData
    if (!prevCart[productId]) return prevCart;

    // Map through the cart data and update the quantity of the item with the matching size
    const updatedItems = prevCart[productId].map((item) =>
      item.size === size ? { ...item, quantity: quantity } : item
    );

    return {
      ...prevCart,
      [productId]: updatedItems, // Update the items for this productId
    };
  });
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
    cartData,
    setCartData,
    getCartCount,
    removeFromCart,
    updateCartQuantity,
    navigate
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
