"use client";

import React, { useState } from 'react';
import styles from './RefuseOrderModal.module.css';
import { AdminOrder } from './AdminOrderCard';

interface RefuseOrderModalProps {
    order: AdminOrder;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const RefuseOrderModal: React.FC<RefuseOrderModalProps> = ({ order, isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            setError('Le motif du refus est obligatoire');
            return;
        }

        onConfirm(reason);
        setReason('');
        setError('');
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Refuser la commande #{order.id.substring(0, 8)}</h2>
                    <button onClick={handleClose} className={styles.closeButton}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="reason" className={styles.label}>
                            Motif du refus <span className={styles.required}>*</span>
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError('');
                            }}
                            className={styles.textarea}
                            rows={5}
                            placeholder="Veuillez indiquer le motif du refus de cette commande..."
                            required
                        />
                        {error && <span className={styles.error}>{error}</span>}
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={handleClose} className={styles.cancelButton}>
                            Annuler
                        </button>
                        <button type="submit" className={styles.confirmButton}>
                            Confirmer le refus
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RefuseOrderModal;
