import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../config/api";

const PREDEFINED_QUESTIONS = [
  "What is the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite food?",
  "What is the name of your favorite teacher?",
  "What is the make of your first car?",
  "What is your father's middle name?"
];

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  
  // State for 3 questions
  const [formData, setFormData] = useState([
    { question: PREDEFINED_QUESTIONS[0], answer: "" },
    { question: PREDEFINED_QUESTIONS[1], answer: "" },
    { question: PREDEFINED_QUESTIONS[2], answer: "" },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validation
    const isValid = formData.every(q => q.answer.trim().length > 0);
    if (!isValid) return toast.error("Please answer all 3 questions.");
    
    setLoading(true);
    try {
      // Calls your new controller endpoint
      const response = await api.put("/v1/auth/set-security-questions", {
        securityQuestions: formData
      });
      
      if (response.status === 200) {
        toast.success("Security questions updated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Security Questions</h2>
      <p className="text-sm text-gray-600 mb-6">
        Set up these questions to recover your account if you forget your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.map((item, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question {index + 1}
            </label>
            
            {/* Question Selector */}
            <select
              value={item.question}
              onChange={(e) => handleChange(index, "question", e.target.value)}
              className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PREDEFINED_QUESTIONS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            {/* Answer Input */}
            <input
              type="text"
              value={item.answer}
              onChange={(e) => handleChange(index, "answer", e.target.value)}
              placeholder="Your answer..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Questions"}
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;