import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateBillPDF = async (billData, companySettings) => {
  const { customer_name, products, created_at } = billData;
  
  // Calculate totals
  let subtotal = 0;
  products.forEach(p => {
    subtotal += p.qty * p.rate;
  });
  
  const taxRate = companySettings?.tax_percentage || 15;
  const tax = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + tax;
  
  // Generate ZATCA QR code data
  const qrData = btoa(JSON.stringify({
    seller: companySettings?.company_name_ar || '',
    vat: companySettings?.vat_number || '',
    total: grandTotal.toFixed(2),
    tax: tax.toFixed(2),
    date: created_at
  }));
  
  const invoiceNo = `${new Date(created_at).toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const html = `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#fff;padding:20px}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20px}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #1e3c72;padding-bottom:15px;margin-bottom:20px}
.qr-section{text-align:center}
.qr-code{width:80px;height:80px;border:2px solid #000;padding:3px}
.company-info,.customer-info{flex:1;padding:0 15px}
.company-info h1{font-size:18px;color:#1e3c72;margin-bottom:5px}
.company-info h2{font-size:16px;color:#d4af37;margin-bottom:10px}
.info-line{font-size:11px;margin:3px 0;color:#333}
.invoice-title{text-align:center;background:linear-gradient(135deg,#1e3c72,#2a5298);color:#fff;padding:12px;margin:15px 0;font-size:18px;font-weight:700;border-radius:5px}
.details-row{display:flex;justify-content:space-between;margin:15px 0;padding:10px;background:#f9f9f9;border-radius:5px}
.detail-item{flex:1;padding:0 10px}
.detail-label{font-size:10px;color:#666;font-weight:600;margin-bottom:3px}
.detail-value{font-size:12px;color:#000;font-weight:700}
table{width:100%;border-collapse:collapse;margin:20px 0}
thead{background:linear-gradient(135deg,#1e3c72,#2a5298);color:#fff}
th{padding:12px 8px;text-align:center;font-size:12px;font-weight:700;border:1px solid #fff}
td{padding:10px 8px;text-align:center;border:1px solid #ddd;font-size:11px}
tbody tr:nth-child(even){background:#f9f9f9}
.totals{margin-top:20px;padding:15px;background:#f5f5f5;border-radius:5px}
.total-row{display:flex;justify-content:space-between;padding:8px 15px;font-size:14px}
.total-row.grand{background:linear-gradient(135deg,#d4af37,#f9d423);color:#1e3c72;font-weight:900;font-size:18px;border-radius:5px;margin-top:10px}
.footer{margin-top:20px;text-align:center;padding:15px;border-top:2px solid #ddd;font-size:16px;font-weight:700;color:#1e3c72}
</style>
</head>
<body>
<div class="invoice">
<div class="header">
<div class="qr-section">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}" class="qr-code">
<div style="font-size:9px;margin-top:5px">ZATCA QR</div>
</div>
<div class="company-info">
<h1>${companySettings?.company_name || 'Company Name'}</h1>
<h2>${companySettings?.company_name_ar || 'اسم الشركة'}</h2>
<div class="info-line">📍 ${companySettings?.address || ''}, ${companySettings?.city || ''}</div>
<div class="info-line">📍 ${companySettings?.address_ar || ''}, ${companySettings?.city_ar || ''}</div>
<div class="info-line">📞 ${companySettings?.phone || ''}</div>
<div class="info-line"><strong>VAT: ${companySettings?.vat_number || ''}</strong></div>
<div class="info-line"><strong>CR: ${companySettings?.cr_number || ''}</strong></div>
</div>
<div class="customer-info" style="text-align:left;direction:ltr">
<h3 style="font-size:14px;color:#1e3c72;margin-bottom:10px">Customer Details</h3>
<div class="info-line"><strong>${customer_name}</strong></div>
</div>
</div>

<div class="invoice-title">فاتورة ضريبية / TAX INVOICE</div>

<div class="details-row">
<div class="detail-item">
<div class="detail-label">رقم الفاتورة / Invoice No</div>
<div class="detail-value">#${invoiceNo}</div>
</div>
<div class="detail-item">
<div class="detail-label">التاريخ / Date</div>
<div class="detail-value">${new Date(created_at).toLocaleDateString()}</div>
</div>
<div class="detail-item">
<div class="detail-label">الوقت / Time</div>
<div class="detail-value">${new Date(created_at).toLocaleTimeString()}</div>
</div>
</div>

<table>
<thead>
<tr>
<th>#</th>
<th>الوصف / Description</th>
<th>الكمية / Qty</th>
<th>السعر / Rate</th>
<th>المجموع / Total (Excl. VAT)</th>
</tr>
</thead>
<tbody>
${products.map((p, i) => `
<tr>
<td>${i + 1}</td>
<td>${p.name}</td>
<td>${p.qty}</td>
<td>${p.rate.toFixed(2)} SAR</td>
<td>${(p.qty * p.rate).toFixed(2)} SAR</td>
</tr>
`).join('')}
</tbody>
</table>

<div class="totals">
<div class="total-row">
<span>المجموع قبل الضريبة / Total Before Tax:</span>
<span>${subtotal.toFixed(2)} SAR</span>
</div>
<div class="total-row">
<span>ضريبة القيمة المضافة / VAT (${taxRate}%):</span>
<span>${tax.toFixed(2)} SAR</span>
</div>
<div class="total-row grand">
<span>المجموع الإجمالي / TOTAL WITH TAX:</span>
<span>${grandTotal.toFixed(2)} SAR</span>
</div>
</div>

<div class="footer">
شكراً لتعاملكم معنا / Thank You For Your Business!
</div>
</div>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

export const shareBillPDF = async (pdfUri) => {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(pdfUri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    throw new Error('Failed to share PDF: ' + error.message);
  }
};
