import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthProvider"; 
import { MapPin, CreditCard, DollarSign, X, Package } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { address as addressData } from "../assets/address.js"; // Ensure this path is correct
import api from "../config/api"; 

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper Component for Map Clicks
const LocationPicker = ({ onLocationSelected }) => {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) { 
      setPosition(e.latlng); 
      if (onLocationSelected) onLocationSelected(e.latlng); 
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const QuickOrder = ({ 
  isOpen, 
  onClose, 
  productData, 
  product, 
  selectedSize, 
  selectedColor, 
  variant, 
  quantity 
}) => {
  const { token } = useAuth();
  const { delivery_fee = 0, fetchCartData, openPayPalPopup } = useContext(ShopContext);
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [shippingInfo, setShippingInfo] = useState({ 
    fullName: "", 
    streetAddress: "", 
    city: "", 
    phone: "" 
  });
  
  // ✅ Normalize Props (Handle mismatch between Product.jsx passing 'variant' vs 'selectedSize')
  // Use 'finalProduct' everywhere in this component to prevent undefined errors
  const finalProduct = productData || product;
  const finalSize = selectedSize || variant?.size;
  const finalColor = selectedColor || variant?.color;

  // Address State
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  
  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.3240 });
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.warn("Geolocation denied or error:", error)
      );
    }
    
    // Reset form on open
    if (isOpen) {
      setShippingInfo({ fullName: "", streetAddress: "", city: "", phone: "" });
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedMunicipality("");
      setAvailableDistricts([]);
      setAvailableMunicipalities([]);
      setLocationSelected(false);
      setPaymentMethod("Cash");
    }
  }, [isOpen]);

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict("");
    setSelectedMunicipality("");
    setAvailableMunicipalities([]);
    
    if (provinceId && addressData) {
      const province = addressData.find(p => p.id.toString() === provinceId);
      if (province && province.districts) {
        setAvailableDistricts(Array.isArray(province.districts) ? province.districts : Object.values(province.districts));
      }
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
      if (district && district.municipalities) {
        setAvailableMunicipalities(Array.isArray(district.municipalities) ? district.municipalities : Object.values(district.municipalities));
      }
    } else {
      setAvailableMunicipalities([]);
    }
  };

  const handleMunicipalityChange = (e) => {
    setSelectedMunicipality(e.target.value);
  };

  // Safe Calculation
  const subtotal = finalProduct ? (finalProduct.price || 0) * (quantity || 1) : 0;
  const total = subtotal + delivery_fee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLocationSelected = (latlng) => {
    setLocation({ lat: latlng.lat, lng: latlng.lng });
    setLocationSelected(true);
    toast.success("Location selected!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) { 
      toast.error("Please login first"); 
      onClose(); 
      navigate('/login'); 
      return; 
    }

    // Validation
    for (const value of Object.values(shippingInfo)) {
      if (!value.trim()) return toast.error("Fill all shipping information fields");
    }
    
    if (!selectedProvince) return toast.error("Please select a province");
    if (!selectedDistrict) return toast.error("Please select a district");
    if (!selectedMunicipality) return toast.error("Please select a municipality");
    if (!locationSelected) return toast.error("Select location on map");
    if (!finalProduct) return toast.error("Product data missing");
    if (!finalSize) return toast.error("Select size");
    
    setIsLoading(true);
    
    try {
      const province = addressData.find(p => p.id.toString() === selectedProvince);
      const district = availableDistricts.find(d => d.id.toString() === selectedDistrict);
      const municipality = availableMunicipalities.find(m => m.id.toString() === selectedMunicipality);
      
      const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.streetAddress}, ${shippingInfo.city}, ${municipality?.name || ''}, ${district?.name || ''}, ${province?.name || ''}, ${shippingInfo.phone}`;
      
      const orderData = {
        productId: finalProduct._id,
        quantity: quantity,
        address: formattedAddress,
        location: location,
        paymentMethod: paymentMethod,
        color: finalColor || "White",
        size: finalSize
      };
      
      // ✅ API Call using configured instance
      const response = await api.post('/v1/place', orderData);
      
      if (response.data.khaltiUrl) {
        window.location.href = response.data.khaltiUrl;
      } else if (response.data.approvalUrl) {
        localStorage.setItem('paypal_pending_product_ids', finalProduct._id);
        openPayPalPopup(response.data.approvalUrl);
      } else {
        fetchCartData();
        toast.success("Order placed successfully!");
        onClose();
        navigate("/order", { state: { order: response.data.order } });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Order failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[95%] md:w-[70%] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">Quick Checkout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><MapPin className="mr-2 text-blue-600" />Shipping Information</h2>
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text" 
                    name="fullName" 
                    placeholder="Full Name *" 
                    value={shippingInfo.fullName} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded" 
                    required 
                  />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Phone Number *" 
                    value={shippingInfo.phone} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded" 
                    required 
                  />
                </div>
                
                {/* Nepal Address Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select 
                    value={selectedProvince} 
                    onChange={handleProvinceChange} 
                    className="border p-2 rounded" 
                    required
                  >
                    <option value="">Select Province *</option>
                    {addressData && addressData.map(province => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedDistrict} 
                    onChange={handleDistrictChange} 
                    className="border p-2 rounded" 
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">Select District *</option>
                    {availableDistricts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedMunicipality} 
                    onChange={handleMunicipalityChange} 
                    className="border p-2 rounded" 
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Municipality *</option>
                    {availableMunicipalities.map(municipality => (
                      <option key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                  
                  <input 
                    type="text" 
                    name="city" 
                    placeholder="City/Area *" 
                    value={shippingInfo.city} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded" 
                    required 
                  />
                </div>
                
                {/* Street Address */}
                <div className="mb-4">
                  <input 
                    type="text" 
                    name="streetAddress" 
                    placeholder="Street Address / House Number *" 
                    value={shippingInfo.streetAddress} 
                    onChange={handleInputChange} 
                    className="border p-2 rounded w-full" 
                    required 
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">Select Delivery Location</h3>
                <div className="mb-6 h-64 border rounded-lg overflow-hidden relative z-0">
                  <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                    {locationSelected && <Marker position={[location.lat, location.lng]} />}
                  </MapContainer>
                </div>
                
                <h2 className="text-xl font-semibold mb-4"><CreditCard className="inline mr-2" />Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === "Cash"} onChange={() => setPaymentMethod("Cash")} className="mr-2" />
                    <DollarSign size={20} className="mr-2 text-green-600" />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="Khalti" checked={paymentMethod === "Khalti"} onChange={() => setPaymentMethod("Khalti")} className="mr-2" />
                    <span className="ml-2 font-bold text-[#5C2D91]">Pay with Khalti</span>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="PayPal" checked={paymentMethod === "PayPal"} onChange={() => setPaymentMethod("PayPal")} className="mr-2" />
                    <span className="ml-2 font-bold text-[#003087]">PayPal</span>
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </button>
              </form>
            </div>
            
            <div className="md:col-span-1 sticky top-4">
              <h2 className="text-xl font-semibold mb-4"><Package className="inline mr-2" />Order Summary</h2>
              
              {/* ✅ Uses finalProduct to prevent crashes */}
              {finalProduct && (
                <div className="mb-4 text-sm space-y-2">
                  <p className="font-medium text-lg">{finalProduct.productName}</p>
                  <p className="text-gray-600">Size: {finalSize}</p>
                  <p className="text-gray-600">Color: {finalColor || "White"}</p>
                  <p className="text-gray-600">Quantity: {quantity}</p>
                  <div className="pt-2 border-t">
                    <p className="flex justify-between"><span>Subtotal:</span><span>Rs. {subtotal.toLocaleString()}</span></p>
                    <p className="flex justify-between"><span>Delivery Fee:</span><span>Rs. {delivery_fee.toLocaleString()}</span></p>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-2 font-bold flex justify-between text-lg">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ❌ REMOVED: <ToastContainer /> (It causes errors if not imported, and duplicates App.js container) */}
    </div>
  );
};

export default QuickOrder;