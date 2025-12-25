import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRazorpay } from 'react-razorpay';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, DollarSign, Receipt, LogOut, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/utils/api';

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const [Razorpay] = useRazorpay();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard/resident');
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentDialogOpen(true);
  };

  const handleStripePayment = async () => {
    setPaying(true);
    setPaymentDialogOpen(false);
    try {
      const currentDate = new Date();
      const checkoutData = {
        flat_id: dashboardData.flat.id,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        origin_url: window.location.origin
      };
      
      const { data } = await api.post('/payments/checkout', checkoutData);
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to initiate Stripe payment');
      setPaying(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);
    setPaymentDialogOpen(false);
    try {
      const currentDate = new Date();
      const orderData = {
        flat_id: dashboardData.flat.id,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };
      
      const { data } = await api.post('/payments/razorpay/create-order', orderData);
      
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'Apartment Maintenance',
        description: `Payment for ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
        handler: async (response) => {
          try {
            await api.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              flat_id: orderData.flat_id,
              month: orderData.month,
              year: orderData.year
            });
            toast.success('Payment successful!');
            fetchDashboard();
            setPaying(false);
          } catch (error) {
            toast.error('Payment verification failed');
            setPaying(false);
          }
        },
        prefill: {
          name: dashboardData.flat.owner_name,
          email: dashboardData.flat.owner_email,
          contact: dashboardData.flat.owner_phone
        },
        theme: {
          color: '#1A4D2E'
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPaying(false);
      });
      razorpayInstance.open();
    } catch (error) {
      toast.error('Failed to initiate Razorpay payment');
      setPaying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg" data-testid="loading-indicator">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary" data-testid="resident-dashboard">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" data-testid="header-logo" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="header-title">My Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground" data-testid="user-name">Welcome, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="page-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-8">
          <div className="col-span-full md:col-span-8">
            <Card className="mb-6" data-testid="flat-info-card">
              <CardHeader>
                <CardTitle data-testid="flat-info-title">Your Flat</CardTitle>
                <CardDescription data-testid="flat-number">Flat {dashboardData?.flat?.flat_number}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Owner Name</p>
                    <p className="font-medium" data-testid="owner-name">{dashboardData?.flat?.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Flat Size</p>
                    <p className="font-medium" data-testid="flat-size">{dashboardData?.flat?.flat_size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium" data-testid="owner-email">{dashboardData?.flat?.owner_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium" data-testid="owner-phone">{dashboardData?.flat?.owner_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="current-month-card">
              <CardHeader>
                <CardTitle data-testid="current-month-title">Current Month Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className="text-4xl font-bold" data-testid="amount-due">${dashboardData?.current_due?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    {dashboardData?.payment_status === 'paid' ? (
                      <div className="flex items-center gap-2 text-green-600" data-testid="paid-status">
                        <CheckCircle className="h-8 w-8" />
                        <span className="font-medium">Paid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-accent" data-testid="pending-status">
                        <AlertCircle className="h-8 w-8" />
                        <span className="font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                </div>

                {dashboardData?.payment_status === 'pending' && (
                  <Button className="w-full" size="lg" onClick={handlePayment} disabled={paying} data-testid="pay-now-btn">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {paying ? 'Processing...' : 'Pay Now'}
                  </Button>
                )}

                {dashboardData?.current_charge_breakdown && Object.keys(dashboardData.current_charge_breakdown).length > 0 && (
                  <div className="mt-6" data-testid="charge-breakdown">
                    <h4 className="font-medium mb-3">Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(dashboardData.current_charge_breakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm" data-testid={`breakdown-${key}`}>
                          <span className="text-muted-foreground capitalize">{key}</span>
                          <span className="font-medium">${Number(value).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-full md:col-span-8 lg:col-span-4">
            <Card data-testid="payment-history-card">
              <CardHeader>
                <CardTitle data-testid="payment-history-title">
                  <Receipt className="h-5 w-5 inline mr-2" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.payment_history && dashboardData.payment_history.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.payment_history.map((payment) => (
                      <div key={payment.id} className="border-b pb-3 last:border-0" data-testid={`history-item-${payment.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium" data-testid={`history-month-${payment.id}`}>
                              {new Date(payment.year, payment.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`history-receipt-${payment.id}`}>{payment.receipt_number}</p>
                          </div>
                          <p className="font-bold text-primary" data-testid={`history-amount-${payment.id}`}>${payment.amount.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`history-date-${payment.id}`}>
                          Paid on {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8" data-testid="no-history-msg">No payment history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
