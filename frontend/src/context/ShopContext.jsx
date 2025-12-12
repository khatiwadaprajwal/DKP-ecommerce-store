import React, { useState, createContext, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const ShopContext = createContext();

const ShopcontextProvider = ({ children }) => {
  const currency = "Rs";
  const delivery_fee = 0;
  const backend_url = "http://localhost:3001";
  
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [cartData, setCartData] = useState([]);
  const [products, setProducts] = useState([]);
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

  const logout = () => {
    setToken("");
    setCartData([]);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          throw new Error("Token expired");
        }
        localStorage.setItem("user", JSON.stringify(decoded));
        setUser(decoded);
      } catch (error) {
        console.error("Invalid or expired token:", error);
        logout(); 
      }
    } else {
      setUser(null);
    }
  }, [token]);

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

  const fetchCartData = async () => {
    if (!token) {
      setCartData([]);
      return;
    }
  
    try {
      const response = await axios.get(`${backend_url}/v1/getcart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        if (response.data.cart && response.data.cart.cartItems) {
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
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response && error.response.status === 401) {
        setCartData([]);
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchCartData();
    }
  }, [token]);

  const addToCart = async (productId, color, size, quantity = 1) => {
    if (!token) {
      toast.error("Login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${backend_url}/v1/add`,
        { productId, color, size, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Product added to cart");
        await fetchCartData();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.msg || "Missing required product information");
      } else if (error.response?.status === 404) {
        toast.error("Product not found");
      } else {
        toast.error("Failed to add product to cart");
      }
    }
  };

  const getCartCount = () => {
    return cartData.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ FIXED: PayPal Popup with proper cart refresh on closure
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
      toast.error("Popup blocked! Please allow popups and try again.");
      return;
    }
  
    // ✅ Monitor popup closure and refresh cart
    const interval = setInterval(() => {
      if (paypalWindow.closed) {
        clearInterval(interval);
        
        // ✅ Refresh cart data after popup closes
        fetchCartData();
        
        // ✅ Clear selected items from localStorage
        localStorage.removeItem("selectedCartItems");
        
        // Navigate to orders page
        navigate("/order");
      }
    }, 1000);
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

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backend_url}/v1/products`);
      if (response.status === 200) {
        setProducts(response.data.products);
        setFilterProducts(response.data.products);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products");
    }
  };

  const handleSearchFunction = (query) => {
    setSearchQuery(query);
    if (location.pathname !== "/collection") navigate("/collection");
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [gender, category, sizes, colors, priceRange, searchQuery, products]);

  const value = useMemo(() => ({
    products, currency, delivery_fee, backend_url, token, setToken,
    search, setSearch, showSearch, setShowSearch, addToCart,
    cartData, setCartData, fetchCartData, getCartCount, navigate,
    gender, setGender, toggleGender, category, sizes, setCategory, setSizes,
    toggleCategory, toggleSizes, colors, setColors, toggleColor,
    priceRange, setPriceRange, applyFilter, filterProducts, setFilterProducts,
    resetGenderFilter, resetCategoryFilter, resetSizeFilter, resetColorFilter,
    resetPriceFilter, resetAllFilters, logout, user, setUser,
    averageRating, setAverageRating, totalReviews, setTotalReviews,
    openPayPalPopup,
    searchQuery, setSearchQuery, handleSearchFunction, resetSearchQuery,
  }), [
    products, token, search, showSearch, cartData, gender, category, sizes, colors, 
    priceRange, filterProducts, searchQuery, user, averageRating, totalReviews
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopcontextProvider;