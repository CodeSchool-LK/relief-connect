import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { adminManagementService, SystemAdmin } from '../../services/admin-management-service';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Plus, Edit, Trash2, Shield, Loader2 } from 'lucide-react';

export default function SystemAdministratorsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [systemAdmins, setSystemAdmins] = useState<SystemAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    loadSystemAdmins();
  }, [isAuthenticated, isAdmin, router]);

  const loadSystemAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminManagementService.getAllSystemAdmins();
      if (response.success && response.data) {
        setSystemAdmins(response.data);
      } else {
        setError(response.error || 'Failed to load system administrators');
      }
    } catch (err) {
      setError('An error occurred while loading system administrators');
      console.error('Error loading system administrators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this system administrator?')) {
      return;
    }

    try {
      const response = await adminManagementService.deleteSystemAdmin(id);
      if (response.success) {
        await loadSystemAdmins();
      } else {
        alert(response.error || 'Failed to delete system administrator');
      }
    } catch (err) {
      alert('An error occurred while deleting system administrator');
      console.error('Error deleting system administrator:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>System Administrators - Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Administrators</h1>
              <p className="text-gray-600">Manage system administrators and their permissions</p>
            </div>
            <PermissionGuard permission={Permission.MANAGE_ADMINS}>
              <Link href="/admin/system-administrators/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create System Administrator
                </Button>
              </Link>
            </PermissionGuard>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                System Administrators ({systemAdmins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemAdmins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No system administrators found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {systemAdmins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{admin.contactNumber || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                admin.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : admin.status === 'INACTIVE'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {admin.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {admin.permissions && admin.permissions.length > 0 ? (
                                <span className="text-xs">{admin.permissions.length} permission(s)</span>
                              ) : (
                                <span className="text-xs text-gray-400">No permissions</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <PermissionGuard permission={Permission.MANAGE_ADMINS}>
                                <Link href={`/admin/system-administrators/${admin.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(admin.id!)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

