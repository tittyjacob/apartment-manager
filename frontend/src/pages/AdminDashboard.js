import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, DollarSign, AlertCircle, Receipt, LogOut, Users, CreditCard, CalendarDays } from 'lucide-react';
import api from '@/utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-secondary" data-testid="admin-dashboard">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" data-testid="header-logo" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="header-title">Admin Dashboard</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 tracking-tight" data-testid="overview-title">Overview</h2>
          <p className="text-muted-foreground" data-testid="overview-subtitle">Monitor your apartment association financials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card" data-testid="total-flats-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Flats</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-flats-value">{stats?.total_flats || 0}</div>
            </CardContent>
          </Card>

          <Card className="stat-card" data-testid="total-collected-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-collected-value">${stats?.total_collected?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>

          <Card className="stat-card" data-testid="pending-dues-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dues</CardTitle>
              <AlertCircle className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent" data-testid="pending-dues-value">${stats?.pending_dues?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1" data-testid="pending-count">{stats?.pending_count || 0} flats pending</p>
            </CardContent>
          </Card>

          <Card className="stat-card" data-testid="recent-payments-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Payments</CardTitle>
              <Receipt className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="recent-payments-count">{stats?.recent_payments?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card data-testid="recent-payments-list-card">
            <CardHeader>
              <CardTitle data-testid="recent-payments-list-title">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recent_payments && stats.recent_payments.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0" data-testid={`payment-item-${payment.id}`}>
                      <div>
                        <p className="font-medium" data-testid={`payment-flat-${payment.id}`}>Flat {payment.flat_number}</p>
                        <p className="text-sm text-muted-foreground" data-testid={`payment-receipt-${payment.id}`}>{payment.receipt_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary" data-testid={`payment-amount-${payment.id}`}>${payment.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`payment-method-${payment.id}`}>{payment.payment_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="no-payments-msg">No recent payments</p>
              )}
            </CardContent>
          </Card>

          <Card data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle data-testid="quick-actions-title">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={() => navigate('/flats')} data-testid="manage-flats-btn">
                <Users className="h-4 w-4 mr-2" />
                Manage Flats
              </Button>
              <Button className="w-full justify-start" onClick={() => navigate('/charges')} data-testid="set-charges-btn">
                <DollarSign className="h-4 w-4 mr-2" />
                Set Monthly Charges
              </Button>
              <Button className="w-full justify-start" onClick={() => navigate('/payments')} data-testid="record-payment-btn">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
