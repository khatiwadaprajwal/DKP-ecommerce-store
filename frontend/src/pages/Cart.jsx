import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/Shopcontext";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

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

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to proceed to checkout!");
    } else {
      navigate("/placeOrder");
    }
  };
  

  return (
    <div className=" mx-auto min-h-250">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-xl">Your cart is empty.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="md:col-span-2  space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={`${item.productId}-${item.size}-${index}`}
                className="flex items-center bg-gray-200 shadow rounded-2xl p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.some(
                    (selected) =>
                      selected.productId === item.productId &&
                      selected.size === item.size
                  )}
                  onChange={() => toggleSelectItem(item.productId, item.size)}
                  className="mr-4"
                />
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-gray-600">Size: {item.size}</p>
                  <p className="text-red-500 font-bold">Rs. {item.price}</p>
                  <div className="flex items-center mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.size,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.size,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="ml-4 text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={() => removeFromCart(item.productId, item.size)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <div>
           {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-xl mb-4">
              <h2 className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-2">CART TOTALS</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Subtotal</span>
                <span>Rs. {totalPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Shipping Fee</span>
                <span>Rs. {delivery_fee}</span>
              </div>
              <div className="flex justify-between pt-3 font-bold text-lg">
                <span>Total</span>
                <span>Rs. {totalPrice + delivery_fee}</span>
              </div>
            </div>
          </div>
            
              <button
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
                className="w-full mt-4 bg-black text-white py-4 rounded cursor-pointer text-xl hover:bg-gray-800 disabled:bg-gray-400"
              >
                Proceed to Checkout
              </button>
         </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
