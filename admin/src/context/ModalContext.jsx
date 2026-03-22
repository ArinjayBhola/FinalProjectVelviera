import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/ui/Modal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback((title, message, type = 'info') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: null,
      onCancel: null,
    });
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, onCancel = null) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'warning',
      onConfirm,
      onCancel,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
