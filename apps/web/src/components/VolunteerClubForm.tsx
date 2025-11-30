import React, { useState, useEffect } from 'react';
import { IVolunteerClub, ICreateVolunteerClub, IUpdateVolunteerClub } from '../types/volunteer-club';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface VolunteerClubFormProps {
  club?: IVolunteerClub;
  onSubmit: (data: ICreateVolunteerClub | IUpdateVolunteerClub) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function VolunteerClubForm({ club, onSubmit, onCancel, loading = false }: VolunteerClubFormProps) {
  const [formData, setFormData] = useState({
    name: club?.name || '',
    description: club?.description || '',
    contactNumber: club?.contactNumber || '',
    email: club?.email || '',
    address: club?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || '',
        description: club.description || '',
        contactNumber: club.contactNumber || '',
        email: club.email || '',
        address: club.address || '',
      });
    }
  }, [club]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: ICreateVolunteerClub | IUpdateVolunteerClub = {
      name: formData.name.trim(),
      ...(formData.description && { description: formData.description.trim() }),
      ...(formData.contactNumber && { contactNumber: formData.contactNumber.trim() }),
      ...(formData.email && { email: formData.email.trim() }),
      ...(formData.address && { address: formData.address.trim() }),
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">
          Club Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter club name"
          disabled={loading}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter club description"
          disabled={loading}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          placeholder="Enter contact number"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          disabled={loading}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address"
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : club ? 'Update Club' : 'Create Club'}
        </Button>
      </div>
    </form>
  );
}

