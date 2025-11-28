import React from 'react';
import styles from '../styles/SafetyBanner.module.css';

const SafetyBanner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <strong>⚠️ Safety Warning:</strong> Do not share OTPs or bank details with anyone.
    </div>
  );
};

export default SafetyBanner;

