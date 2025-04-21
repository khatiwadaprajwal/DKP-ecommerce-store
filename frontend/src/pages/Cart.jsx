import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  Tag, 
  CreditCard
} from "lucide-react";
import axios from "axios";

const Cart = () => {
  const {
    cartData,
    fetchCartData,
    delivery_fee,
    navigate,
    token
  } = useContext(ShopContext);

  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset selected items when cart data changes
    setSelectedItems([]);
  }, [cartData]);

  // Toggle item selection
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Calculate total price of selected items
  const totalPrice = cartData
    .filter(item => selectedItems.includes(item.itemId))
    .reduce((total, item) => total + (item.price * item.quantity), 0);

  // Calculate final total with delivery fee
  const finalTotal = totalPrice + (totalPrice > 0 ? delivery_fee : 0);

  // Handle quantity update
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsLoading(true);
    try {
      await axios.put(
        "http://localhost:3001/v1/updatecart",
        { productId: itemId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh cart data
      await fetchCartData();
      toast.success("Cart updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  
  // Handle item removal
  const removeItem = async (itemId) => {
    setIsLoading(true);
    try {
      await axios.delete(
        `http://localhost:3001/v1/remove/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from selected items if selected
      if (selectedItems.includes(itemId)) {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
      }
      
      // Refresh cart data
      await fetchCartData();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to proceed to checkout!");
    } else {
      // Store selected items in localStorage or context before navigating
      localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
      navigate("/placeOrder");
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 md:mb-8 mt-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex items-center mb-2 sm:mb-0">
          <ShoppingCart className="mr-2 sm:mr-4 text-blue-600" size={24} />
          Shopping Cart
        </h1>
        <p className="text-sm sm:text-base text-gray-600">{cartData.length} Items</p>
      </div>

      {/* Empty Cart State */}
      {cartData.length === 0 ? (
        <div className="text-center py-8 sm:py-12 md:py-16 bg-gray-50 rounded-lg">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4 sm:mb-6" />
          <p className="text-lg sm:text-xl md:text-2xl text-gray-500 mb-4">Your cart is empty</p>
          <Link 
            to="/collection" 
            className="inline-block text-sm sm:text-base bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items Section */}
          <div className="md:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            {isLoading && (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-blue-600">Updating cart...</p>
              </div>
            )}
            
            {cartData.map((item) => (
              <div
                key={item.itemId}
                className="bg-white shadow-md rounded-xl p-4 sm:p-5 flex items-center 
                  transform transition hover:scale-[1.01] hover:shadow-lg"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.itemId)}
                  onChange={() => toggleSelectItem(item.itemId)}
                  className="mr-2 sm:mr-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 focus:ring-blue-500"
                />
                
                {/* Product Image */}
                <img
                  src={`http://localhost:3001/public/${item.image[0]}`}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg mr-3 sm:mr-6"
                />
                
                {/* Product Details */}
                <div className="flex-1">
                  <h2 className="text-sm sm:text-base md:text-xl font-semibold text-gray-900 truncate">
                    {item.name}
                  </h2>
                  
                  {/* Pricing */}
                  <div className="flex items-center mt-1 sm:mt-2">
                    <span className="text-xs sm:text-sm text-red-500 font-bold">
                      Rs. {item.price}
                    </span>
                  </div>
                  
                  {/* Quantity Control */}
                  <div className="flex items-center mt-2 sm:mt-4">
                    <button
                      className="p-1 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      disabled={isLoading || item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-2 sm:px-4 text-sm sm:text-lg font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      className="p-1 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      disabled={isLoading}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                  <button
                    className="text-red-400 hover:text-red-600 transition"
                    onClick={() => removeItem(item.itemId)}
                    disabled={isLoading}
                    title="Remove from Cart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary and Checkout */}
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
              {/* Summary Header */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 
                border-b-2 border-gray-200 pb-2 sm:pb-3 md:pb-4 mb-3 sm:mb-4 
                flex items-center">
                <Tag className="mr-2 text-blue-600" size={16} />
                Cart Summary
              </h2>
              
              {/* Summary Details */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Selected Items</span>
                  <span className="font-semibold">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs. {totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-semibold">Rs. {totalPrice > 0 ? delivery_fee : 0}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base md:text-xl font-bold 
                  border-t pt-2 sm:pt-3 md:pt-4">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
              
            {/* Checkout Button */}
            <button
              disabled={selectedItems.length === 0 || isLoading}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center 
                bg-blue-600 text-white 
                py-3 sm:py-4 
                rounded-lg 
                text-sm sm:text-base md:text-xl 
                hover:bg-blue-700 transition 
                disabled:bg-gray-400"
            >
              <CreditCard className="mr-2" size={16} />
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Cart;