import React, { useContext, useState } from 'react';
import axios from 'axios'; // Make sure axios is installed in your project
import { ShopContext } from '../../context/Shopcontext';
import { toast } from "react-toastify";

const AddProduct = () => {
  const [product, setProduct] = useState({
    productName: '',
    description: '',
    price: '',
    category: '',
    gender: '',
    size: [],
    color: [],
    totalQuantity: '',
    totalSold: '0', // Default to 0 for new products
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  // const {token}= useContext(ShopContext);
  const token = localStorage.getItem('token');
  
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Brown'];
  const categoryOptions = ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Accessories', 'Shoes'];
  const genderOptions = ['Male', 'Female'];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setProduct({ ...product, [name]: checked });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };
  
  const handleSizeToggle = (size) => {
    if (product.size.includes(size)) {
      setProduct({
        ...product,
        size: product.size.filter(s => s !== size)
      });
    } else {
      setProduct({
        ...product,
        size: [...product.size, size]
      });
    }
  };
  
  const handleColorToggle = (color) => {
    if (product.color.includes(color)) {
      setProduct({
        ...product,
        color: product.color.filter(c => c !== color)
      });
    } else {
      setProduct({
        ...product,
        color: [...product.color, color]
      });
    }
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
  
    try {
      const newImagePreviews = files.map(file => ({
        file, // keep file for FormData
        preview: URL.createObjectURL(file), // for preview only
        name: file.name
      }));
  
      setProduct({
        ...product,
        images: [...product.images, ...newImagePreviews]
      });
  
      setError(null);
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  const removeImage = (index) => {
    try {
      const imageToRemove = product.images[index];
      
      // Revoke the object URL to avoid memory leaks
      if (imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      // Remove from local state
      const newImages = [...product.images];
      newImages.splice(index, 1);
      setProduct({ ...product, images: newImages });
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    }
  };
  
  const resetForm = () => {
    setProduct({
      productName: '',
      description: '',
      price: '',
      category: '',
      gender: '',
      size: [],
      color: [],
      totalQuantity: '',
      totalSold: '0',
      images: []
    });
    setSuccess(false);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // Validation
      if (product.size.length === 0) throw new Error('Please select at least one size');
      if (product.color.length === 0) throw new Error('Please select at least one color');
      if (product.images.length === 0) throw new Error('Please upload at least one product image');
  
      // Prepare FormData
      const formData = new FormData();
      formData.append('productName', product.productName);
      formData.append('description', product.description);
      formData.append('category', product.category);
      formData.append('price', product.price);
      formData.append('gender', product.gender);
      formData.append('totalQuantity', product.totalQuantity);
      formData.append('totalSold', product.totalSold);
      product.size.forEach(size => formData.append('size[]', size));
      product.color.forEach(color => formData.append('color[]', color));
      product.images.forEach(img => formData.append('images', img.file));
  
      const response = await axios.post("http://localhost:3001/v1/product", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Product added:', response.data);
      toast.success(response.data.message || 'Product added successfully!');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Auto-hide after 3 sec
      resetForm(); // Don't reset success inside this function
  
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          Product added successfully!
          <button 
            className="ml-2 text-green-800 underline"
            onClick={() => setSuccess(false)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 text-red-800 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name*
            </label>
            <input
              type="text"
              name="productName"
              value={product.productName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)*
            </label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category*
            </label>
            <select
              name="category"
              value={product.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender*
            </label>
            <select
              name="gender"
              value={product.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              {genderOptions.map(gender => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Quantity*
            </label>
            <input
              type="number"
              name="totalQuantity"
              value={product.totalQuantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Sold
            </label>
            <input
              type="number"
              name="totalSold"
              value={product.totalSold}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description*
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Sizes*
          </label>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`px-4 py-2 rounded-md ${
                  product.size.includes(size)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {product.size.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please select at least one size
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Colors*
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorToggle(color)}
                className={`px-4 py-2 rounded-md ${
                  product.color.includes(color)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
          {product.color.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please select at least one color
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images*
          </label>
          <div className="flex items-center gap-4 mb-4">
            <label className={`cursor-pointer px-4 py-2 ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
            } text-gray-700 rounded-md transition duration-200`}>
              <span>{loading ? 'Uploading...' : 'Add Images'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>
            <span className="text-sm text-gray-500">
              Upload at least one image
            </span>
          </div>
          
          {product.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {product.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Product preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-500">
              Please upload at least one product image
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-4 hover:bg-gray-300 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || product.size.length === 0 || product.color.length === 0 || product.images.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-70"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;