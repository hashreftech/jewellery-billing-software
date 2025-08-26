import { type InvoiceItemData, type CompanyInfo, calculateItemTotal, formatCurrency, formatWeight } from "@shared/invoice-utils";

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  billDate: string;
  dueDate?: string;
  billerName?: string;
  company: CompanyInfo;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
  items: InvoiceItemData[];
  totals: {
    subTotal: number;
    totalMakingCharges: number;
    makingChargeDiscount: number;
    makingChargeDiscountPercentage: number;
    totalGoldGrossWeight: number;
    goldValueDiscountPerGram: number;
    totalGoldValueDiscount: number;
    totalDiscountAmount: number;
    totalAmount: number;
    advanceAmount: number;
    grandTotal: number;
  };
  paymentDetails?: {
    method: string;
    reference?: string;
    amount: number;
    date: string;
  }[];
}

export function generateInvoiceHTML(invoice: InvoiceData): string {
  const itemsHTML = invoice.items.map((item, index) => {
    const itemCalc = calculateItemTotal(item);
    return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.purity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.goldRatePerGram)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatWeight(item.netWeight)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatWeight(item.grossWeight)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.labourRatePerGram}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.additionalCost)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.gstPercentage}%</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(itemCalc.totalPrice)}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice - ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          border: 2px solid #333;
          padding: 15px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        }
        .header-title {
          background: #d4a574;
          color: white;
          text-align: center;
          padding: 10px;
          font-size: 24px;
          font-weight: bold;
          margin: -15px -15px 15px -15px;
        }
        .company-info {
          float: left;
          width: 60%;
        }
        .logo-section {
          float: right;
          width: 35%;
          text-align: center;
          background: #fffacd;
          padding: 20px;
          border: 1px solid #ddd;
        }
        .bill-details {
          clear: both;
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }
        .bill-to, .bill-info {
          width: 48%;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background: #4a6fa5;
          color: white;
          padding: 10px 8px;
          text-align: center;
          font-size: 12px;
          border: 1px solid #ddd;
        }
        .items-table td {
          font-size: 11px;
        }
        .totals-section {
          float: right;
          width: 50%;
          margin-top: 20px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .totals-row.highlight {
          background: #fff9c4;
          font-weight: bold;
          padding: 8px;
        }
        .footer {
          clear: both;
          margin-top: 40px;
          text-align: center;
          border-top: 2px solid #333;
          padding-top: 15px;
        }
        .signature-section {
          margin: 30px 0;
          border: 1px solid #ddd;
          padding: 15px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-title">Tax Invoice</div>
          <div class="company-info">
            <strong>Company Name:</strong> ${invoice.company.companyName}<br>
            <strong>Address:</strong> ${invoice.company.address}<br><br>
            <strong>GSTN:</strong> ${invoice.company.gstNumber}<br>
            <strong>Website:</strong> ${invoice.company.website || 'N/A'}
          </div>
          <div class="logo-section">
            <div style="font-size: 36px; font-weight: bold; color: #666;">Logo</div>
          </div>
          <div style="clear: both;"></div>
        </div>

        <!-- Bill Details -->
        <div class="bill-details">
          <div class="bill-to">
            <strong>Bill To:</strong><br>
            <strong>Name of Client:</strong> ${invoice.customer.name}<br>
            <strong>Email:</strong> ${invoice.customer.email || 'N/A'}<br>
            <strong>Phone:</strong> ${invoice.customer.phone}<br>
            <strong>Address:</strong> ${invoice.customer.address || 'N/A'}
          </div>
          <div class="bill-info">
            <strong>Bill No.:</strong> ${invoice.invoiceNumber}<br>
            <strong>Bill Date:</strong> ${invoice.billDate}<br>
            <strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}<br>
            <strong>Biller Name:</strong> ${invoice.billerName || 'N/A'}
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Item Name</th>
              <th>Purity</th>
              <th>Gold Rate/Gm</th>
              <th>Net weight (gm)</th>
              <th>Gross weight (gm)</th>
              <th>Labour Rate/gm</th>
              <th>Additional Cost</th>
              <th>GST</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-row highlight">
            <span>Sub-total Including GST</span>
            <span>${formatCurrency(invoice.totals.subTotal)}</span>
          </div>
          <div class="totals-row">
            <span>Making Charges</span>
            <span>${formatCurrency(invoice.totals.totalMakingCharges)}</span>
          </div>
          <div class="totals-row">
            <span>Discount On Making Charges @ ${invoice.totals.makingChargeDiscountPercentage}%</span>
            <span>${formatCurrency(invoice.totals.makingChargeDiscount)}</span>
          </div>
          <div class="totals-row">
            <span><strong>Total Gold Gross weight (gm)</strong></span>
            <span><strong>${formatWeight(invoice.totals.totalGoldGrossWeight)}</strong></span>
          </div>
          <div class="totals-row">
            <span>Discount On Gold Value per gm @ Rs ${invoice.totals.goldValueDiscountPerGram}</span>
            <span>${formatCurrency(invoice.totals.totalGoldValueDiscount)}</span>
          </div>
          <div class="totals-row">
            <span><strong>Total Discount Amount</strong></span>
            <span><strong>${formatCurrency(invoice.totals.totalDiscountAmount)}</strong></span>
          </div>
          <div class="totals-row highlight">
            <span><strong>Total</strong></span>
            <span><strong>${formatCurrency(invoice.totals.totalAmount)}</strong></span>
          </div>
          <div class="totals-row">
            <span>Amount Paid in Advance</span>
            <span>${formatCurrency(invoice.totals.advanceAmount)}</span>
          </div>
          <div class="totals-row highlight" style="font-size: 16px;">
            <span><strong>Grand Total</strong></span>
            <span><strong>${formatCurrency(invoice.totals.grandTotal)}</strong></span>
          </div>
        </div>

        <div style="clear: both;"></div>

        <!-- Signature Section -->
        <div class="signature-section">
          <strong>Business Signature</strong><br><br>
          <div style="height: 40px;"></div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="background: #d4a574; color: white; padding: 10px; margin: 20px 0;">
            <strong>${invoice.company.invoiceTerms || 'Thanks for business with us!!! Please visit us again !!!'}</strong>
          </div>
          <div>
            <strong>Contact Details</strong><br>
            <strong>Phone Number:</strong> ${invoice.company.phone}<br>
            <strong>Email Id:</strong> ${invoice.company.email}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInvoiceText(invoice: InvoiceData): string {
  const separator = "=".repeat(80);
  const items = invoice.items.map((item, index) => {
    const itemCalc = calculateItemTotal(item);
    return `${index + 1}. ${item.productName} (${item.purity})
   Gold Rate: ${formatCurrency(item.goldRatePerGram)}/gm | Net: ${formatWeight(item.netWeight)} | Gross: ${formatWeight(item.grossWeight)}
   Labour: ${item.labourRatePerGram}/gm | Additional: ${formatCurrency(item.additionalCost)} | GST: ${item.gstPercentage}%
   Total: ${formatCurrency(itemCalc.totalPrice)}`;
  }).join('\n\n');

  return `
${separator}
                               TAX INVOICE
${separator}

${invoice.company.companyName}
${invoice.company.address}
GSTN: ${invoice.company.gstNumber}
Phone: ${invoice.company.phone} | Email: ${invoice.company.email}

${separator}

Bill No: ${invoice.invoiceNumber}               Order No: ${invoice.orderNumber}
Bill Date: ${invoice.billDate}                 Due Date: ${invoice.dueDate || 'N/A'}
Biller: ${invoice.billerName || 'N/A'}

Bill To:
${invoice.customer.name}
${invoice.customer.phone}
${invoice.customer.email || ''}
${invoice.customer.address || ''}

${separator}
                                ITEMS
${separator}

${items}

${separator}
                               SUMMARY
${separator}

Sub-total Including GST:                    ${formatCurrency(invoice.totals.subTotal)}
Making Charges:                             ${formatCurrency(invoice.totals.totalMakingCharges)}
Discount On Making Charges @ ${invoice.totals.makingChargeDiscountPercentage}%:        ${formatCurrency(invoice.totals.makingChargeDiscount)}
Total Gold Gross Weight:                    ${formatWeight(invoice.totals.totalGoldGrossWeight)}
Discount On Gold Value @ Rs ${invoice.totals.goldValueDiscountPerGram}/gm:        ${formatCurrency(invoice.totals.totalGoldValueDiscount)}
Total Discount Amount:                      ${formatCurrency(invoice.totals.totalDiscountAmount)}
Total:                                      ${formatCurrency(invoice.totals.totalAmount)}
Amount Paid in Advance:                     ${formatCurrency(invoice.totals.advanceAmount)}
GRAND TOTAL:                                ${formatCurrency(invoice.totals.grandTotal)}

${separator}

${invoice.company.invoiceTerms || 'Thanks for business with us!!! Please visit us again !!!'}

${separator}
  `;
}
