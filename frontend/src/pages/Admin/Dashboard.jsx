import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Fetch dashboard stats here
    // This is a mock implementation
    const fetchStats = async () => {
      // In production, replace with actual API call
      setStats({
        totalOrders: 258,
        totalProducts: 124,
        revenue: 45789.50,
        pendingOrders: 15
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500' },
    { title: 'Total Products', value: stats.totalProducts, color: 'bg-green-500' },
    { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'bg-yellow-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, color: 'bg-red-500' }
  ];

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
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">#ORD-5723</td>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Delivered</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">$245.99</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">#ORD-5722</td>
                  <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Processing</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">$129.50</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">#ORD-5721</td>
                  <td className="px-6 py-4 whitespace-nowrap">Robert Johnson</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">$189.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
              <div className="flex-1">
                <h4 className="font-medium">Men's Cotton T-Shirt</h4>
                <p className="text-gray-500 text-sm">124 sold</p>
              </div>
              <div className="text-lg font-semibold">$29.99</div>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
              <div className="flex-1">
                <h4 className="font-medium">Women's Casual Jeans</h4>
                <p className="text-gray-500 text-sm">98 sold</p>
              </div>
              <div className="text-lg font-semibold">$59.99</div>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
              <div className="flex-1">
                <h4 className="font-medium">Unisex Hoodie</h4>
                <p className="text-gray-500 text-sm">87 sold</p>
              </div>
              <div className="text-lg font-semibold">$49.99</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
