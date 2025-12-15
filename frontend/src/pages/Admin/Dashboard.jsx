import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, ArrowRightIcon, ClockIcon, Download, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../../config/api"; 
// ✅ 1. Import Auth Context
import { useAuth } from "../../context/AuthProvider"; 

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
  
  const [qrOrder, setQrOrder] = useState(null);
  const qrRef = useRef(null);

  // ✅ 2. Get the Token from Auth Context
  const { token } = useAuth(); 

  // ✅ 3. Use Production URL correctly
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://dkp-ecommerce-store-backend.onrender.com";

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/150";
    if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith("/") ? imgPath.slice(1) : imgPath;
    return `${BACKEND_URL}/public/${cleanPath}`;
  };

  // ✅ 4. Updated useEffect to wait for Token
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch Products (Public or Protected)
        const productsResponse = await api.get("/v1/products");
        const products = productsResponse.data.products || [];

        // Fetch Orders (Protected - Needs Token)
        // We only fetch orders if we have a token, otherwise empty array to prevent crash
        let orders = [];
        if (token) {
            try {
                const ordersResponse = await api.get("/v1/getallorder");
                orders = ordersResponse.data.orders || [];
            } catch (err) {
                console.warn("Could not fetch orders (likely auth issue or empty)", err);
            }
        }

        calculateDashboardStats(products, orders);
        
        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sortedOrders.slice(0, 5));

        calculateTopSellingProducts(products);
        identifyLowStockProducts(products);
        getNewProducts(products);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    // ✅ 5. Dependency Array: Run when 'token' changes (loads)
    if (token) {
        fetchDashboardData();
    }
  }, [token]); 

  const calculateDashboardStats = (products, orders) => {
    const pendingOrders = orders.filter(
      (order) => order.status === "Pending" || order.status === "Processing"
    ).length;

    const revenue = orders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((total, order) => total + (order.totalAmount || 0), 0);

    setStats({
      totalOrders: orders.length,
      totalProducts: products.length,
      revenue,
      pendingOrders,
    });
  };

  const calculateTopSellingProducts = (products) => {
    const sorted = [...products]
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 5)
      .map((product) => ({
        id: product._id,
        name: product.productName,
        sold: product.totalSold || 0,
        price: product.price,
        images: product.images || product.image,
      }));
    setTopProducts(sorted);
  };

  const identifyLowStockProducts = (products) => {
    const lowStockThreshold = 10;
    const lowStock = products
      .filter((p) => p.totalQuantity !== undefined && p.totalQuantity < lowStockThreshold)
      .sort((a, b) => a.totalQuantity - b.totalQuantity)
      .slice(0, 5)
      .map((p) => ({
        id: p._id,
        name: p.productName,
        quantity: p.totalQuantity,
        category: p.category,
        images: p.images || p.image,
      }));
    setLowStockProducts(lowStock);
  };

  const getNewProducts = (products) => {
    const recent = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((p) => ({
        id: p._id,
        name: p.productName,
        price: p.price,
        category: p.category,
        images: p.images || p.image,
        createdAt: new Date(p.createdAt),
      }));
    setNewProducts(recent);
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qr-${qrOrder._id}.png`;
        link.href = pngFile;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + window.btoa(svgData);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Processing":
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStockBadgeClass = (qty) => {
    if (qty <= 3) return "bg-red-100 text-red-800";
    if (qty <= 7) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getCategoryBadgeClass = (cat) => {
    if (cat === "Formal") return "bg-blue-100 text-blue-800";
    if (cat === "Casual") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getDaysAgo = (date) => {
    const today = new Date();
    const created = new Date(date);
    const diffTime = Math.abs(today - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div></div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>

      {/* STAT CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Orders", value: stats.totalOrders, color: "bg-blue-500", path: "/admin/ordersList" },
          { title: "Total Products", value: stats.totalProducts, color: "bg-green-500", path: "/admin/listProducts" },
          { title: "Total Revenue", value: `Rs.${stats.revenue.toLocaleString()}`, color: "bg-yellow-500", path: "/admin" },
          { title: "Pending Orders", value: stats.pendingOrders, color: "bg-red-500", path: "/admin/ordersList" },
        ].map((card, idx) => (
          <Link key={idx} to={card.path} className={`${card.color} transform rounded-lg p-6 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
            <h3 className="mb-2 text-lg font-medium">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recent Orders</h3>
            <Link to="/admin/ordersList" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 text-sm">#{order._id.slice(-5).toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">Rs.{order.totalAmount}</td>
                    <td className="px-4 py-3"><button onClick={() => setQrOrder(order)} className="text-blue-600"><EyeIcon size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Top Selling</h3>
            <Link to="/admin/listproducts" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.map((p) => {
              const img = Array.isArray(p.images) ? p.images[0] : p.images;
              return (
                <div key={p.id} className="flex items-center">
                  <div className="mr-4 h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <img src={getImageUrl(img)} alt={p.name} className="h-full w-full object-cover" onError={(e) => e.target.src="https://via.placeholder.com/150"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium">{p.name}</h4>
                    <p className="text-sm text-gray-500">{p.sold} sold</p>
                  </div>
                  <div className="font-semibold">Rs.{p.price}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Low Stock Alert</h3>
            <Link to="/admin/listproducts" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              Manage <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockProducts.map((p) => {
                  const img = Array.isArray(p.images) ? p.images[0] : p.images;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img src={getImageUrl(img)} alt={p.name} className="mr-3 h-8 w-8 rounded object-cover" onError={(e)=>e.target.src="https://via.placeholder.com/150"} />
                          <span className="truncate text-sm font-medium max-w-[150px] block">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${getStockBadgeClass(p.quantity)}`}>{p.quantity} left</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/products?id=${p.id}`} className="text-indigo-600 hover:text-indigo-900"><EyeIcon size={18} /></Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recently Added</h3>
            <Link to="/admin/addproduct" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              Add New <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {newProducts.length > 0 ? (
              newProducts.map((p) => {
                const img = Array.isArray(p.images) ? p.images[0] : p.images;
                return (
                  <div key={p.id} className="flex items-center">
                    <div className="mr-4 h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <img src={getImageUrl(img)} alt={p.name} className="h-full w-full object-cover" onError={(e)=>e.target.src="https://via.placeholder.com/150"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium">{p.name}</h4>
                      <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className={`mr-2 rounded-full px-2 py-1 text-xs ${getCategoryBadgeClass(p.category)}`}>{p.category}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="mr-1 h-3 w-3" />
                          <span>{getDaysAgo(p.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold">Rs.{p.price}</div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No new products.</p>
            )}
          </div>
        </div>
      </div>

      {/* QR MODAL */}
      {qrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6">
            <button onClick={() => setQrOrder(null)} className="absolute right-2 top-2 text-xl font-bold text-gray-500 hover:text-black">&times;</button>
            <h3 className="mb-4 text-center text-xl font-bold">Order #{qrOrder._id.slice(-5).toUpperCase()}</h3>
            <div ref={qrRef} className="flex justify-center bg-white p-2">
              <QRCodeSVG value={JSON.stringify({ id: qrOrder._id, amt: qrOrder.totalAmount, status: qrOrder.status })} size={200} level="H" />
            </div>
            <button onClick={downloadQRCode} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700">
              <Download size={18} /> Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;