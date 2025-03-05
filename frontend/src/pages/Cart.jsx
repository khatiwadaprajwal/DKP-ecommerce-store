import React, { useContext, useState, useMemo } from "react";
import { ShopContext } from "../context/Shopcontext";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Heart, 
  Percent, 
  Tag, 
  CreditCard 
} from "lucide-react";

const Cart = () => {
  const {
    cartData,
    removeFromCart,
    updateCartQuantity,
    delivery_fee,
    navigate,
    selectedItems,
    toggleSelectItem,
    totalPrice,
  } = useContext(ShopContext);

  // State for managing promo code
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Convert cartData into an array with additional details
  const cartItems = useMemo(() => 
    Object.entries(cartData).flatMap(([productId, variants]) =>
      variants.map((variant) => ({
        productId,
        size: variant.size,
        quantity: variant.quantity,
        name: variant.name || "Unknown Product",
        price: variant.price || 0,
        image: variant.image || "/placeholder.jpg",
        originalPrice: variant.originalPrice || variant.price,
      }))
    ), [cartData]
  );

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to proceed to checkout!");
    } else {
      navigate("/placeOrder");
    }
  };


  // Calculate total with discount
  const finalTotal = totalPrice + delivery_fee - discount;

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 md:mb-8 mt-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex items-center mb-2 sm:mb-0">
          <ShoppingCart className="mr-2 sm:mr-4 text-blue-600" size={24} sm:size={32} md:size={40} />
          Shopping Cart
        </h1>
        <p className="text-sm sm:text-base text-gray-600">{cartItems.length} Items</p>
      </div>

      {/* Empty Cart State */}
      {cartItems.length === 0 ? (
        <div className="text-center py-8 sm:py-12 md:py-16 bg-gray-50 rounded-lg">
          <ShoppingCart size={64} sm:size={80} md:size={100} className="mx-auto text-gray-300 mb-4 sm:mb-6" />
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
            {cartItems.map((item, index) => (
              <div
                key={`${item.productId}-${item.size}-${index}`}
                className="bg-white shadow-md rounded-xl p-4 sm:p-5 flex items-center 
                  transform transition hover:scale-[1.01] hover:shadow-lg"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.some(
                    (selected) =>
                      selected.productId === item.productId &&
                      selected.size === item.size
                  )}
                  onChange={() => toggleSelectItem(item.productId, item.size)}
                  className="mr-2 sm:mr-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 focus:ring-blue-500"
                />
                
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg mr-3 sm:mr-6"
                />
                
                {/* Product Details */}
                <div className="flex-1">
                  <h2 className="text-sm sm:text-base md:text-xl font-semibold text-gray-900 truncate">
                    {item.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">Size: {item.size}</p>
                  
                  {/* Pricing */}
                  <div className="flex items-center mt-1 sm:mt-2">
                    {item.originalPrice !== item.price && (
                      <span className="text-xs line-through text-gray-400 mr-2">
                        Rs. {item.originalPrice}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm text-red-500 font-bold">
                      Rs. {item.price}
                    </span>
                  </div>
                  
                  {/* Quantity Control */}
                  <div className="flex items-center mt-2 sm:mt-4">
                    <button
                      className="p-1 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.size,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      <Minus size={16} sm:size={20} />
                    </button>
                    <span className="px-2 sm:px-4 text-sm sm:text-lg font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      className="p-1 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.size,
                          item.quantity + 1
                        )
                      }
                    >
                      <Plus size={16} sm:size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                  <button
                    className="text-red-400 hover:text-red-600 transition"
                    onClick={() => removeFromCart(item.productId, item.size)}
                    title="Remove from Cart"
                  >
                    <Trash2 size={16} sm:size={24} />
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
                <Tag className="mr-2 text-blue-600" size={16} sm:size={20} md:size={24} />
                Cart Summary
              </h2>
              
              {/* Summary Details */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs. {totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-semibold">Rs. {delivery_fee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base md:text-xl font-bold 
                  border-t pt-2 sm:pt-3 md:pt-4">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
              
            {/* Checkout Button */}
            <button
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center 
                bg-blue-600 text-white 
                py-3 sm:py-4 
                rounded-lg 
                text-sm sm:text-base md:text-xl 
                hover:bg-blue-700 transition 
                disabled:bg-gray-400"
            >
              <CreditCard className="mr-2" size={16} sm:size={24} />
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