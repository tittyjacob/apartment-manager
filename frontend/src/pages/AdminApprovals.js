import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '@/utils/api';

export default function AdminApprovals() {
  const navigate = useNavigate();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.is_super_admin) {
      toast.error('Super admin access required');
      navigate('/dashboard');
      return;
    }
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const { data } = await api.get('/admin/pending');
      setPendingAdmins(data);
    } catch (error) {
      toast.error('Failed to load pending admins');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessing(userId);
    try {
      await api.post(`/admin/approve/${userId}`);
      toast.success('Admin approved successfully');
      fetchPendingAdmins();
    } catch (error) {
      toast.error('Failed to approve admin');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this admin request?')) return;
    
    setProcessing(userId);
    try {
      await api.post(`/admin/reject/${userId}`);
      toast.success('Admin request rejected');
      fetchPendingAdmins();
    } catch (error) {
      toast.error('Failed to reject admin');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-secondary" data-testid="admin-approvals-page">
      <header className="glass-header sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} data-testid="back-btn">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight" data-testid="page-title">Admin Approvals</h1>
          </div>
        </div>
      </header>

      <main className="page-container py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground" data-testid="info-banner">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">As the super admin, you can approve or reject new admin registrations.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12" data-testid="loading-indicator">Loading...</div>
        ) : pendingAdmins.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center" data-testid="no-pending-msg">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No Pending Approvals</p>
              <p className="text-muted-foreground">All admin requests have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingAdmins.map((admin) => (
              <Card key={admin.id} className="stat-card" data-testid={`pending-admin-${admin.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid={`admin-name-${admin.id}`}>
                    <Shield className="h-5 w-5 text-accent" />
                    {admin.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm" data-testid={`admin-email-${admin.id}`}>{admin.email}</p>
                    </div>
                    {admin.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm" data-testid={`admin-phone-${admin.id}`}>{admin.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Registered</p>
                      <p className="text-sm" data-testid={`admin-date-${admin.id}`}>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(admin.id)}
                      disabled={processing === admin.id}
                      data-testid={`approve-btn-${admin.id}`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {processing === admin.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleReject(admin.id)}
                      disabled={processing === admin.id}
                      data-testid={`reject-btn-${admin.id}`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
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
