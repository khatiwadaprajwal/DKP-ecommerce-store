import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, ArrowRightIcon, ClockIcon } from "lucide-react";
import { ShopContext } from "../../context/ShopContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { backend_url } = useContext(ShopContext);
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all products
        const productsResponse = await axios.get(`${backend_url}/v1/products`);
        const products = productsResponse.data.products || [];

        // Fetch all orders
        const ordersResponse = await axios.get(
          `${backend_url}/v1/getallorder`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orders = ordersResponse.data.orders || [];

        // Calculate dashboard statistics
        calculateDashboardStats(products, orders);

        // Get recent orders (most recent 5)
        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sortedOrders.slice(0, 5));

        // Calculate top selling products
        calculateTopSellingProducts(products);

        // Find low stock products
        identifyLowStockProducts(products);

        // Get new products
        getNewProducts(products);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateDashboardStats = (products, orders) => {
    // Calculate total products
    const totalProducts = products.length;

    // Calculate total orders
    const totalOrders = orders.length;

    // Calculate pending orders
    const pendingOrders = orders.filter(
      (order) => order.status === "Pending" || order.status === "Processing"
    ).length;

    // Calculate total revenue (from paid orders)
    const revenue = orders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((total, order) => total + order.totalAmount, 0);

    setStats({
      totalOrders,
      totalProducts,
      revenue,
      pendingOrders,
    });
  };

  const calculateTopSellingProducts = (products) => {
    // Sort products by totalSold in descending order
    const sortedProducts = [...products]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5) // Get top 5 products
      .map((product) => ({
        id: product._id,
        name: product.productName,
        sold: product.totalSold,
        price: product.price,
        images: product.images,
      }));

    setTopProducts(sortedProducts);
  };

  const identifyLowStockProducts = (products) => {
    // Define low stock threshold as less than 10 units
    const lowStockThreshold = 10;

    // Filter products with low stock
    const productsWithLowStock = products
      .filter(
        (product) =>
          product.totalQuantity > 0 && product.totalQuantity < lowStockThreshold
      )
      .sort((a, b) => a.totalQuantity - b.totalQuantity) // Sort by lowest stock first
      .slice(0, 5) // Get top 5 low stock products
      .map((product) => ({
        id: product._id,
        name: product.productName,
        quantity: product.totalQuantity,
        category: product.category,
        images: product.images,
        variants: product.variants || [],
      }));

    setLowStockProducts(productsWithLowStock);
  };

  const getNewProducts = (products) => {
    // Sort products by createdAt in descending order (newest first)
    const recentlyAddedProducts = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5) // Get 5 newest products
      .map((product) => ({
        id: product._id,
        name: product.productName,
        price: product.price,
        category: product.category,
        images: product.images,
        createdAt: new Date(product.createdAt),
      }));

    setNewProducts(recentlyAddedProducts);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      color: "bg-blue-500",
      path: "/admin/ordersList",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      color: "bg-green-500",
      path: "/admin/listProducts",
    },
    {
      title: "Total Revenue",
      value: `Rs.${stats.revenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      color: "bg-yellow-500",
      path: "/admin",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      color: "bg-red-500",
      path: "/admin/ordersList",
    },
  ];

  // Helper function to get appropriate badge color based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get appropriate badge color based on stock level
  const getStockBadgeClass = (quantity) => {
    if (quantity <= 3) return "bg-red-100 text-red-800";
    if (quantity <= 7) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Formal":
        return "bg-blue-100 text-blue-800";
      case "Casual":
        return "bg-green-100 text-green-800";
      case "Ethnic":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate how many days ago a product was added
  const getDaysAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            to={`${card.path}`}
            key={index}
            className={`
      ${card.color} 
      rounded-lg 
      shadow-md 
      p-6 
      text-white 
      transform 
      transition-all 
      duration-300 
      hover:scale-105 
      hover:shadow-lg 
      hover:brightness-110
    `}
          >
            <h3 className="text-lg font-medium mb-2">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow-md p-6 ">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recent Orders</h3>
            <Link
              to="/admin/ordersList"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              View All Orders
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        #{order._id.slice(-5).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.userId?.name || "Anonymous"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 ${getStatusBadgeClass(
                            order.status
                          )} rounded-full text-xs`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Rs.{order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No recent orders found</p>
          )}
        </div>

        {/* Top Selling Products Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Top Selling Products</h3>
            <Link
              to="/admin/listproducts"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              View All Products
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-xs text-gray-500">
                    {product.images && (
                      <img
                        src={`${backend_url}/public/${product.images[0]}`}
                        alt={product.name}
                        className="h-14 w-14 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-gray-500 text-sm">{product.sold} sold</p>
                  </div>
                  <div className="text-lg font-semibold">
                    Rs.{product.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No products found</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Low Stock Alert</h3>
            <Link
              to="/admin/listproducts"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              Manage Inventory
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-md mr-3">
                            {product.images && product.images.length > 0 && (
                              <img
                                src={`${backend_url}/public/${product.images[0]}`}
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/placeholder.jpg";
                                }}
                              />
                            )}
                          </div>
                          <div className="truncate max-w-xs">
                            <div className="font-medium text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: #{product.id.substring(product.id.length - 6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getCategoryBadgeClass(
                            product.category
                          )}`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStockBadgeClass(
                            product.quantity
                          )}`}
                        >
                          {product.quantity} units left
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/products?id=${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600">All products are well-stocked!</p>
            </div>
          )}
        </div>

        {/* New Products Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recently Added Products</h3>
            <Link
              to="/admin/addproduct"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              Add New Product
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {newProducts.length > 0 ? (
            <div className="space-y-4">
              {newProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-xs text-gray-500">
                    {product.images && product.images.length > 0 && (
                      <img
                        src={`${backend_url}/public/${product.images[0]}`}
                        alt={product.name}
                        className="h-14 w-14 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs mr-2 ${getCategoryBadgeClass(
                          product.category
                        )}`}
                      >
                        {product.category}
                      </span>
                      <ClockIcon className="h-3 w-3 mr-1" />
                      <span>{getDaysAgo(product.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    Rs.{product.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No new products added recently
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
