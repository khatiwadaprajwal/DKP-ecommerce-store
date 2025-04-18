import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const productsResponse = await axios.get('http://localhost:3001/v1/products');
        // console.log(productsResponse.data.products)
        const products = productsResponse.data.products || [];
        

        
        // Fetch all orders
        const ordersResponse = await axios.get("http://localhost:3001/v1/getallorder", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const orders = ordersResponse.data.orders || [];
        
        // Calculate dashboard statistics
        calculateDashboardStats(products, orders);
        
        // Get recent orders (most recent 3)
        const sortedOrders = [...orders].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sortedOrders.slice(0, 5));
        
        // Calculate top selling products
        calculateTopSellingProducts(products);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
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
    const pendingOrders = orders.filter(order => 
      order.status === 'Pending' || order.status === 'Processing'
    ).length;
    
    // Calculate total revenue (from paid orders)
    const revenue = orders
      .filter(order => order.paymentStatus === 'Paid')
      .reduce((total, order) => total + order.totalAmount, 0);
    
    setStats({
      totalOrders,
      totalProducts,
      revenue,
      pendingOrders
    });
  };

  const calculateTopSellingProducts = (products) => {
    // Sort products by totalSold in descending order
    const sortedProducts = [...products]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5) // Get top 3 products
      .map(product => ({
        id: product._id,
        name: product.productName,
        sold: product.totalSold,
        price: product.price,
        images: product.images,
      }));
    
    setTopProducts(sortedProducts);
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
    { title: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500' },
    { title: 'Total Products', value: stats.totalProducts, color: 'bg-green-500' },
    { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'bg-yellow-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, color: 'bg-red-500' }
  ];

  // Helper function to get appropriate badge color based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-lg shadow-md p-6 text-white`}>
            <h3 className="text-lg font-medium mb-2">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">#{order._id.slice(-5).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.userId?.name || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 ${getStatusBadgeClass(order.status)} rounded-full text-xs`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">Rs.{order.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No recent orders found</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-xs text-gray-500">
                  {product.images && (
                                <img
                                  src={`http://localhost:3001/public/${product.images[0]}`}
                                  alt={product.productName}
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
                  <div className="text-lg font-semibold">Rs.{product.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No products found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;