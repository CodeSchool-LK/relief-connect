import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { systemSettingsService, SystemSetting } from '../../services/system-settings-service';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Settings, Loader2, Save } from 'lucide-react';

export default function SystemSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    loadSettings();
  }, [isAuthenticated, isAdmin, router]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemSettingsService.getAllSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        const initialEdited: Record<string, string> = {};
        response.data.forEach((setting) => {
          initialEdited[setting.key] = setting.value;
        });
        setEditedSettings(initialEdited);
      } else {
        setError(response.error || 'Failed to load system settings');
      }
    } catch (err) {
      setError('An error occurred while loading system settings');
      console.error('Error loading system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await systemSettingsService.updateSetting(key, {
        value: editedSettings[key],
      });
      if (response.success) {
        await loadSettings();
        alert('Setting updated successfully');
      } else {
        setError(response.error || 'Failed to update setting');
      }
    } catch (err) {
      setError('An error occurred while updating setting');
      console.error('Error updating setting:', err);
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

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
        <title>System Settings - Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Settings className="w-8 h-8 mr-2" />
              System Settings
            </h1>
            <p className="text-gray-600">Manage system configuration and settings</p>
          </div>

          <PermissionGuard permission={Permission.MANAGE_SYSTEM_SETTINGS}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categorySettings.map((setting) => (
                      <div key={setting.id} className="flex items-end space-x-4">
                        <div className="flex-1">
                          <Label htmlFor={setting.key}>{setting.key}</Label>
                          {setting.description && (
                            <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                          )}
                          <Input
                            id={setting.key}
                            type={setting.type === 'number' ? 'number' : 'text'}
                            value={editedSettings[setting.key] || ''}
                            onChange={(e) =>
                              setEditedSettings({ ...editedSettings, [setting.key]: e.target.value })
                            }
                          />
                        </div>
                        <Button
                          onClick={() => handleSave(setting.key)}
                          disabled={saving || editedSettings[setting.key] === setting.value}
                          size="sm"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </PermissionGuard>
        </div>
      </div>
    </>
  );
}

