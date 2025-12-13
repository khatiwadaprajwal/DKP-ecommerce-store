import React, { useState, createContext, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../config/api"; 
import { useAuth } from "./AuthProvider"; 

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "Rs";
  const delivery_fee = 0;
  
  // ✅ Get Auth State from AuthContext (Single Source of Truth)
  const { token, user } = useAuth();
  
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [cartData, setCartData] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Reviews & Ratings
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Filter states
  const [gender, setGender] = useState([]);
  const [category, setCategory] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]); 
  const [filterProducts, setFilterProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 1. Fetch Products (No Token Needed)
  const getProductsData = async () => {
    try {
      const response = await api.get("/v1/products");
      if (response.status === 200) {
        setProducts(response.data.products);
        setFilterProducts(response.data.products);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  // ✅ 2. Fetch Cart Data (Depends on Token from AuthContext)
  const fetchCartData = async () => {
    if (!token) {
      setCartData([]);
      return;
    }
  
    try {
      // ✅ api.get handles headers automatically
      const response = await api.get("/v1/getcart");
  
      if (response.status === 200 && response.data.cart) {
          const formattedCart = response.data.cart.cartItems.map((item) => ({
            cartItemId: item._id,
            itemId: item.product._id,
            name: item.product.productName,
            price: item.product.price,
            image: item.product.images,
            quantity: item.quantity,
            color: item.color,
            size: item.size
          }));
          setCartData(formattedCart);
      } else {
          setCartData([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // We don't clear cart here because API interceptor handles 401 logout
    }
  };

  // Re-fetch cart whenever token changes (Login/Logout)
  useEffect(() => {
    if (token) {
      fetchCartData();
    } else {
      setCartData([]);
    }
  }, [token]);

  // ✅ 3. Add to Cart
  const addToCart = async (productId, color, size, quantity = 1) => {
    if (!token) {
      toast.error("Login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const response = await api.post("/v1/add", { productId, color, size, quantity });

      if (response.status === 201 || response.status === 200) {
        toast.success("Product added to cart");
        // Optimistically update or fetch
        await fetchCartData();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.msg || "Missing required info");
      } else {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }
    }
  };

  const getCartCount = () => {
    return cartData.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ 4. PayPal Popup
  const openPayPalPopup = (approvalUrl) => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
  
    const paypalWindow = window.open(
      approvalUrl,
      "PayPal Payment",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  
    if (!paypalWindow) {
      toast.error("Popup blocked! Please allow popups.");
      return;
    }
  
    const interval = setInterval(() => {
      if (paypalWindow.closed) {
        clearInterval(interval);
        fetchCartData();
        localStorage.removeItem("selectedCartItems");
        navigate("/order");
      }
    }, 1000);
  };

  // ✅ 5. Filtering Logic (Unchanged mostly)
  useEffect(() => {
    if (location.pathname === "/") {
      resetAllFilters();
    }
  }, [location.pathname]);

  const resetAllFilters = () => {
    setGender([]);
    setCategory([]);
    setSizes([]);
    setColors([]);
    setPriceRange([0, 100000]);
    setSearchQuery("");
    setFilterProducts(products); 
  };

  const toggleFilter = (value, state, setter) => {
    if (value === "All") {
      setter([]);
    } else {
      setter((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  const toggleGender = (value) => toggleFilter(value, gender, setGender);
  const toggleCategory = (value) => toggleFilter(value, category, setCategory);
  const toggleSizes = (value) => toggleFilter(value, sizes, setSizes);
  const toggleColor = (value) => toggleFilter(value, colors, setColors);

  const applyFilter = () => {
    if (products.length === 0) return;

    let productsCopy = [...products];
    
    if (searchQuery && searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      productsCopy = productsCopy.filter((item) =>
        item.productName.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
      );
    }
    if (gender.length > 0) productsCopy = productsCopy.filter((item) => item.gender && gender.includes(item.gender));
    if (category.length > 0) productsCopy = productsCopy.filter((item) => item.category && category.includes(item.category));
    if (sizes.length > 0) productsCopy = productsCopy.filter((item) => item.variants && item.variants.some(v => sizes.includes(v.size)));
    if (colors.length > 0) productsCopy = productsCopy.filter((item) => item.variants && item.variants.some(v => colors.includes(v.color)));
    productsCopy = productsCopy.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    setFilterProducts(productsCopy);
  };
  
  const resetGenderFilter = () => setGender([]);
  const resetCategoryFilter = () => setCategory([]);
  const resetSizeFilter = () => setSizes([]);
  const resetColorFilter = () => setColors([]);
  const resetPriceFilter = () => setPriceRange([0, 100000]);
  const resetSearchQuery = () => setSearchQuery("");

  const handleSearchFunction = (query) => {
    setSearchQuery(query);
    if (location.pathname !== "/collection") navigate("/collection");
  };

  useEffect(() => {
    applyFilter();
  }, [gender, category, sizes, colors, priceRange, searchQuery, products]);

  // ✅ Memoize Value
  const value = useMemo(() => ({
    // Auth State (Pass-through from AuthContext)
    token, user, 
    
    // Product Data
    products, filterProducts, currency, delivery_fee,
    
    // Cart Actions
    cartData, setCartData, fetchCartData, addToCart, getCartCount, openPayPalPopup,

    // Search & Navigation
    search, setSearch, showSearch, setShowSearch, 
    searchQuery, setSearchQuery, handleSearchFunction, resetSearchQuery,
    navigate,
    
    // Filters
    gender, setGender, toggleGender, resetGenderFilter,
    category, setCategory, toggleCategory, resetCategoryFilter,
    sizes, setSizes, toggleSizes, resetSizeFilter,
    colors, setColors, toggleColor, resetColorFilter,
    priceRange, setPriceRange, resetPriceFilter,
    resetAllFilters,
    
    // Reviews
    averageRating, setAverageRating, totalReviews, setTotalReviews,
  }), [
    products, filterProducts, cartData, token, user, 
    search, showSearch, searchQuery, 
    gender, category, sizes, colors, priceRange, 
    averageRating, totalReviews
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;