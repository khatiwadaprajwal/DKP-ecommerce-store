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
  "What is your father's middle name?",
];

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

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

    // Validation
    const areQuestionsValid = formData.every((q) => q.answer.trim().length > 0);
    if (!areQuestionsValid) {
      return toast.error("Please provide answers for all 3 questions.");
    }
    if (!currentPassword) {
      return toast.error("Please enter your current password to confirm changes.");
    }

    setLoading(true);
    try {
      const response = await api.put("/v1/set-security-questions", {
        securityQuestions: formData,
        currentPassword: currentPassword, // Sending password for verification
      });

      if (response.status === 200) {
        toast.success("Security questions updated successfully!");
        setCurrentPassword(""); // Clear password field on success
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to update questions.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Account Recovery
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configure your security questions. These will be used to recover your
            account if you forget your password.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">
              Security Questions
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* Questions List */}
            <div className="space-y-6">
              {formData.map((item, index) => (
                <div
                  key={index}
                  className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">
                      {index + 1}
                    </span>
                    <label className="text-sm font-semibold text-gray-700">
                      Select Question
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {/* Dropdown */}
                    <div className="relative">
                      <select
                        value={item.question}
                        onChange={(e) =>
                          handleChange(index, "question", e.target.value)
                        }
                        className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-gray-50"
                      >
                        {PREDEFINED_QUESTIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Answer Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={item.answer}
                        onChange={(e) =>
                          handleChange(index, "answer", e.target.value)
                        }
                        placeholder="Type your answer here..."
                        className="block w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-200" />

            {/* Password Confirmation Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">
                    Authorization Required
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Please enter your current password to save these changes.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Security Questions"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;