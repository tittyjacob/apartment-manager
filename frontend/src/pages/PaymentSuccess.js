import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import api from '@/utils/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('checking');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('timeout');
        toast.error('Payment verification timed out. Please check your payment history.');
        return;
      }

      try {
        const { data } = await api.get(`/payments/checkout/status/${sessionId}`);
        
        if (data.payment_status === 'paid') {
          setStatus('success');
          setPaymentDetails(data);
          toast.success('Payment successful!');
          return;
        } else if (data.status === 'expired') {
          setStatus('expired');
          toast.error('Payment session expired');
          return;
        }

        attempts++;
        setTimeout(poll, pollInterval);
      } catch (error) {
        setStatus('error');
        toast.error('Failed to verify payment');
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-8" data-testid="payment-success-page">
      <Card className="max-w-md w-full" data-testid="payment-status-card">
        <CardHeader className="text-center">
          {status === 'checking' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" data-testid="loading-spinner" />
              </div>
              <CardTitle data-testid="checking-title">Verifying Payment...</CardTitle>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full" data-testid="success-icon">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-green-600" data-testid="success-title">Payment Successful!</CardTitle>
            </>
          )}
          {(status === 'error' || status === 'timeout' || status === 'expired') && (
            <>
              <CardTitle className="text-accent" data-testid="error-title">Payment Verification Failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && paymentDetails && (
            <div className="space-y-3" data-testid="payment-details">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold" data-testid="payment-amount">${paymentDetails.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600" data-testid="payment-status">Paid</span>
              </div>
            </div>
          )}
          <Button className="w-full" onClick={() => navigate('/dashboard')} data-testid="go-dashboard-btn">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
