import React from 'react';
import styles from './modal.module.css';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className={styles.modalButtons}>
        <button onClick={onConfirm} className={styles.modalButton}>OK</button>
        <button onClick={onCancel} className={styles.modalButton}>Cancel</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
