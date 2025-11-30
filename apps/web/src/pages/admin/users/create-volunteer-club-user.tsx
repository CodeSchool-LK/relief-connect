import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { userService } from '../../../services';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ArrowLeft, Loader2, Key, Copy, Check } from 'lucide-react';

export default function CreateVolunteerClubUserPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    contactNumber: '',
    password: '', // Optional - will be generated if not provided
    clubName: '',
    clubDescription: '',
    clubEmail: '',
    clubAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await userService.createVolunteerClubUser({
        username: formData.username.trim(),
        contactNumber: formData.contactNumber.trim() || undefined,
        password: formData.password.trim() || undefined,
        clubName: formData.clubName.trim(),
        clubDescription: formData.clubDescription.trim() || undefined,
        clubEmail: formData.clubEmail.trim() || undefined,
        clubAddress: formData.clubAddress.trim() || undefined,
      });

      if (response.success && response.data) {
        setSuccess({
          username: response.data.user.username,
          password: response.data.password,
        });
        // Reset form
        setFormData({
          username: '',
          contactNumber: '',
          password: '',
          clubName: '',
          clubDescription: '',
          clubEmail: '',
          clubAddress: '',
        });
      } else {
        setError(response.error || 'Failed to create volunteer club user');
      }
    } catch (error) {
      console.error('Error creating volunteer club user:', error);
      setError('Failed to create volunteer club user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Create Volunteer Club User - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin/users">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Volunteer Club User</CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">User Created Successfully!</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Username:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{success.username}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(success.username)}
                          className="h-6 px-2"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{success.password}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(success.password)}
                          className="h-6 px-2"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      ⚠️ Please save these credentials securely. The password cannot be retrieved later.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-4">User Account Information</h3>
                </div>

                <div>
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    disabled={loading}
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Enter contact number (optional)"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Password <span className="text-gray-500 text-sm">(optional)</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave empty to auto-generate"
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If left empty, a secure password will be automatically generated
                  </p>
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-semibold text-lg mb-4">Volunteer Club Information</h3>
                </div>

                <div>
                  <Label htmlFor="clubName">
                    Club Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clubName"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    placeholder="Enter volunteer club name"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clubDescription">Club Description</Label>
                  <textarea
                    id="clubDescription"
                    value={formData.clubDescription}
                    onChange={(e) => setFormData({ ...formData, clubDescription: e.target.value })}
                    placeholder="Enter club description (optional)"
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label htmlFor="clubEmail">Club Email</Label>
                  <Input
                    id="clubEmail"
                    type="email"
                    value={formData.clubEmail}
                    onChange={(e) => setFormData({ ...formData, clubEmail: e.target.value })}
                    placeholder="Enter club email (optional)"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="clubAddress">Club Address</Label>
                  <textarea
                    id="clubAddress"
                    value={formData.clubAddress}
                    onChange={(e) => setFormData({ ...formData, clubAddress: e.target.value })}
                    placeholder="Enter club address (optional)"
                    disabled={loading}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Link href="/admin/users">
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
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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

