import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';
import api from '@/utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'resident',
    flat_number: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', loginData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', registerData);
      
      if (data.pending_approval) {
        toast.success(data.message);
        setRegisterData({
          email: '',
          password: '',
          name: '',
          role: 'resident',
          flat_number: '',
          phone: ''
        });
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" 
         style={{ 
           backgroundImage: `linear-gradient(rgba(26, 77, 46, 0.9), rgba(26, 77, 46, 0.85)), url('https://images.unsplash.com/photo-1617341623760-1919df79274c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yJTIwc3Vubnl8ZW58MHx8fHwxNzY2NjQ2MjgyfDA&ixlib=rb-4.1.0&q=85')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <Card className="w-full max-w-md" data-testid="login-card">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-4 rounded-full" data-testid="logo-icon">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight" data-testid="login-title">
            Apartment Manager
          </CardTitle>
          <CardDescription data-testid="login-description">
            Track and manage maintenance charges
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="login" data-testid="auth-tabs">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="login-password-input"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    data-testid="register-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="register-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    data-testid="register-password-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    data-testid="register-role-select"
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {registerData.role === 'resident' && (
                  <div className="space-y-2">
                    <Label htmlFor="flat_number">Flat Number</Label>
                    <Input
                      id="flat_number"
                      value={registerData.flat_number}
                      onChange={(e) => setRegisterData({ ...registerData, flat_number: e.target.value })}
                      required
                      data-testid="register-flat-input"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    data-testid="register-phone-input"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="register-submit-btn">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
