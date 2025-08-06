import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, User, Lock } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, adminCredentials } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(loginId, password);
      if (!success) {
        setError('Invalid credentials. Please check your login ID and password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = (credential: typeof adminCredentials[0]) => {
    setLoginId(credential.login_id);
    setPassword(credential.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">OneLeave Manager Dashboard</h1>
          <p className="text-gray-600">Admin Authentication Portal</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
          <Card className="shadow-xl backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <LogIn className="w-6 h-6 text-blue-600" />
                Admin Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginId" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login ID
                  </Label>
                  <Input
                    id="loginId"
                    type="text"
                    placeholder="Enter your login ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Auto-fill Credential Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Login Credentials</h3>
            <div className="grid gap-3">
              {adminCredentials.map((credential, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-white to-blue-50 border-blue-200"
                  onClick={() => handleAutoFill(credential)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{credential.name}</h4>
                        <p className="text-sm text-gray-600">{credential.login_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Click to auto-fill</p>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mt-1">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-sm text-gray-500 bg-white/60 p-3 rounded-lg">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Click any card above to auto-fill login credentials for testing purposes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
