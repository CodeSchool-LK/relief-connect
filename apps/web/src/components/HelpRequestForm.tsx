import React, { useState } from 'react';
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest';
import {
  HelpRequestCategory,
  Urgency,
  ContactType,
} from '@nx-mono-repo-deployment-test/shared/src/enums';
import LocationPicker from './LocationPicker';
import styles from '../styles/Form.module.css';

interface HelpRequestFormProps {
  onSubmit: (data: ICreateHelpRequest) => Promise<void>;
  onCancel?: () => void;
}

const HelpRequestForm: React.FC<HelpRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ICreateHelpRequest>>({
    category: HelpRequestCategory.FOOD_WATER,
    urgency: Urgency.MEDIUM,
    contactType: ContactType.NONE,
    shortNote: '',
    approxArea: '',
    lat: 7.8731,
    lng: 80.7718,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.shortNote || formData.shortNote.trim().length === 0) {
      setError('Short note is required');
      return;
    }
    if (formData.shortNote.length > 160) {
      setError('Short note must not exceed 160 characters');
      return;
    }
    if (!formData.approxArea || formData.approxArea.trim().length === 0) {
      setError('Approximate area is required');
      return;
    }
    if (formData.contactType !== ContactType.NONE && !formData.contact) {
      setError('Contact information is required when contact type is selected');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as ICreateHelpRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit help request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>I Need Help</h2>

      <div className={styles.formGroup}>
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as HelpRequestCategory })
          }
          required
        >
          {Object.values(HelpRequestCategory).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="urgency">Urgency *</label>
        <select
          id="urgency"
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value as Urgency })}
          required
        >
          {Object.values(Urgency).map((urg) => (
            <option key={urg} value={urg}>
              {urg}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shortNote">Short Note (max 160 chars) *</label>
        <textarea
          id="shortNote"
          value={formData.shortNote}
          onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
          maxLength={160}
          rows={3}
          required
        />
        <small>{formData.shortNote?.length || 0}/160 characters</small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="approxArea">Approximate Area *</label>
        <input
          id="approxArea"
          type="text"
          value={formData.approxArea}
          onChange={(e) => setFormData({ ...formData, approxArea: e.target.value })}
          placeholder="e.g., Kelaniya near bridge"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="contactType">Contact Type *</label>
        <select
          id="contactType"
          value={formData.contactType}
          onChange={(e) => {
            const contactType = e.target.value as ContactType;
            setFormData({
              ...formData,
              contactType,
              contact: contactType === ContactType.NONE ? undefined : formData.contact,
            });
          }}
          required
        >
          {Object.values(ContactType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {formData.contactType !== ContactType.NONE && (
        <div className={styles.formGroup}>
          <label htmlFor="contact">Contact *</label>
          <input
            id="contact"
            type="text"
            value={formData.contact || ''}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            placeholder="Phone or WhatsApp number"
            required
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Location *</label>
        <LocationPicker
          onLocationChange={handleLocationChange}
          initialLat={formData.lat}
          initialLng={formData.lng}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default HelpRequestForm;

