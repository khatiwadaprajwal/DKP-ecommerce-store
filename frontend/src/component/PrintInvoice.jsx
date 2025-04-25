import React from "react";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const PrintInvoice = ({ order }) => {
  const { currency = "NPR" } = useContext(ShopContext);
  
  const handlePrintInvoice = () => {
    // Create a new window
    const printWindow = window.open('', '_blank');
    
    // Generate the invoice HTML content
    const invoiceContent = generateInvoiceHTML(order);
    
    // Write the content to the new window
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    
    // Add a slight delay before calling print to ensure content is loaded
    setTimeout(() => {
      printWindow.focus();
      // printWindow.print();
    }, 500);
  };
  
  const generateInvoiceHTML = (order) => {
    // Format the date
    const orderDate = order.orderDate 
      ? new Date(order.orderDate).toLocaleDateString() 
      : new Date(order.createdAt).toLocaleDateString();

    // Format order status with appropriate styling
    const getStatusStyle = (status) => {
      switch(status) {
        case 'Delivered': return 'color: #22c55e; background-color: #dcfce7; padding: 3px 8px; border-radius: 12px;';
        case 'Cancelled': return 'color: #ef4444; background-color: #fee2e2; padding: 3px 8px; border-radius: 12px;';
        case 'Shipped': return 'color: #3b82f6; background-color: #dbeafe; padding: 3px 8px; border-radius: 12px;';
        case 'Processing': return 'color: #8b5cf6; background-color: #f3e8ff; padding: 3px 8px; border-radius: 12px;';
        default: return 'color: #eab308; background-color: #fef9c3; padding: 3px 8px; border-radius: 12px;';
      }
    };
      
    // Generate table rows for order items
    const itemRows = order.orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productId?.productName || 'Product'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.size || 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.color || 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${currency} ${(item.price || 0).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${currency} ${(item.totalPrice || (item.price * item.quantity) || 0).toFixed(2)}</td>
      </tr>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DKP Clothing - Invoice #${order._id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .logo {
            text-align: center;
            margin-bottom: 10px;
          }
          .brand-name {
            font-size: 28px;
            font-weight: bold;
            color: #4a6cf7;
            letter-spacing: 1px;
          }
          .tagline {
            font-size: 14px;
            color: #666;
            font-style: italic;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4a6cf7;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-details > div {
            flex: 1;
          }
          .invoice-id {
            font-weight: bold;
            color: #4a6cf7;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
            padding: 10px 8px;
            color: #555;
          }
          .total-row {
            font-weight: bold;
          }
          .subtotal-row {
            text-align: right;
            padding: 8px;
            border-top: 1px solid #ddd;
          }
          .grand-total-row {
            font-weight: bold;
            font-size: 16px;
            text-align: right;
            padding: 10px 8px;
            background-color: #f9fafb;
            border-top: 2px solid #4a6cf7;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .contact-info {
            font-size: 12px;
            margin-top: 10px;
          }
          .payment-status {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: bold;
          }
          .payment-paid {
            color: #22c55e;
            background-color: #dcfce7;
          }
          .payment-pending {
            color: #eab308;
            background-color: #fef9c3;
          }
          .payment-failed {
            color: #ef4444;
            background-color: #fee2e2;
          }
          .barcode {
            text-align: center;
            margin: 20px 0;
            font-family: monospace;
            font-size: 16px;
            letter-spacing: 2px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
          .thanks-message {
            font-size: 18px;
            text-align: center;
            margin: 30px 0;
            color: #4a6cf7;
            font-weight: bold;
          }
          .store-policy {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            font-size: 12px;
            margin-top: 20px;
          }
          .store-policy h4 {
            margin-top: 0;
            color: #4a6cf7;
          }
        </style>
      </head>
      <body>
        <div class="logo">
          <div class="brand-name">DKP CLOTHING</div>
          <div class="tagline">Quality Fashion For Everyone</div>
        </div>
        
        <div class="invoice-header">
          <h1>INVOICE</h1>
          <p class="invoice-id">Order #${order._id}</p>
        </div>
        
        <div class="invoice-info">
          <div>
            <strong>Date:</strong> ${orderDate}
          </div>
          <div>
            <strong>Status:</strong> <span style="${getStatusStyle(order.status)}">${order.status || 'Pending'}</span>
          </div>
        </div>
        
        <div class="invoice-details">
          <div>
            <h3>Bill To:</h3>
            <p>${order.address || 'N/A'}</p>
            ${order.location ? `<p style="font-size: 12px; color: #666;">Location: ${order.location.lat}, ${order.location.lng}</p>` : ''}
          </div>
          <div style="text-align: right;">
            <h3>Payment Details:</h3>
            <p><strong>Method:</strong> ${order.paymentMethod || 'N/A'}</p>
            <p>
              <strong>Status:</strong> 
              <span class="payment-status ${
                order.paymentStatus === 'Paid' ? 'payment-paid' : 
                order.paymentStatus === 'Failed' ? 'payment-failed' : 'payment-pending'
              }">
                ${order.paymentStatus || 'Pending'}
              </span>
            </p>
            ${order.paymentId ? `<p><strong>Payment ID:</strong> ${order.paymentId}</p>` : ''}
            <p><strong>Currency:</strong> ${order.currency || currency}</p>
          </div>
        </div>
        
        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th style="padding: 8px;">Product</th>
              <th style="padding: 8px; text-align: center;">Quantity</th>
              <th style="padding: 8px; text-align: center;">Size</th>
              <th style="padding: 8px; text-align: center;">Color</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="subtotal-row"><strong>Subtotal:</strong></td>
              <td class="subtotal-row">${currency} ${order.totalAmount?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <td colspan="5" class="subtotal-row"><strong>Shipping:</strong></td>
              <td class="subtotal-row">${currency} 0.00</td>
            </tr>
            <tr>
              <td colspan="5" class="grand-total-row"><strong>TOTAL:</strong></td>
              <td class="grand-total-row">${currency} ${order.totalAmount?.toFixed(2) || '0.00'}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="barcode">
          *${order._id}*
        </div>
        
        <div class="thanks-message">
          Thank you for shopping with DKP Clothing!
        </div>
        
        <div class="store-policy">
          <h4>Return Policy</h4>
          <p>Items may be returned within 30 days of purchase with original packaging and receipt. Custom orders are non-refundable.</p>
          
          <h4>Contact Information</h4>
          <p>If you have any questions about your order, please contact us at:</p>
          <div class="contact-info">
            <p>Email: support@dkpclothing.com | Phone: +977-9876543210</p>
            <p>Store Address: New Road, Kathmandu, Nepal</p>
          </div>
        </div>
        
        <div class="footer">
          <p>DKP Clothing - Your Fashion Partner</p>
          <p>www.dkpclothing.com</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #4a6cf7; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Print Invoice
          </button>
        </div>
      </body>
      </html>
    `;
  };
  
  return (
    <button 
      onClick={handlePrintInvoice}
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
      </svg>
      Print Invoice
    </button>
  );
};

export default PrintInvoice;