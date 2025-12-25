import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import api from '@/utils/api';

export default function FlatsManagement() {
  const navigate = useNavigate();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [formData, setFormData] = useState({
    flat_number: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    flat_size: '',
    custom_charge: ''
  });

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      const { data } = await api.get('/flats');
      setFlats(data);
    } catch (error) {
      toast.error('Failed to load flats');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        custom_charge: formData.custom_charge ? parseFloat(formData.custom_charge) : null
      };
      
      if (editingFlat) {
        await api.put(`/flats/${editingFlat.id}`, submitData);
        toast.success('Flat updated successfully');
      } else {
        await api.post('/flats', submitData);
        toast.success('Flat added successfully');
      }
      
      setDialogOpen(false);
      setEditingFlat(null);
      setFormData({
        flat_number: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        flat_size: '',
        custom_charge: ''
      });
      fetchFlats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (flat) => {
    setEditingFlat(flat);
    setFormData({
      flat_number: flat.flat_number,
      owner_name: flat.owner_name,
      owner_email: flat.owner_email,
      owner_phone: flat.owner_phone,
      flat_size: flat.flat_size,
      custom_charge: flat.custom_charge || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flat?')) return;
    
    try {
      await api.delete(`/flats/${id}`);
      toast.success('Flat deleted successfully');
      fetchFlats();
    } catch (error) {
      toast.error('Failed to delete flat');
    }
  };

  return (
    <div className="min-h-screen bg-secondary" data-testid="flats-management-page">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-btn">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="page-title">Flats Management</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingFlat(null);
                setFormData({
                  flat_number: '',
                  owner_name: '',
                  owner_email: '',
                  owner_phone: '',
                  flat_size: '',
                  custom_charge: ''
                });
              }} data-testid="add-flat-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Flat
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="flat-dialog">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">{editingFlat ? 'Edit Flat' : 'Add New Flat'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="flat-form">
                <div>
                  <Label htmlFor="flat_number">Flat Number</Label>
                  <Input
                    id="flat_number"
                    value={formData.flat_number}
                    onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
                    required
                    data-testid="flat-number-input"
                  />
                </div>
                <div>
                  <Label htmlFor="owner_name">Owner Name</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    required
                    data-testid="owner-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="owner_email">Owner Email</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    required
                    data-testid="owner-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="owner_phone">Owner Phone</Label>
                  <Input
                    id="owner_phone"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    required
                    data-testid="owner-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="flat_size">Flat Size</Label>
                  <Input
                    id="flat_size"
                    value={formData.flat_size}
                    onChange={(e) => setFormData({ ...formData, flat_size: e.target.value })}
                    required
                    placeholder="e.g., 2BHK, 1000 sq ft"
                    data-testid="flat-size-input"
                  />
                </div>
                <div>
                  <Label htmlFor="custom_charge">Custom Charge (Optional)</Label>
                  <Input
                    id="custom_charge"
                    type="number"
                    step="0.01"
                    value={formData.custom_charge}
                    onChange={(e) => setFormData({ ...formData, custom_charge: e.target.value })}
                    placeholder="Leave empty for base charge"
                    data-testid="custom-charge-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-flat-btn">
                  {editingFlat ? 'Update Flat' : 'Add Flat'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="page-container py-8">
        {loading ? (
          <div className="text-center py-12" data-testid="loading-indicator">Loading...</div>
        ) : flats.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center" data-testid="no-flats-msg">
              <p className="text-muted-foreground">No flats added yet. Click "Add Flat" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flats.map((flat) => (
              <Card key={flat.id} className="stat-card" data-testid={`flat-card-${flat.id}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center" data-testid={`flat-title-${flat.id}`}>
                    <span>Flat {flat.flat_number}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(flat)} data-testid={`edit-flat-${flat.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(flat.id)} data-testid={`delete-flat-${flat.id}`}>
                        <Trash2 className="h-4 w-4 text-accent" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-medium" data-testid={`owner-name-${flat.id}`}>{flat.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm" data-testid={`owner-email-${flat.id}`}>{flat.owner_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm" data-testid={`owner-phone-${flat.id}`}>{flat.owner_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="text-sm" data-testid={`flat-size-${flat.id}`}>{flat.flat_size}</p>
                    </div>
                    {flat.custom_charge && (
                      <div>
                        <p className="text-sm text-muted-foreground">Custom Charge</p>
                        <p className="text-sm font-bold text-primary" data-testid={`custom-charge-${flat.id}`}>${flat.custom_charge.toFixed(2)}</p>
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
