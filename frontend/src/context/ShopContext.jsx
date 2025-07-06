import React, { useState, createContext, useEffect, useCallback } from "react";
import {  toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import debounce from 'lodash/debounce';

export const ShopContext = createContext();

const ShopcontextProvider = ({ children }) => {
  const currency = "Rs";
  const delivery_fee = 0;
  const backend_url = "http://localhost:3001";
  const [token, setToken] = useState(localStorage.getItem("token"));
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
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filterProducts, setFilterProducts] = useState([]);
  // Add a new state for search query
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("user", JSON.stringify(decoded));
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (location.pathname === "/") {
      resetAllFilters(); // Reset all filters if on home page
    }
  }, [location.pathname]);

  

  // Reset all filters
  const resetAllFilters = () => {
    setGender([]);
    setCategory([]);
    setSizes([]);
    setColors([]);
    setPriceRange([0, 50000]);
    setSearchQuery("");
    setFilterProducts([]);
  };

  // Fetch Cart Data from API
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
        // Check if cart exists and has items
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
      setCartData([]);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [token]);

  // Add to Cart
const addToCart = async (productId, color, size, quantity = 1) => {
  if (!token) {
    toast.error("Login to add items to cart");
    return;
  }

  try {
    const response = await axios.post(
      `${backend_url}/v1/add`,
      { 
        productId, 
        color, 
        size, 
        quantity 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 201) {
      toast.success("Product added to cart");
      fetchCartData(); // Fetch the updated cart after adding the item
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

  // Get Cart Count
  const getCartCount = () => {
    return cartData.reduce((total, item) => total + item.quantity, 0);
  };

  // Toggle gender filter
  const toggleGender = (value) => {
    if (value === "All") {
      setGender([]);
    } else {
      setGender((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    }
  };

  // Toggle category filter
  const toggleCategory = (value) => {
    if (value === "All") {
      setCategory([]);
    } else {
      setCategory((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    }
  };

  // Toggle size filter
  const toggleSizes = (value) => {
    setSizes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Toggle color filter
  const toggleColor = (value) => {
    setColors((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Apply filter based on all filter criteria
  const applyFilter = () => {
    // Only apply filters if products have been loaded
    if (products.length === 0) {
      setFilterProducts([]);
      return;
    }

    let productsCopy = products.slice();

    // Filter by search query first
    if (searchQuery && searchQuery.trim() !== "") {
      productsCopy = productsCopy.filter((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by gender
    if (gender.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        item.gender && gender.includes(item.gender)
      );
    }

    // Filter by category
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        item.category && category.includes(item.category)
      );
    }

    // Filter by size
    if (sizes.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        item.variants && item.variants.some(v => sizes.includes(v.size))
      );
    }

    // Filter by color
    if (colors.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        item.variants && item.variants.some(v => colors.includes(v.color))
      );
    }

    // Filter by price range
    productsCopy = productsCopy.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    setFilterProducts(productsCopy);
  };

  // Reset individual filters
  const resetGenderFilter = () => setGender([]);
  const resetCategoryFilter = () => setCategory([]);
  const resetSizeFilter = () => setSizes([]);
  const resetColorFilter = () => setColors([]);
  const resetPriceFilter = () => setPriceRange([0, 10000]);
  const resetSearchQuery = () => setSearchQuery("");

  const logout = () => {
    setToken("");
    setCartData([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("User logged out");
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backend_url}/v1/products`);

      if (response.status === 200) {
        const fetchedProducts = response.data.products;
        setProducts(fetchedProducts);
        // Set filterProducts to all fetched products initially
        setFilterProducts(fetchedProducts);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setFilterProducts(products);
        return;
      }

      try {
        const response = await axios.get(`${backend_url}/v1/products/search?query=${encodeURIComponent(query)}`);
        if (response.status === 200) {
          setFilterProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        toast.error("Error searching products");
        setFilterProducts(products);
      }
    }, 500),
    [products]
  );

  // Handle search function
  const handleSearchFunction = (query) => {
    setSearchQuery(query);
    debouncedSearch(query);
    
    // Navigate to the collection page if not already there
    if (location.pathname !== "/collection") {
      navigate("/collection");
    }
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  //Paypal Popup for the payment 
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
    
      // Check if the window was successfully opened
      if (!paypalWindow) {
        toast.error("Popup blocked! Please allow popups and try again.");
        return;
      }
    
      // Polling to check if the window is closed
      const interval = setInterval(() => {
        if (paypalWindow.closed) {
          clearInterval(interval);
          toast.success("Payment processing completed!");
    
          // Redirect to the order page
          navigate("/order");
        }
      }, 1000);
    };

  useEffect(() => {
    getProductsData();
  }, []);

  // This effect now correctly applies filters AFTER products are loaded
  useEffect(() => {
    applyFilter();
  }, [gender, category, sizes, colors, priceRange, searchQuery, products]);

  // console.log("cartdata",cartData);

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
    fetchCartData,
    getCartCount,
    navigate,
    gender,
    setGender,
    toggleGender,
    category,
    sizes,
    setCategory,
    setSizes,
    toggleCategory,
    toggleSizes,
    colors,
    setColors,
    toggleColor,
    priceRange,
    setPriceRange,
    applyFilter,
    filterProducts,
    setFilterProducts,
    resetGenderFilter,
    resetCategoryFilter,
    resetSizeFilter,
    resetColorFilter,
    resetPriceFilter,
    resetAllFilters,
    logout,
    user,
    setUser,
    averageRating,
    setAverageRating,
    totalReviews,
    setTotalReviews,
    openPayPalPopup,
    searchQuery,
    setSearchQuery,
    handleSearchFunction,
    resetSearchQuery,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopcontextProvider;