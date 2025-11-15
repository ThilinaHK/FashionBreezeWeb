'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportData {
  sales?: any[];
  products?: any[];
  customers?: any[];
  inventory?: any[];
  summary?: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    lowStockProducts: number;
  };
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/reports?${params}`);
      const result = await response.json();

      if (result.success) {
        setReportData({ [reportType]: result.data });
        toast.success('Report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      toast.error('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = reportData[reportType as keyof ReportData];
    if (!data) return;

    let worksheetData: any[] = [];
    let filename = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    switch (reportType) {
      case 'sales':
        worksheetData = (data as any[]).map(order => ({
          'Order ID': order._id,
          'Customer Name': order.customerId?.name || 'N/A',
          'Customer Email': order.customerId?.email || 'N/A',
          'Total Amount': `LKR ${order.totalAmount}`,
          'Status': order.status,
          'Payment Method': order.paymentMethod,
          'Date': format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')
        }));
        break;

      case 'products':
        worksheetData = (data as any[]).map(product => ({
          'Product Code': product.productCode,
          'Name': product.name,
          'Category': product.category,
          'Subcategory': product.subcategory,
          'Price': `LKR ${product.price}`,
          'Stock': product.totalStock,
          'Status': product.status
        }));
        break;

      case 'customers':
        worksheetData = (data as any[]).map(customer => ({
          'Name': customer.name,
          'Email': customer.email,
          'Phone': customer.phone,
          'Address': customer.address,
          'Registration Date': format(new Date(customer.createdAt), 'yyyy-MM-dd')
        }));
        break;

      case 'inventory':
        worksheetData = (data as any[]).map(product => ({
          'Product Code': product.productCode,
          'Name': product.name,
          'Category': product.category,
          'Subcategory': product.subcategory,
          'Total Stock': product.totalStock,
          'Status': product.status
        }));
        break;
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
    XLSX.writeFile(workbook, filename);
    toast.success('Excel file downloaded successfully');
  };

  const exportToPDF = () => {
    const data = reportData[reportType as keyof ReportData];
    if (!data) return;

    const doc = new jsPDF();
    const pageTitle = `${reportType.toUpperCase()} REPORT`;
    
    doc.setFontSize(20);
    doc.text(pageTitle, 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 30);

    let tableData: any[] = [];
    let headers: string[] = [];

    switch (reportType) {
      case 'sales':
        headers = ['Order ID', 'Customer', 'Amount', 'Status', 'Date'];
        tableData = (data as any[]).map(order => [
          order._id.slice(-8),
          order.customerId?.name || 'N/A',
          `LKR ${order.totalAmount}`,
          order.status,
          format(new Date(order.createdAt), 'yyyy-MM-dd')
        ]);
        break;

      case 'products':
        headers = ['Code', 'Name', 'Category', 'Price', 'Stock'];
        tableData = (data as any[]).map(product => [
          product.productCode,
          product.name,
          product.category,
          `LKR ${product.price}`,
          product.totalStock
        ]);
        break;

      case 'customers':
        headers = ['Name', 'Email', 'Phone', 'Registration'];
        tableData = (data as any[]).map(customer => [
          customer.name,
          customer.email,
          customer.phone,
          format(new Date(customer.createdAt), 'yyyy-MM-dd')
        ]);
        break;

      case 'inventory':
        headers = ['Code', 'Name', 'Category', 'Stock', 'Status'];
        tableData = (data as any[]).map(product => [
          product.productCode,
          product.name,
          product.category,
          product.totalStock,
          product.status
        ]);
        break;
    }

    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    doc.save(`${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF file downloaded successfully');
  };

  const renderSummaryReport = () => {
    const summary = reportData.summary;
    if (!summary) return null;

    return (
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <h2>{summary.totalOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <h2>LKR {summary.totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Total Products</h5>
              <h2>{summary.totalProducts}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Total Customers</h5>
              <h2>{summary.totalCustomers}</h2>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Low Stock Products</h5>
              <h2>{summary.lowStockProducts}</h2>
              <small>Products with less than 10 items in stock</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="row"
      >
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Reports & Analytics
              </h4>
            </div>
            <div className="card-body">
              {/* Report Controls */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <label className="form-label">Report Type</label>
                  <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="summary">Summary</option>
                    <option value="sales">Sales Report</option>
                    <option value="products">Products Report</option>
                    <option value="customers">Customers Report</option>
                    <option value="inventory">Inventory Report</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-primary me-2"
                    onClick={generateReport}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>

              {/* Export Buttons */}
              {reportData[reportType as keyof ReportData] && (
                <div className="mb-4">
                  <button
                    className="btn btn-success me-2"
                    onClick={exportToExcel}
                  >
                    <i className="bi bi-file-earmark-excel me-1"></i>
                    Export Excel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={exportToPDF}
                  >
                    <i className="bi bi-file-earmark-pdf me-1"></i>
                    Export PDF
                  </button>
                </div>
              )}

              {/* Report Content */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div>
                  {reportType === 'summary' && renderSummaryReport()}
                  
                  {reportType !== 'summary' && reportData[reportType as keyof ReportData] && (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead className="table-dark">
                          <tr>
                            {reportType === 'sales' && (
                              <>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                              </>
                            )}
                            {reportType === 'products' && (
                              <>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                              </>
                            )}
                            {reportType === 'customers' && (
                              <>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Registration</th>
                              </>
                            )}
                            {reportType === 'inventory' && (
                              <>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Status</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {(reportData[reportType as keyof ReportData] as any[])?.map((item, index) => (
                            <tr key={index}>
                              {reportType === 'sales' && (
                                <>
                                  <td>{item._id.slice(-8)}</td>
                                  <td>{item.customerId?.name || 'N/A'}</td>
                                  <td>LKR {item.totalAmount}</td>
                                  <td>
                                    <span className={`badge bg-${item.status === 'delivered' ? 'success' : item.status === 'pending' ? 'warning' : 'info'}`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td>{format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                                </>
                              )}
                              {reportType === 'products' && (
                                <>
                                  <td>{item.productCode}</td>
                                  <td>{item.name}</td>
                                  <td>{item.category}</td>
                                  <td>LKR {item.price}</td>
                                  <td>{item.totalStock}</td>
                                </>
                              )}
                              {reportType === 'customers' && (
                                <>
                                  <td>{item.name}</td>
                                  <td>{item.email}</td>
                                  <td>{item.phone}</td>
                                  <td>{format(new Date(item.createdAt), 'yyyy-MM-dd')}</td>
                                </>
                              )}
                              {reportType === 'inventory' && (
                                <>
                                  <td>{item.productCode}</td>
                                  <td>{item.name}</td>
                                  <td>{item.category}</td>
                                  <td>{item.totalStock}</td>
                                  <td>
                                    <span className={`badge bg-${item.status === 'active' ? 'success' : 'danger'}`}>
                                      {item.status}
                                    </span>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}