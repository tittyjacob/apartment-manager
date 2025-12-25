import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, ArrowLeft } from 'lucide-react';
import api from '@/utils/api';

export default function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    flat_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, flatsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/flats')
      ]);
      setPayments(paymentsRes.data);
      setFlats(flatsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        flat_id: formData.flat_id,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method
      };
      
      await api.post('/payments', submitData);
      toast.success('Payment recorded successfully');
      setDialogOpen(false);
      setFormData({
        flat_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: '',
        payment_method: 'cash'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-secondary" data-testid="payments-page">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-btn">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="page-title">Payments</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="record-payment-btn">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="payment-dialog">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="payment-form">
                <div>
                  <Label htmlFor="flat_id">Flat</Label>
                  <select
                    id="flat_id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.flat_id}
                    onChange={(e) => setFormData({ ...formData, flat_id: e.target.value })}
                    required
                    data-testid="flat-select"
                  >
                    <option value="">Select a flat</option>
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        Flat {flat.flat_number} - {flat.owner_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <select
                      id="month"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      data-testid="month-select"
                    >
                      {monthNames.map((name, index) => (
                        <option key={index + 1} value={index + 1}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                      data-testid="year-input"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    data-testid="amount-input"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <select
                    id="payment_method"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    data-testid="payment-method-select"
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="stripe">Online Payment</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" data-testid="submit-payment-btn">
                  Record Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="page-container py-8">
        {loading ? (
          <div className="text-center py-12" data-testid="loading-indicator">Loading...</div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center" data-testid="no-payments-msg">
              <p className="text-muted-foreground">No payments recorded yet. Click "Record Payment" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="payments-table-card">
            <CardHeader>
              <CardTitle data-testid="table-title">Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="payments-table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Flat</th>
                      <th className="text-left py-3 px-4">Month</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Receipt</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0" data-testid={`payment-row-${payment.id}`}>
                        <td className="py-3 px-4" data-testid={`flat-${payment.id}`}>Flat {payment.flat_number}</td>
                        <td className="py-3 px-4" data-testid={`month-${payment.id}`}>
                          {monthNames[payment.month - 1]} {payment.year}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary" data-testid={`amount-${payment.id}`}>
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 capitalize" data-testid={`method-${payment.id}`}>
                          {payment.payment_method.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm" data-testid={`receipt-${payment.id}`}>
                          {payment.receipt_number}
                        </td>
                        <td className="py-3 px-4 text-sm" data-testid={`date-${payment.id}`}>
                          {new Date(payment.payment_date).toLocaleDateString()}
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
    </div>
  );
}
