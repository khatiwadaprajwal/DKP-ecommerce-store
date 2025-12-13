import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import api from "../config/api.js";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { address as addressData } from "../assets/address.js";

// Fix for Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationPicker = ({ onLocationSelected }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({ 
      click(e) { 
          setPosition(e.latlng); 
          onLocationSelected(e.latlng); 
      } 
  });
  return position === null ? null : <Marker position={position} />;
};

const PlaceOrder = () => {
  const { cartData, delivery_fee, fetchCartData } = useContext(ShopContext);
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  
  // Shipping & Address State
  const [shippingInfo, setShippingInfo] = useState({ 
    fullName: "", 
    streetAddress: "", 
    city: "", 
    phone: "" 
  });
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.324 });
  const [locationSelected, setLocationSelected] = useState(false);

  // Initialize
  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }));
    }
    loadSelectedItems();
  }, []);

  // Filter Cart Data based on selection
  useEffect(() => {
    if (cartData.length && selectedItems.length) {
      const matched = cartData.filter(c => 
        selectedItems.some(s => s.productId === c.itemId && s.color === (c.color || "default") && s.size === (c.size || "default"))
      );
      if (matched.length) setSelectedProducts(matched);
    }
  }, [cartData, selectedItems]);

  const loadSelectedItems = () => {
    const stored = localStorage.getItem("selectedCartItems");
    if (!stored) { navigate("/cart"); return; }
    try {
      setSelectedItems(JSON.parse(stored));
    } catch(e) { console.error(e); }
  };

  // Address Handlers
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict("");
    setSelectedMunicipality("");
    setAvailableMunicipalities([]);
    if (provinceId) {
      const province = addressData.find(p => p.id.toString() === provinceId);
      if (province?.districts) setAvailableDistricts(Object.values(province.districts));
    } else {
      setAvailableDistricts([]);
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedMunicipality("");
    if (districtId) {
      const district = availableDistricts.find(d => d.id.toString() === districtId);
      if (district?.municipalities) setAvailableMunicipalities(Object.values(district.municipalities));
    } else {
      setAvailableMunicipalities([]);
    }
  };

  const handleInputChange = (e) => setShippingInfo(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleLocationSelected = (l) => { setLocation({ lat: l.lat, lng: l.lng }); setLocationSelected(true); toast.info("Location pinned!"); };

  const total = selectedProducts.reduce((sum, i) => sum + i.price * i.quantity, 0) + delivery_fee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    for (const v of Object.values(shippingInfo)) {
      if (!v.trim()) return toast.error("Please fill all shipping fields");
    }
    if (!selectedProvince || !selectedDistrict || !selectedMunicipality) return toast.error("Please select complete address details");
    if (!locationSelected) return toast.error("Please pin your location on the map");

    setIsLoading(true);

    try {
      // 2. Prepare Data
      const productsForAPI = selectedProducts.map(item => ({ 
        productId: item.itemId, 
        quantity: item.quantity, 
        color: item.color || "default", 
        size: item.size || "default" 
      }));
      
      const province = addressData.find(p => p.id.toString() === selectedProvince);
      const district = availableDistricts.find(d => d.id.toString() === selectedDistrict);
      const municipality = availableMunicipalities.find(m => m.id.toString() === selectedMunicipality);
      
      const fullAddress = `${shippingInfo.streetAddress}, ${municipality?.name}, ${district?.name}, ${province?.name}`;
      
      const payload = {
        selectedProducts: productsForAPI,
        address: fullAddress, // Formatted address
        city: shippingInfo.city,
        phone: shippingInfo.phone,
        fullName: shippingInfo.fullName,
        location, 
        paymentMethod,
        // Send return URL to backend so it knows where to redirect after payment
        returnUrl: `${window.location.origin}/payment/verify`,
        cancelUrl: `${window.location.origin}/payment/verify?status=cancelled`
      };

      // 3. API Call
      const response = await api.post(`/v1/placeorder`, payload);

      // 4. Handle Response
      if (response.data.khaltiUrl) {
          // Khalti Redirect
          window.location.href = response.data.khaltiUrl;
      } 
      else if (response.data.approvalUrl) {
          // PayPal Redirect
          window.location.href = response.data.approvalUrl;
      } 
      else {
          // COD or Direct Success
          localStorage.removeItem("selectedCartItems");
          await fetchCartData(); // Refresh cart
          toast.success("Order placed successfully!");
          navigate("/order");
      }

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Order placement failed";
      toast.error(msg);
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate("/cart")} className="flex items-center text-blue-600 mb-4 hover:underline">
        <ArrowLeft size={16} className="mr-1" />Back to Cart
      </button>
      
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
           <form id="checkout-form" onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-xl space-y-6">
             
             {/* Section: Personal Info */}
             <div>
               <h3 className="font-semibold text-lg mb-3 border-b pb-2">Contact Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input name="fullName" placeholder="Full Name *" value={shippingInfo.fullName} onChange={handleInputChange} className="input-field border p-3 rounded w-full" required />
                 <input name="phone" placeholder="Phone Number *" value={shippingInfo.phone} onChange={handleInputChange} className="input-field border p-3 rounded w-full" required />
               </div>
             </div>
             
             {/* Section: Address */}
             <div>
               <h3 className="font-semibold text-lg mb-3 border-b pb-2">Delivery Address</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <select value={selectedProvince} onChange={handleProvinceChange} className="border p-3 rounded w-full" required>
                   <option value="">Select Province *</option>
                   {addressData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 
                 <select value={selectedDistrict} onChange={handleDistrictChange} className="border p-3 rounded w-full" required disabled={!selectedProvince}>
                   <option value="">Select District *</option>
                   {availableDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
                 
                 <select value={selectedMunicipality} onChange={(e) => setSelectedMunicipality(e.target.value)} className="border p-3 rounded w-full" required disabled={!selectedDistrict}>
                   <option value="">Select Municipality *</option>
                   {availableMunicipalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                 </select>
                 
                 <input name="city" placeholder="City / Area *" value={shippingInfo.city} onChange={handleInputChange} className="border p-3 rounded w-full" required />
               </div>
               <input name="streetAddress" placeholder="Street Address / House No. *" value={shippingInfo.streetAddress} onChange={handleInputChange} className="border p-3 rounded w-full" required />
             </div>

             {/* Section: Map */}
             <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Pin Location on Map</h3>
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative">
                    <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                    {locationSelected && <Marker position={location} />}
                    </MapContainer>
                    {!locationSelected && (
                        <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex items-center justify-center pointer-events-none">
                            <span className="bg-white px-3 py-1 rounded shadow text-sm">Tap map to pin location</span>
                        </div>
                    )}
                </div>
             </div>

             {/* Section: Payment */}
             <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Cash', 'Khalti', 'PayPal'].map((method) => (
                        <label key={method} className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'}`}>
                            <input type="radio" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mr-2 accent-blue-600" />
                            <span className="font-medium">{method}</span>
                        </label>
                    ))}
                </div>
             </div>
           </form>
        </div>
        
        {/* Right Column: Summary */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 shadow-md rounded-xl sticky top-4">
                <h3 className="font-bold text-xl mb-4 text-gray-800">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                    {selectedProducts.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm items-center border-b pb-2">
                        <div className="flex flex-col">
                            <span className="font-medium">{item.name || 'Product'}</span>
                            <span className="text-gray-500 text-xs">Qty: {item.quantity} | {item.size}</span>
                        </div>
                        <span className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    ))}
                </div>
                
                <div className="space-y-2 pt-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rs. {(total - delivery_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>Rs. {delivery_fee.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between font-bold border-t pt-4 mt-4 text-xl text-gray-900">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                </div>

                <button 
                form="checkout-form"
                type="submit" 
                disabled={isLoading} 
                className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all transform active:scale-95
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                >
                {isLoading ? "Processing..." : `Place Order (Rs. ${total.toFixed(0)})`}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;