const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const orderConfirmationTemplate = (customerName, address, phone, postalCode, items, totalPrice, deliveryDays, status) => {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center;">
          <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 12px; margin-right: 15px; border: 1px solid #eee;">
          <div>
            <p style="margin: 0; font-weight: 700; color: #1a1a1a; font-size: 14px;">${item.name}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">${item.category}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #aaa;">Color: ${item.color || 'N/A'} | Size: ${item.size || 'Standard'}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-weight: 600;">
        ${item.quantity}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a1a1a; font-weight: 700;">
        $${item.price}
      </td>
    </tr>
  `).join('');

  const isCancelled = status.toLowerCase() === 'cancelled';
  const statusColor = isCancelled ? '#ff4d4f' : '#d4af37';
  const statusBg = isCancelled ? '#fff1f0' : '#fcf9ee';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f6f9fc; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #4a4a4a; border-radius: 20px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background-color: #000000; padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300; }
        .content { padding: 40px; }
        .status-box { background-color: ${statusBg}; border: 1px solid ${statusColor}33; color: ${statusColor}; padding: 12px 20px; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; }
        .greeting { font-size: 22px; color: #1a1a1a; font-weight: 700; margin: 0 0 10px 0; }
        .message { font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 30px; }
        .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #aaa; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .info-grid { display: table; width: 100%; margin-bottom: 30px; }
        .info-col { display: table-cell; width: 50%; vertical-align: top; }
        .info-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 14px; color: #333; font-weight: 600; margin-bottom: 15px; line-height: 1.4; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .total-box { background-color: #f9fafb; padding: 20px; border-radius: 12px; text-align: right; }
        .total-label { font-size: 13px; color: #888; font-weight: 600; }
        .total-value { font-size: 24px; color: #000; font-weight: 700; margin-top: 5px; }
        .delivery-notice { background: linear-gradient(to right, #fcf9ee, #ffffff); border-left: 4px solid #d4af37; padding: 15px 20px; border-radius: 0 12px 12px 0; margin-bottom: 30px; }
        .footer { text-align: center; padding: 30px; font-size: 12px; color: #aaa; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main">
          <tr>
            <td class="header">
              <h1>ATELIER</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="status-box">${status}</div>
              <h2 class="greeting">Hello, ${customerName}</h2>
              <p class="message">
                ${isCancelled 
                  ? "We're sorry to inform you that your order has been cancelled. If you have any questions, please contact our support team."
                  : "Thank you for choosing Atelier. We are pleased to confirm that we have received your request for the following exquisite pieces."}
              </p>

              <div class="section-title">Shipping Destination</div>
              <div class="info-grid">
                <div class="info-col">
                  <div class="info-label">Name</div>
                  <div class="info-value">${customerName}</div>
                  <div class="info-label">Phone</div>
                  <div class="info-value">${phone}</div>
                </div>
                <div class="info-col">
                  <div class="info-label">Address</div>
                  <div class="info-value">${address}<br>${postalCode}</div>
                </div>
              </div>

              ${!isCancelled && deliveryDays !== 'Not specified' ? `
              <div class="delivery-notice">
                <p style="margin: 0; font-size: 13px; color: #8a6d3b; font-weight: 600;">
                  Estimated Arrival: <span style="font-size: 15px; color: #d4af37; font-weight: 800;">${deliveryDays} Business Days</span>
                </p>
              </div>
              ` : ''}

              <div class="section-title">Your Selection</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="text-align: left; font-size: 11px; color: #aaa; text-transform: uppercase; padding-bottom: 10px;">Item</th>
                    <th style="text-align: center; font-size: 11px; color: #aaa; text-transform: uppercase; padding-bottom: 10px;">Qty</th>
                    <th style="text-align: right; font-size: 11px; color: #aaa; text-transform: uppercase; padding-bottom: 10px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="total-box">
                <span class="total-label">Total Amount</span>
                <div class="total-value">$${totalPrice}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin-bottom: 10px;">&copy; 2026 ATELIER FASHION HOUSE. All Rights Reserved.</p>
              <p>This is an automated curation message. Please do not reply directly.</p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

async function sendOrderConfirmation(email, orderData, deliveryDays = 'Not specified', status = 'Confirmed') {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order ${status} - Atelier ${new Date().getFullYear()}`,
      html: orderConfirmationTemplate(
        orderData.customerName,
        orderData.address,
        orderData.phone,
        orderData.postalCode,
        orderData.items,
        orderData.totalAmount,
        deliveryDays,
        status
      )
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('[Email Error]', error);
    return { success: false, message: error.message };
  }
}

module.exports = { sendOrderConfirmation };
