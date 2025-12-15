import React, { useState, useEffect } from 'react';
import { EyeIcon, InboxIcon, XMarkIcon } from '@heroicons/react/24/outline';
// ✅ Import centralized API configuration
import api from '../../config/api';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showMessageDetails, setShowMessageDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyData, setReplyData] = useState({
    email: '',
    name: '',
    subject: '',
    message: ''
  });

  // ✅ 1. Fetch All Messages
  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/all");
      setMessages(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ 2. Fetch Messages by Email
  const fetchMessagesByEmail = async (email) => {
    if (!email) {
      fetchAllMessages();
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/v1/msg/${email}`);
      setMessages(response.data);
      setErrorMessage('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessages([]);
      } else {
        console.error('Error fetching messages by email:', error);
        setErrorMessage('Failed to load messages. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllMessages();
  }, []);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'createdAt' ? 'desc' : 'asc');
    }
  };
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMessagesByEmail(emailFilter);
  };
  
  const resetFilter = () => {
    setEmailFilter('');
    fetchAllMessages();
  };

  const openReplyModal = (message) => {
    setReplyData({
      email: message.email,
      name: message.name,
      subject: `Re: Your Message`,
      message: `Dear ${message.name},\n\nThank you for your message. `
    });
    setIsReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setReplyData({ email: '', name: '', subject: '', message: '' });
  };

  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setReplyData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ 3. Send Reply
  const sendReply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/v1/reply', {
        email: replyData.email,
        subject: replyData.subject,
        reply: replyData.message
      });
      
      setSuccessMessage('Reply sent successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      closeReplyModal();
    } catch (error) {
      console.error('Error sending reply:', error);
      setErrorMessage('Failed to send reply. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.msg?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'createdAt') {
      return sortDirection === 'asc' 
        ? new Date(aValue) - new Date(bValue) 
        : new Date(bValue) - new Date(aValue);
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Notification Messages */}
      {errorMessage && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{errorMessage}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{successMessage}</div>}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">Message Management</h2>
        <div className="text-sm text-gray-500">Total: {messages.length}</div>
      </div>
      
      {/* Search and Filter Inputs */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <form onSubmit={handleFilterSubmit} className="flex w-full md:w-auto">
          <input
            type="email"
            placeholder="Filter email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 border-l-0 rounded-r-md">
            Filter
          </button>
          {emailFilter && (
            <button type="button" onClick={resetFilter} className="ml-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300">
              Clear
            </button>
          )}
        </form>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading messages...</div>
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Cards (Visible only on mobile) */}
          <div className="md:hidden space-y-4">
            {sortedMessages.length === 0 ? (
               <div className="text-center text-gray-500">No messages found</div>
            ) : (
              sortedMessages.map(message => (
                <div key={message._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                   {/* Header */}
                   <div className="flex justify-between items-start mb-2">
                      <div>
                         <span className="font-bold text-gray-900 block">{message.name}</span>
                         <span className="text-xs text-gray-500">{formatDateTime(message.createdAt)}</span>
                      </div>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => setShowMessageDetails(showMessageDetails === message._id ? null : message._id)}
                            className="p-1 text-indigo-600 bg-indigo-50 rounded"
                         >
                            <EyeIcon className="h-5 w-5" />
                         </button>
                         {/* Trash Icon Removed */}
                      </div>
                   </div>

                   {/* Email & Preview */}
                   <div className="text-sm text-gray-600 mb-2 truncate">{message.email}</div>
                   <div className="text-sm bg-white p-2 rounded border border-gray-200 mb-2 line-clamp-2">
                      {message.msg}
                   </div>

                   {/* Expanded Details on Mobile */}
                   {showMessageDetails === message._id && (
                      <div className="mt-3 pt-3 border-t">
                         <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Full Message</h4>
                         <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap mb-3">
                            {message.msg}
                         </div>
                         <button
                            onClick={() => openReplyModal(message)}
                            className="w-full py-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 flex items-center justify-center font-medium"
                         >
                            <InboxIcon className="h-4 w-4 mr-2" />
                            Reply via System
                         </button>
                      </div>
                   )}
                </div>
              ))
            )}
          </div>

          {/* 💻 DESKTOP VIEW: Table (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>
                    ID {sortField === '_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                    Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMessages.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No messages found</td></tr>
                ) : (
                  sortedMessages.map(message => (
                    <React.Fragment key={message._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{message._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap">{message.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{message.email}</td>
                        <td className="px-6 py-4"><div className="truncate max-w-xs">{message.msg}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(message.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => setShowMessageDetails(showMessageDetails === message._id ? null : message._id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {/* Trash Icon Removed */}
                        </td>
                      </tr>
                      
                      {showMessageDetails === message._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            {/* Desktop Details View */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2">Details</h4>
                                <p className="text-sm"><strong>From:</strong> {message.name} ({message.email})</p>
                                <p className="text-sm"><strong>Date:</strong> {formatDateTime(message.createdAt)}</p>
                              </div>
                              <div className="flex items-start justify-end">
                                <button onClick={() => openReplyModal(message)} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 flex items-center">
                                  <InboxIcon className="h-4 w-4 mr-1" /> Reply via System
                                </button>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded border text-sm whitespace-pre-wrap">
                              {message.msg}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Reply to {replyData.name}</h3>
              <button onClick={closeReplyModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={sendReply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" value={replyData.email} readOnly />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" name="subject" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={replyData.subject} onChange={handleReplyChange} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" rows="6" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={replyData.message} onChange={handleReplyChange} required></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={closeReplyModal}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Send Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;