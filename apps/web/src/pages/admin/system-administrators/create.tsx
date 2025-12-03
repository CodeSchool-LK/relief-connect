import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { adminManagementService, CreateSystemAdminData } from '../../../services/admin-management-service';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { PermissionGuard } from '../../../components/admin/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateSystemAdministratorPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSystemAdminData>({
    username: '',
    password: '',
    contactNumber: '',
  });

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await adminManagementService.createSystemAdmin(formData);
      if (response.success) {
        router.push('/admin/system-administrators');
      } else {
        setError(response.error || 'Failed to create system administrator');
      }
    } catch (err) {
      setError('An error occurred while creating system administrator');
      console.error('Error creating system administrator:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create System Administrator - Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/admin/system-administrators">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to System Administrators
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create System Administrator</CardTitle>
            </CardHeader>
            <CardContent>
              <PermissionGuard permission={Permission.MANAGE_ADMINS}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      minLength={3}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Link href="/admin/system-administrators">
                      <Button type="button" variant="outline" disabled={loading}>
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create System Administrator'
                      )}
                    </Button>
                  </div>
                </form>
              </PermissionGuard>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

