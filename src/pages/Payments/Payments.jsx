import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../services/analytics';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import { PAGINATION } from '../../utils/constants';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [centerInfo, setCenterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: PAGINATION.DEFAULT_PAGE,
    size: PAGINATION.DEFAULT_SIZE,
    total: 0
  });

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load payments and center info
      const [paymentsResponse, centerResponse] = await Promise.all([
        analyticsService.getPayments(pagination.page, pagination.size),
        analyticsService.center.getInfo()
      ]);
      
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data.items || []);
        setPagination(prev => ({
          ...prev,
          page: paymentsResponse.data.page || pagination.page,
          total: paymentsResponse.data.total || 0
        }));
      } else {
        setError('Failed to load payment history');
      }
      
      if (centerResponse.success) {
        setCenterInfo(centerResponse.data);
      }
      
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' UZS';
  };

  const getStatusBadge = (daysRemaining) => {
    if (daysRemaining > 30) {
      return <span className="status-badge status-active">Active</span>;
    } else if (daysRemaining > 7) {
      return <span className="status-badge status-warning">Expiring Soon</span>;
    } else if (daysRemaining > 0) {
      return <span className="status-badge status-critical">Critical</span>;
    } else {
      return <span className="status-badge status-expired">Expired</span>;
    }
  };

  const columns = [
    {
      key: 'id',
      title: 'Payment ID',
      width: '100px',
      render: (value) => `#${value}`
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="payment-amount">{formatAmount(value)}</span>
      )
    },
    {
      key: 'days_added',
      title: 'Days Added',
      render: (value) => (
        <span className="days-added">{value} days</span>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="payment-description">
          {value || 'Payment transaction'}
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Date',
      render: (value) => formatDate(value)
    }
  ];

  if (loading && payments.length === 0) {
    return <LoadingSpinner message="Loading payment history..." />;
  }

  return (
    <div className="payments-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadInitialData()}>
            Retry
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Payments & Subscription</h2>
          <p>View payment history and manage your learning center subscription</p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadInitialData()}>
          Refresh
        </button>
      </div>

      {/* Subscription Status */}
      {centerInfo && (
        <div className="subscription-section">
          <div className="subscription-card">
            <div className="card-header">
              <h3>Subscription Status</h3>
              {getStatusBadge(centerInfo.days_remaining)}
            </div>
            
            <div className="subscription-details">
              <div className="subscription-grid">
                <div className="subscription-item">
                  <div className="subscription-label">Center Name</div>
                  <div className="subscription-value">{centerInfo.title}</div>
                </div>
                <div className="subscription-item">
                  <div className="subscription-label">Student Limit</div>
                  <div className="subscription-value">{centerInfo.student_limit} students</div>
                </div>
                <div className="subscription-item">
                  <div className="subscription-label">Days Remaining</div>
                  <div className={`subscription-value ${centerInfo.days_remaining < 7 ? 'critical' : ''}`}>
                    {centerInfo.days_remaining} days
                  </div>
                </div>
                <div className="subscription-item">
                  <div className="subscription-label">Status</div>
                  <div className="subscription-value">
                    {centerInfo.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              
              {centerInfo.days_remaining < 7 && (
                <div className="subscription-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <div className="warning-title">Subscription Expiring Soon</div>
                    <div className="warning-message">
                      Your subscription will expire in {centerInfo.days_remaining} days. 
                      Please contact support to renew your subscription.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="payments-section">
        <div className="payments-card">
          <div className="card-header">
            <h3>Payment History</h3>
            <span className="card-subtitle">All subscription payments and transactions</span>
          </div>
          
          <div className="payments-content">
            <Table 
              columns={columns}
              data={payments}
              loading={loading}
              emptyMessage="No payment history found."
            />

            {pagination.total > pagination.size && (
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                itemsPerPage={pagination.size}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      {payments.length > 0 && (
        <div className="summary-section">
          <div className="summary-card">
            <div className="card-header">
              <h3>Payment Summary</h3>
            </div>
            
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon">💰</div>
                <div className="summary-content">
                  <div className="summary-number">
                    {formatAmount(
                      payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
                    )}
                  </div>
                  <div className="summary-label">Total Paid</div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">📅</div>
                <div className="summary-content">
                  <div className="summary-number">
                    {payments.reduce((sum, payment) => sum + (payment.days_added || 0), 0)}
                  </div>
                  <div className="summary-label">Total Days Added</div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">📊</div>
                <div className="summary-content">
                  <div className="summary-number">{payments.length}</div>
                  <div className="summary-label">Total Transactions</div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">📈</div>
                <div className="summary-content">
                  <div className="summary-number">
                    {payments.length > 0 
                      ? formatAmount(payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length)
                      : formatAmount(0)
                    }
                  </div>
                  <div className="summary-label">Average Payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="support-section">
        <div className="support-card">
          <div className="support-content">
            <div className="support-icon">💬</div>
            <div className="support-text">
              <h4>Need Help with Payments?</h4>
              <p>Contact our support team for payment issues or subscription questions.</p>
            </div>
            <button className="btn btn-primary">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;