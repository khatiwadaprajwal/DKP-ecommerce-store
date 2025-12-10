import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  DollarSign,
  ArrowLeft,
  MapIcon,
} from "lucide-react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Location picker component
const LocationPicker = ({ onLocationSelected }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelected(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const PlaceOrder = () => {
  const { cartData, token, delivery_fee, fetchCartData, backend_url } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  // Location state with default coordinates
  const [location, setLocation] = useState({
    lat: 27.7172, // Default to Kathmandu, Nepal
    lng: 85.324,
  });

  // State to track if location has been selected
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Load selected items on component mount
    loadSelectedItems();
  }, []);

  // Separate function to load selected items
  const loadSelectedItems = () => {
    const storedItems = localStorage.getItem("selectedCartItems");

    if (!storedItems) {
      toast.error("No items selected for checkout");
      navigate("/cart");
      return;
    }

    try {
      const parsedItems = JSON.parse(storedItems);

      if (!parsedItems || !Array.isArray(parsedItems) || parsedItems.length === 0) {
        toast.error("Invalid selected items data");
        navigate("/cart");
        return;
      }

      setSelectedItems(parsedItems);

      const matchSelectedProducts = () => {
        return cartData.filter((cartItem) =>
          parsedItems.some(
            (selectedItem) =>
              selectedItem.productId === cartItem.itemId &&
              selectedItem.color === (cartItem.color || "default") &&
              selectedItem.size === (cartItem.size || "default")
          )
        );
      };

      const productsToOrder = matchSelectedProducts();

      if (productsToOrder.length === 0 && cartData.length > 0) {
        toast.error("Selected products not found in cart");
        navigate("/cart");
        return;
      }

      setSelectedProducts(productsToOrder);
    } catch (error) {
      console.error("Error parsing selected items:", error);
      toast.error("Something went wrong. Please try again.");
      navigate("/cart");
    }
  };

  useEffect(() => {
    if (cartData.length > 0 && selectedItems.length > 0) {
      const updatedProducts = cartData.filter((cartItem) =>
        selectedItems.some(
          (selectedItem) =>
            selectedItem.productId === cartItem.itemId &&
            selectedItem.color === (cartItem.color || "default") &&
            selectedItem.size === (cartItem.size || "default")
        )
      );

      if (updatedProducts.length > 0) {
        setSelectedProducts(updatedProducts);
      }
    }
  }, [cartData, selectedItems]);

  const subtotal = selectedProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const total = subtotal + delivery_fee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelected = (latlng) => {
    setLocation({
      lat: latlng.lat,
      lng: latlng.lng,
    });
    setLocationSelected(true);
    toast.success("Location selected successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        toast.error(
          `Please enter your ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return;
      }
    }

    if (!locationSelected) {
      toast.error("Please select your location on the map");
      return;
    }

    setIsLoading(true);

    try {
      const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.phone}`;

      const productsForAPI = selectedProducts.map((item) => ({
        productId: item.itemId,
        quantity: item.quantity,
        color: item.color || "default",
        size: item.size || "default",
      }));

      const orderData = {
        selectedProducts: productsForAPI,
        address: formattedAddress,
        location,
        paymentMethod, // "Cash" or "Khalti"
      };

      const response = await axios.post(
        `${backend_url}/v1/placeorder`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem("selectedCartItems");

      // 🟣 Check for Khalti URL
      if (response.data.khaltiUrl) {
        window.location.href = response.data.khaltiUrl;
      } else {
        // Standard Success (COD)
        fetchCartData();
        toast.success("Order placed successfully!");
        navigate("/order", { state: { order: response.data.order } });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/cart")}
        className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Cart
      </button>

      <h2 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Information */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 text-blue-600" />
              Shipping Information
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {/* ... (Other inputs like Address, City, State, Zip, Phone remain same) ... */}
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input type="text" name="zipCode" value={shippingInfo.zipCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              {/* Location Map */}
              <div className="mt-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MapIcon className="mr-2 text-blue-600" />
                  Select Your Location
                </h3>

                <div className="border rounded-lg overflow-hidden" style={{ height: "300px" }}>
                  <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                    {locationSelected && <Marker position={[location.lat, location.lng]} />}
                  </MapContainer>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {locationSelected ? `Selected: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Click map to select location"}
                </div>
              </div>

              {/* Payment Method Section */}
              <h2 className="text-xl font-semibold mb-4 mt-6 flex items-center">
                <CreditCard className="mr-2 text-blue-600" />
                Payment Method
              </h2>

              <div className="flex flex-col space-y-3 mb-6">
                {/* COD Option */}
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === "Cash" ? "border-gray-500 bg-gray-50" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className="mr-2"
                  />
                  <DollarSign size={20} className="mr-2 text-green-600" />
                  <span>Cash on Delivery</span>
                </label>

                {/* Khalti Option (Replaced PayPal) */}
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-purple-50 ${paymentMethod === "Khalti" ? "border-[#5C2D91] bg-purple-50" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Khalti"
                    checked={paymentMethod === "Khalti"}
                    onChange={() => setPaymentMethod("Khalti")}
                    className="mr-2 accent-[#5C2D91]"
                  />
                  {/* Simple text in Khalti color */}
                  <span className="ml-2 text-lg font-bold text-[#5C2D91]">Pay with Khalti</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || selectedProducts.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : (paymentMethod === "Khalti" ? "Pay with Khalti" : "Place Order")}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2 text-blue-600" />
              Order Summary
            </h2>
            {/* ... Summary Logic remains same ... */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Items ({selectedProducts.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedProducts.map((item) => (
                  <div key={item.itemId + (item.color || "") + (item.size || "")} className="flex items-center">
                    <img src={`${backend_url}/public/${item.image[0]}`} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Qty: {item.quantity} {item.color && `(${item.color})`} {item.size && `(${item.size})`}</span>
                        <span>Rs. {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="flex items-center"><Truck size={14} className="mr-1" />Shipping</span><span>Rs. {delivery_fee.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;