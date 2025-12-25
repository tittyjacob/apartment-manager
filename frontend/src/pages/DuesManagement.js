import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, ArrowLeft, DollarSign } from 'lucide-react';
import api from '@/utils/api';

export default function DuesManagement() {
  const navigate = useNavigate();
  const [flats, setFlats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flatsRes, paymentsRes, chargesRes] = await Promise.all([
        api.get('/flats'),
        api.get('/payments'),
        api.get('/charges')
      ]);
      setFlats(flatsRes.data);
      setPayments(paymentsRes.data);
      setCharges(chargesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCharge = () => {
    return charges.find(c => c.month === selectedMonth && c.year === selectedYear);
  };

  const getPaymentStatus = (flatId) => {
    return payments.find(
      p => p.flat_id === flatId && 
           p.month === selectedMonth && 
           p.year === selectedYear && 
           p.status === 'paid'
    );
  };

  const getDueAmount = (flat) => {
    const currentCharge = getCurrentCharge();
    if (!currentCharge) return 0;
    return flat.custom_charge || currentCharge.base_charge;
  };

  const handleRecordPayment = async () => {
    if (!selectedFlat) return;
    
    try {
      const submitData = {
        flat_id: selectedFlat.id,
        month: selectedMonth,
        year: selectedYear,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod
      };
      
      await api.post('/payments', submitData);
      toast.success('Payment recorded successfully');
      setDialogOpen(false);
      setSelectedFlat(null);
      setPaymentAmount('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const duesData = flats.map(flat => {
    const payment = getPaymentStatus(flat.id);
    const dueAmount = getDueAmount(flat);
    return {
      ...flat,
      dueAmount,
      isPaid: !!payment,
      payment
    };
  });

  const totalDues = duesData.reduce((sum, d) => sum + d.dueAmount, 0);
  const totalCollected = duesData.filter(d => d.isPaid).reduce((sum, d) => sum + d.dueAmount, 0);
  const totalPending = totalDues - totalCollected;
  const pendingCount = duesData.filter(d => !d.isPaid).length;

  return (
    <div className="min-h-screen bg-secondary" data-testid="dues-management-page">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-btn">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="page-title">Dues Management</h1>
          </div>
        </div>
      </header>

      <main className="page-container py-8">
        <Card className="mb-6" data-testid="filter-card">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="month">Month</Label>
                <select
                  id="month"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  data-testid="month-select"
                >
                  {monthNames.map((name, index) => (
                    <option key={index + 1} value={index + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  data-testid="year-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="stat-card" data-testid="total-dues-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Dues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-dues-value">${totalDues.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="stat-card" data-testid="collected-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" data-testid="collected-value">${totalCollected.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="stat-card" data-testid="pending-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent" data-testid="pending-value">${totalPending.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="stat-card" data-testid="pending-count-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Flats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="pending-count-value">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12" data-testid="loading-indicator">Loading...</div>
        ) : !getCurrentCharge() ? (
          <Card>
            <CardContent className="py-12 text-center" data-testid="no-charges-msg">
              <p className="text-muted-foreground">No charges set for {monthNames[selectedMonth - 1]} {selectedYear}.</p>
              <Button className="mt-4" onClick={() => navigate('/charges')} data-testid="set-charges-btn">
                Set Charges
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="dues-table-card">
            <CardHeader>
              <CardTitle data-testid="table-title">
                Dues for {monthNames[selectedMonth - 1]} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="dues-table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Flat</th>
                      <th className="text-left py-3 px-4">Owner</th>
                      <th className="text-left py-3 px-4">Due Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duesData.map((item) => (
                      <tr key={item.id} className="border-b last:border-0" data-testid={`dues-row-${item.id}`}>
                        <td className="py-3 px-4 font-medium" data-testid={`flat-number-${item.id}`}>
                          Flat {item.flat_number}
                        </td>
                        <td className="py-3 px-4" data-testid={`owner-name-${item.id}`}>
                          {item.owner_name}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary" data-testid={`due-amount-${item.id}`}>
                          ${item.dueAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4" data-testid={`status-${item.id}`}>
                          {item.isPaid ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span>Paid</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-accent">
                              <AlertCircle className="h-5 w-5" />
                              <span>Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {!item.isPaid && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedFlat(item);
                                setPaymentAmount(item.dueAmount.toString());
                                setDialogOpen(true);
                              }}
                              data-testid={`record-payment-${item.id}`}
                            >
                              Record Payment
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="payment-dialog">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title">Record Payment</DialogTitle>
          </DialogHeader>
          {selectedFlat && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Flat</p>
                <p className="font-medium" data-testid="dialog-flat">Flat {selectedFlat.flat_number} - {selectedFlat.owner_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Month/Year</p>
                <p className="font-medium" data-testid="dialog-period">{monthNames[selectedMonth - 1]} {selectedYear}</p>
              </div>
              <div>
                <Label htmlFor="payment_amount">Amount ($)</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  data-testid="payment-amount-input"
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <select
                  id="payment_method"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  data-testid="payment-method-select"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="stripe">Online Payment</option>
                </select>
              </div>
              <Button onClick={handleRecordPayment} className="w-full" data-testid="submit-payment-btn">
                Record Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
