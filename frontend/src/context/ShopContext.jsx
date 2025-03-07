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
  const [selectedItems, setSelectedItems] = useState([]);


  
  // Filter states
  const [category, setCategory] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [filterProducts, setFilterProducts] = useState(products);

  const navigate = useNavigate();

  const addToCart = async (itemId, size, quantity, name, price, image) => {
    if (!size) {
      toast.error("Select Size");
      return;
    }

    setCartData((prevCart) => {
      const existingItem = prevCart[itemId]?.find((item) => item.size === size);

      if (existingItem) {
        return {
          ...prevCart,
          [itemId]: prevCart[itemId].map((item) =>
            item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        return {
          ...prevCart,
          [itemId]: [
            ...(prevCart[itemId] || []),
            { itemId, name, price, image, size, quantity },
          ],
        };
      }
    });
  };

  const getCartCount = () => {
    return Object.values(cartData)
      .flat()
      .reduce((total, item) => total + item.quantity, 0);
  };

  const removeFromCart = (productId, size) => {
    setCartData((prevCart) => {
      if (!prevCart[productId]) return prevCart;

      const updatedItems = prevCart[productId].filter(
        (item) => item.size !== size
      );
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
      if (!prevCart[productId]) return prevCart;

      const updatedItems = prevCart[productId].map((item) =>
        item.size === size ? { ...item, quantity: quantity } : item
      );

      return {
        ...prevCart,
        [productId]: updatedItems,
      };
    });
  };

  // Convert cartData into an array
  const cartItems = Object.entries(cartData).flatMap(([productId, variants]) =>
    variants.map((variant) => ({
      productId,
      size: variant.size,
      quantity: variant.quantity,
      name: variant.name || "Unknown Product",
      price: variant.price || 0,
      image: variant.image || "/placeholder.jpg",
    }))
  );

  // Handle selection toggle
  const toggleSelectItem = (productId, size) => {
    setSelectedItems((prev) => {
      const updatedItems = prev.some(
        (item) => item.productId === productId && item.size === size
      )
        ? prev.filter(
            (item) => !(item.productId === productId && item.size === size)
          )
        : [...prev, { productId, size }];

      console.log("Selected Items After:", updatedItems);
      return updatedItems;
    });
  };

  // Calculate total price of selected items
  const totalPrice = selectedItems.reduce((total, selectedItem) => {
    const item = cartItems.find(
      (product) =>
        product.productId === selectedItem.productId &&
        product.size === selectedItem.size
    );
    return total + (item ? item.price * item.quantity : 0);
  }, 0);

  // Toggle category filter
  const toggleCategory = (value) => {
    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Toggle size filter
  const toggleSizes = (value) => {
    setSizes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Apply filter based on categories and sizes
  const applyFilter = () => {
    let productsCopy = products.slice();

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (sizes.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        item.sizes.some((size) => sizes.includes(size))
      );
    }

    setFilterProducts(productsCopy);
  };

  useEffect(() => {
    console.log(cartData);
  }, [cartData]);

  useEffect(() => {
    applyFilter();
  }, [category, sizes]);

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
    navigate,
    selectedItems,
    toggleSelectItem,
    totalPrice,
    category,
    sizes,
    toggleCategory,
    toggleSizes,
    applyFilter,
    filterProducts,
    setFilterProducts,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopcontextProvider;
