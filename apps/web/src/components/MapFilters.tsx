import React from 'react';
import {
  Urgency,
  CampType,
  CampNeed,
} from '@nx-mono-repo-deployment-test/shared/src/enums';
import { HelpRequestFilters } from '../types/help-request';
import { CampFilters } from '../types/camp';
import styles from '../styles/MapFilters.module.css';

interface MapFiltersProps {
  type: 'all' | 'individuals' | 'camps';
  onTypeChange: (type: 'all' | 'individuals' | 'camps') => void;
  helpRequestFilters: HelpRequestFilters;
  campFilters: CampFilters;
  onHelpRequestFiltersChange: (filters: HelpRequestFilters) => void;
  onCampFiltersChange: (filters: CampFilters) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  type,
  onTypeChange,
  helpRequestFilters,
  campFilters,
  onHelpRequestFiltersChange,
  onCampFiltersChange,
}) => {
  return (
    <div className={styles.filters}>
      <h3>Filters</h3>
      
      <div className={styles.filterGroup}>
        <label>Type:</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as 'all' | 'individuals' | 'camps')}
        >
          <option value="all">All</option>
          <option value="individuals">Individuals</option>
          <option value="camps">Camps</option>
        </select>
      </div>

      {type === 'all' || type === 'individuals' ? (
        <>
          <div className={styles.filterGroup}>
            <label>Urgency:</label>
            <select
              value={helpRequestFilters.urgency || ''}
              onChange={(e) =>
                onHelpRequestFiltersChange({
                  ...helpRequestFilters,
                  urgency: e.target.value ? (e.target.value as Urgency) : undefined,
                })
              }
            >
              <option value="">All Urgency Levels</option>
              {Object.values(Urgency).map((urg) => (
                <option key={urg} value={urg}>
                  {urg}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      {type === 'all' || type === 'camps' ? (
        <>
          <div className={styles.filterGroup}>
            <label>Camp Type:</label>
            <select
              value={campFilters.campType || ''}
              onChange={(e) =>
                onCampFiltersChange({
                  ...campFilters,
                  campType: e.target.value ? (e.target.value as CampType) : undefined,
                })
              }
            >
              <option value="">All Types</option>
              {Object.values(CampType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Needs:</label>
            <div className={styles.checkboxes}>
              {Object.values(CampNeed).map((need) => (
                <label key={need} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={campFilters.needs?.includes(need) || false}
                    onChange={(e) => {
                      const currentNeeds = campFilters.needs || [];
                      const newNeeds = e.target.checked
                        ? [...currentNeeds, need]
                        : currentNeeds.filter((n) => n !== need);
                      onCampFiltersChange({
                        ...campFilters,
                        needs: newNeeds.length > 0 ? newNeeds : undefined,
                      });
                    }}
                  />
                  {need}
                </label>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className={styles.filterGroup}>
        <label>District:</label>
        <input
          type="text"
          placeholder="Enter district name"
          value={helpRequestFilters.district || campFilters.district || ''}
          onChange={(e) => {
            const value = e.target.value || undefined;
            onHelpRequestFiltersChange({ ...helpRequestFilters, district: value });
            onCampFiltersChange({ ...campFilters, district: value });
          }}
        />
      </div>
    </div>
  );
};

export default MapFilters;

