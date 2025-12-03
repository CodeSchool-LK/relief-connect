import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { volunteerClubService, membershipService, userService } from '../../services';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Building2, UserCheck, ArrowRight, Loader2, Shield, Settings, FileText } from 'lucide-react';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClubs: 0,
    pendingMemberships: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    loadStats();
  }, [isAuthenticated, isAdmin, router]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [usersResponse, clubsResponse, membershipsResponse] = await Promise.all([
        userService.getAllUsers(),
        volunteerClubService.getAllVolunteerClubs(),
        membershipService.getMyMemberships(), // This will need to be updated to get all memberships
      ]);

      setStats({
        totalUsers: usersResponse.success && usersResponse.data ? usersResponse.data.length : 0,
        totalClubs: clubsResponse.success && clubsResponse.data ? clubsResponse.data.length : 0,
        pendingMemberships: 0, // TODO: Implement get all memberships endpoint
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
        <title>Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage volunteer clubs, users, and memberships</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <Users className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <Link href="/admin/users">
                  <Button variant="link" className="p-0 h-auto mt-2">
                    View all users <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Volunteer Clubs</CardTitle>
                <Building2 className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClubs}</div>
                <Link href="/admin/volunteer-clubs">
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Manage clubs <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Memberships</CardTitle>
                <UserCheck className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingMemberships}</div>
                <Link href="/admin/memberships">
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Review requests <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/volunteer-clubs/create">
                  <Button className="w-full justify-start" variant="outline">
                    Create Volunteer Club
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button className="w-full justify-start" variant="outline">
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/memberships">
                  <Button className="w-full justify-start" variant="outline">
                    Review Memberships
                  </Button>
                </Link>
                <Link href="/admin/help-requests">
                  <Button className="w-full justify-start" variant="outline">
                    Manage Help Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <PermissionGuard permission={Permission.MANAGE_ADMINS}>
              <Card>
                <CardHeader>
                  <CardTitle>System Administration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/system-administrators">
                    <Button className="w-full justify-start" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage System Administrators
                    </Button>
                  </Link>
                  <PermissionGuard permission={Permission.MANAGE_SYSTEM_SETTINGS}>
                    <Link href="/admin/system-settings">
                      <Button className="w-full justify-start" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        System Settings
                      </Button>
                    </Link>
                  </PermissionGuard>
                  <PermissionGuard permission={Permission.VIEW_AUDIT_LOGS}>
                    <Link href="/admin/audit-logs">
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Audit Logs
                      </Button>
                    </Link>
                  </PermissionGuard>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}

