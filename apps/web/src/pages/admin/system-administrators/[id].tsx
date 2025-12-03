import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { adminManagementService, SystemAdmin, UpdateSystemAdminData, UpdatePermissionsData } from '../../../services/admin-management-service';
import { Permission, UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { PermissionGuard } from '../../../components/admin/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function SystemAdministratorDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemAdmin, setSystemAdmin] = useState<SystemAdmin | null>(null);
  const [formData, setFormData] = useState<UpdateSystemAdminData>({});
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    if (id) {
      loadSystemAdmin();
    }
  }, [isAuthenticated, isAdmin, router, id]);

  const loadSystemAdmin = async () => {
    if (!id || typeof id !== 'string') return;

    setLoading(true);
    setError(null);
    try {
      const response = await adminManagementService.getSystemAdminById(parseInt(id, 10));
      if (response.success && response.data) {
        setSystemAdmin(response.data);
        setFormData({
          username: response.data.username,
          contactNumber: response.data.contactNumber,
        });
        setPermissions(response.data.permissions || []);
      } else {
        setError(response.error || 'Failed to load system administrator');
      }
    } catch (err) {
      setError('An error occurred while loading system administrator');
      console.error('Error loading system administrator:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id || typeof id !== 'string') return;

    setSaving(true);
    setError(null);
    try {
      const response = await adminManagementService.updateSystemAdmin(parseInt(id, 10), formData);
      if (response.success) {
        await loadSystemAdmin();
        alert('System administrator updated successfully');
      } else {
        setError(response.error || 'Failed to update system administrator');
      }
    } catch (err) {
      setError('An error occurred while updating system administrator');
      console.error('Error updating system administrator:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!id || typeof id !== 'string') return;

    setSaving(true);
    setError(null);
    try {
      const updateData: UpdatePermissionsData = {
        permissions: permissions as Permission[],
      };
      const response = await adminManagementService.updatePermissions(parseInt(id, 10), updateData);
      if (response.success) {
        await loadSystemAdmin();
        alert('Permissions updated successfully');
      } else {
        setError(response.error || 'Failed to update permissions');
      }
    } catch (err) {
      setError('An error occurred while updating permissions');
      console.error('Error updating permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: UserStatus) => {
    if (!id || typeof id !== 'string') return;

    setSaving(true);
    setError(null);
    try {
      const response = await adminManagementService.updateStatus(parseInt(id, 10), status);
      if (response.success) {
        await loadSystemAdmin();
        alert('Status updated successfully');
      } else {
        setError(response.error || 'Failed to update status');
      }
    } catch (err) {
      setError('An error occurred while updating status');
      console.error('Error updating status:', err);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!systemAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">System administrator not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const allPermissions = Object.values(Permission);

  return (
    <>
      <Head>
        <title>Edit System Administrator - Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/admin/system-administrators">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to System Administrators
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Administrator Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PermissionGuard permission={Permission.MANAGE_ADMINS}>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber || ''}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={systemAdmin.status}
                      onValueChange={(value) => handleStatusChange(value as UserStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                        <SelectItem value={UserStatus.DISABLED}>Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleUpdate} disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </PermissionGuard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <PermissionGuard permission={Permission.ASSIGN_PERMISSIONS}>
                  <div className="space-y-2">
                    {allPermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpdatePermissions}
                    disabled={saving}
                    className="w-full mt-4"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Permissions
                      </>
                    )}
                  </Button>
                </PermissionGuard>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

