import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Plus, ArrowLeft, Calendar } from 'lucide-react';
import api from '@/utils/api';

export default function MonthlyCharges() {
  const navigate = useNavigate();
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_charge: '',
    water: '',
    security: '',
    maintenance: '',
    repairs: ''
  });

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      const { data } = await api.get('/charges');
      setCharges(data);
    } catch (error) {
      toast.error('Failed to load charges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const breakdown = {
        water: parseFloat(formData.water) || 0,
        security: parseFloat(formData.security) || 0,
        maintenance: parseFloat(formData.maintenance) || 0,
        repairs: parseFloat(formData.repairs) || 0
      };
      
      const submitData = {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        base_charge: parseFloat(formData.base_charge),
        breakdown
      };
      
      await api.post('/charges', submitData);
      toast.success('Monthly charges set successfully');
      setDialogOpen(false);
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        base_charge: '',
        water: '',
        security: '',
        maintenance: '',
        repairs: ''
      });
      fetchCharges();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to set charges');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-secondary" data-testid="monthly-charges-page">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-btn">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="page-title">Monthly Charges</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="set-charges-btn">
                <Plus className="h-4 w-4 mr-2" />
                Set Charges
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="charges-dialog">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">Set Monthly Charges</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="charges-form">
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
                  <Label htmlFor="base_charge">Base Charge ($)</Label>
                  <Input
                    id="base_charge"
                    type="number"
                    step="0.01"
                    value={formData.base_charge}
                    onChange={(e) => setFormData({ ...formData, base_charge: e.target.value })}
                    required
                    data-testid="base-charge-input"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Breakdown (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="water" className="text-sm">Water</Label>
                      <Input
                        id="water"
                        type="number"
                        step="0.01"
                        value={formData.water}
                        onChange={(e) => setFormData({ ...formData, water: e.target.value })}
                        data-testid="water-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="security" className="text-sm">Security</Label>
                      <Input
                        id="security"
                        type="number"
                        step="0.01"
                        value={formData.security}
                        onChange={(e) => setFormData({ ...formData, security: e.target.value })}
                        data-testid="security-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maintenance" className="text-sm">Maintenance</Label>
                      <Input
                        id="maintenance"
                        type="number"
                        step="0.01"
                        value={formData.maintenance}
                        onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                        data-testid="maintenance-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="repairs" className="text-sm">Repairs</Label>
                      <Input
                        id="repairs"
                        type="number"
                        step="0.01"
                        value={formData.repairs}
                        onChange={(e) => setFormData({ ...formData, repairs: e.target.value })}
                        data-testid="repairs-input"
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" data-testid="submit-charges-btn">
                  Set Charges
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="page-container py-8">
        {loading ? (
          <div className="text-center py-12" data-testid="loading-indicator">Loading...</div>
        ) : charges.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center" data-testid="no-charges-msg">
              <p className="text-muted-foreground">No charges set yet. Click "Set Charges" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charges.map((charge) => (
              <Card key={charge.id} className="stat-card" data-testid={`charge-card-${charge.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between" data-testid={`charge-title-${charge.id}`}>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {monthNames[charge.month - 1]} {charge.year}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Charge</p>
                      <p className="text-2xl font-bold text-primary" data-testid={`base-charge-${charge.id}`}>${charge.base_charge.toFixed(2)}</p>
                    </div>
                    {charge.breakdown && Object.keys(charge.breakdown).length > 0 && (
                      <div className="border-t pt-3" data-testid={`breakdown-${charge.id}`}>
                        <p className="text-sm font-medium mb-2">Breakdown</p>
                        <div className="space-y-1">
                          {Object.entries(charge.breakdown).map(([key, value]) => (
                            value > 0 && (
                              <div key={key} className="flex justify-between text-sm" data-testid={`breakdown-item-${charge.id}-${key}`}>
                                <span className="text-muted-foreground capitalize">{key}</span>
                                <span className="font-medium">${Number(value).toFixed(2)}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
