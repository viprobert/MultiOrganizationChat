import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
        onClick={onClose}
         style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div onClick={(e) => e.stopPropagation()}
            style={{
                backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)', maxWidth: '700px', width: '90%',
                position: 'relative'
            }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
                    {title}
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: '#777'
                    }}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
