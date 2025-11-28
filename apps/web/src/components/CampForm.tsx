import React, { useState } from 'react';
import { ICreateCamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICreateCamp';
import {
  CampType,
  PeopleRange,
  CampNeed,
  ContactType,
} from '@nx-mono-repo-deployment-test/shared/src/enums';
import LocationPicker from './LocationPicker';
import styles from '../styles/Form.module.css';

interface CampFormProps {
  onSubmit: (data: ICreateCamp) => Promise<void>;
  onCancel?: () => void;
}

const CampForm: React.FC<CampFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ICreateCamp>>({
    campType: CampType.COMMUNITY,
    name: '',
    peopleRange: PeopleRange.ONE_TO_TEN,
    needs: [],
    shortNote: '',
    contactType: ContactType.NONE,
    lat: 7.8731,
    lng: 80.7718,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleNeedToggle = (need: CampNeed) => {
    const currentNeeds = formData.needs || [];
    const newNeeds = currentNeeds.includes(need)
      ? currentNeeds.filter((n) => n !== need)
      : [...currentNeeds, need];
    setFormData({ ...formData, needs: newNeeds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || formData.name.trim().length === 0) {
      setError('Camp name is required');
      return;
    }
    if (!formData.needs || formData.needs.length === 0) {
      setError('At least one need must be selected');
      return;
    }
    if (!formData.shortNote || formData.shortNote.trim().length === 0) {
      setError('Short note is required');
      return;
    }
    if (formData.shortNote.length > 500) {
      setError('Short note must not exceed 500 characters');
      return;
    }
    if (formData.contactType !== ContactType.NONE && !formData.contact) {
      setError('Contact information is required when contact type is selected');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as ICreateCamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit camp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>We Are a Camp</h2>

      <div className={styles.formGroup}>
        <label htmlFor="campType">Camp Type *</label>
        <select
          id="campType"
          value={formData.campType}
          onChange={(e) => setFormData({ ...formData, campType: e.target.value as CampType })}
          required
        >
          {Object.values(CampType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name">Camp Name/Landmark *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Community Center, School Name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="peopleRange">People Count *</label>
        <select
          id="peopleRange"
          value={formData.peopleRange}
          onChange={(e) =>
            setFormData({ ...formData, peopleRange: e.target.value as PeopleRange })
          }
          required
        >
          {Object.values(PeopleRange).map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Needs * (select at least one)</label>
        <div className={styles.checkboxes}>
          {Object.values(CampNeed).map((need) => (
            <label key={need} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.needs?.includes(need) || false}
                onChange={() => handleNeedToggle(need)}
              />
              {need}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shortNote">Short Note (max 500 chars) *</label>
        <textarea
          id="shortNote"
          value={formData.shortNote}
          onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
          maxLength={500}
          rows={4}
          required
        />
        <small>{formData.shortNote?.length || 0}/500 characters</small>
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

export default CampForm;

