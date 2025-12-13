import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const Filter = ({ showFilter, setShowFilter }) => {
  // ✅ FIX: Safe Destructuring with Default Values
  // This prevents crashes (e.g., "Cannot read property 'length' of undefined") 
  // if the Context data hasn't loaded yet.
  const {
    gender = [], 
    category = [],
    sizes = [],
    colors = [],
    priceRange = [0, 5000], // Default price range
    toggleGender = () => {},
    toggleCategory = () => {},
    toggleSizes = () => {},
    toggleColor = () => {},
    setPriceRange = () => {},
    resetGenderFilter = () => {},
    resetCategoryFilter = () => {},
    resetSizeFilter = () => {},
    resetColorFilter = () => {},
    resetPriceFilter = () => {},
    resetAllFilters = () => {},
    applyFilter = () => {}
  } = useContext(ShopContext);

  // Helper to safely check array inclusion
  const safeIncludes = (arr, item) => Array.isArray(arr) && arr.includes(item);

  // State to track gender checkbox status
  const [checkedGenders, setCheckedGenders] = useState({
    All: Array.isArray(gender) && gender.length === 0,
    Men: safeIncludes(gender, "Men"),
    Women: safeIncludes(gender, "Women"),
    Kids: safeIncludes(gender, "Kids"),
  });

  // State to track category checkbox status
  const [checkedCategories, setCheckedCategories] = useState({
    All: Array.isArray(category) && category.length === 0,
    Formal: safeIncludes(category, "Formal"),
    Casual: safeIncludes(category, "Casual"),
    Ethnic: safeIncludes(category, "Ethnic"),
  });

  // State to track size checkbox status
  const [checkedSizes, setCheckedSizes] = useState({
    S: safeIncludes(sizes, "S"),
    M: safeIncludes(sizes, "M"),
    L: safeIncludes(sizes, "L"),
    XL: safeIncludes(sizes, "XL"),
    XXL: safeIncludes(sizes, "XXL"),
  });

  // State to track color selection
  const [checkedColors, setCheckedColors] = useState({
    Black: safeIncludes(colors, "Black"),
    White: safeIncludes(colors, "White"),
    Blue: safeIncludes(colors, "Blue"),
    Red: safeIncludes(colors, "Red"),
    Green: safeIncludes(colors, "Green"),
  });

  // Color options array
  const colorOptions = ["Black", "White", "Blue", "Red", "Green"];

  // Handle gender checkbox change
  const handleGenderChange = (genderValue) => {
    if (genderValue === "All") {
      setCheckedGenders({
        All: true,
        Men: false,
        Women: false,
        Kids: false,
      });
      resetGenderFilter();
    } else {
      const newCheckedState = !checkedGenders[genderValue];
      setCheckedGenders((prev) => ({
        ...prev,
        [genderValue]: newCheckedState,
        All: false,
      }));

      toggleGender(genderValue);

      // Logic to re-check "All" if nothing is selected
      const updatedChecked = {
        ...checkedGenders,
        [genderValue]: newCheckedState,
        All: false,
      };

      if (!updatedChecked.Men && !updatedChecked.Women && !updatedChecked.Kids) {
        setCheckedGenders((prev) => ({ ...prev, All: true }));
        resetGenderFilter();
      }
    }
  };

  // Handle category checkbox change
  const handleCategoryChange = (categoryValue) => {
    if (categoryValue === "All") {
      setCheckedCategories({
        All: true,
        Formal: false,
        Casual: false,
        Ethnic: false,
      });
      resetCategoryFilter();
    } else {
      const newCheckedState = !checkedCategories[categoryValue];
      setCheckedCategories((prev) => ({
        ...prev,
        [categoryValue]: newCheckedState,
        All: false,
      }));

      toggleCategory(categoryValue);

      const updatedChecked = {
        ...checkedCategories,
        [categoryValue]: newCheckedState,
        All: false,
      };

      if (!updatedChecked.Formal && !updatedChecked.Casual && !updatedChecked.Ethnic) {
        setCheckedCategories((prev) => ({ ...prev, All: true }));
        resetCategoryFilter();
      }
    }
  };

  const handleSizeChange = (size) => {
    setCheckedSizes((prev) => ({ ...prev, [size]: !prev[size] }));
    toggleSizes(size);
  };

  const handleColorToggle = (color) => {
    setCheckedColors((prev) => ({ ...prev, [color]: !prev[color] }));
    toggleColor(color);
  };

  const handlePriceChange = (e, index) => {
    const newValue = parseInt(e.target.value) || 0; // Guard against NaN
    setPriceRange((prev) => {
      // Guard if prev is undefined
      const safePrev = Array.isArray(prev) ? prev : [0, 5000];
      const newRange = [...safePrev];
      newRange[index] = newValue;
      return newRange;
    });
  };

  // ✅ Update effects with safety checks
  useEffect(() => {
    if (!Array.isArray(gender)) return;
    setCheckedGenders({
      All: gender.length === 0,
      Men: gender.includes("Men"),
      Women: gender.includes("Women"),
      Kids: gender.includes("Kids"),
    });
  }, [gender]);

  useEffect(() => {
    if (!Array.isArray(category)) return;
    setCheckedCategories({
      All: category.length === 0,
      Formal: category.includes("Formal"),
      Casual: category.includes("Casual"),
      Ethnic: category.includes("Ethnic"),
    });
  }, [category]);

  useEffect(() => {
    if (!Array.isArray(sizes)) return;
    setCheckedSizes({
      S: sizes.includes("S"),
      M: sizes.includes("M"),
      L: sizes.includes("L"),
      XL: sizes.includes("XL"),
      XXL: sizes.includes("XXL"),
    });
  }, [sizes]);

  useEffect(() => {
    if (!Array.isArray(colors)) return;
    setCheckedColors({
      Black: colors.includes("Black"),
      White: colors.includes("White"),
      Blue: colors.includes("Blue"),
      Red: colors.includes("Red"),
      Green: colors.includes("Green"),
    });
  }, [colors]);

  return (
    <div className={`${showFilter ? "block" : "hidden"} lg:block lg:w-64 space-y-6`}>
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-bold text-lg">Filters</h2>
        <button onClick={() => setShowFilter(false)} className="p-1 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Gender Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg text-gray-800">Gender</h3>
          <button
            onClick={resetGenderFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={!Array.isArray(gender) || gender.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="space-y-1">
          {["All", "Men", "Women", "Kids"].map((item) => (
            <label key={item} className="flex items-center text-lg gap-2 cursor-pointer group">
              <input
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                type="checkbox"
                checked={checkedGenders[item] || false}
                onChange={() => handleGenderChange(item)}
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg text-gray-800">Categories</h3>
          <button
            onClick={resetCategoryFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={!Array.isArray(category) || category.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="space-y-1">
          {["All", "Formal", "Casual", "Ethnic"].map((item) => (
            <label key={item} className="flex items-center text-lg gap-2 cursor-pointer group">
              <input
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                type="checkbox"
                checked={checkedCategories[item] || false}
                onChange={() => handleCategoryChange(item)}
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg text-gray-800">Sizes</h3>
          <button
            onClick={resetSizeFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={!Array.isArray(sizes) || sizes.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <label
              key={size}
              className={`flex items-center text-sm justify-center h-10 rounded-lg cursor-pointer transition-all ${
                checkedSizes[size]
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checkedSizes[size] || false}
                onChange={() => handleSizeChange(size)}
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      {/* Colors Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg text-gray-800">Colors</h3>
          <button
            onClick={resetColorFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={!Array.isArray(colors) || colors.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                checkedColors[color] ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
              style={{
                backgroundColor: color.toLowerCase(),
                borderColor: color.toLowerCase() === "white" ? "#e5e7eb" : color.toLowerCase(),
              }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg text-gray-800">Price Range</h3>
          <button
            onClick={resetPriceFilter}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={
              Array.isArray(priceRange) && priceRange[0] === 0 && priceRange[1] === 5000
            }
          >
            Reset
          </button>
        </div>
        <div className="px-2">
          <div className="flex justify-between text-lg mb-2">
            <span>₹{Array.isArray(priceRange) ? priceRange[0] : 0}</span>
            <span>₹{Array.isArray(priceRange) ? priceRange[1] : 5000}</span>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={Array.isArray(priceRange) ? priceRange[0] : 0}
              onChange={(e) => handlePriceChange(e, 0)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={Array.isArray(priceRange) ? priceRange[1] : 5000}
              onChange={(e) => handlePriceChange(e, 1)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Apply and Reset Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={applyFilter}
        >
          Apply Filters
        </button>
        <button
          className="flex-1 py-2 bg-gray-200 text-lg text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          onClick={resetAllFilters}
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default Filter;