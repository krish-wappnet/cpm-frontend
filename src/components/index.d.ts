// This file provides type declarations for components
declare module '*.tsx';
declare module '*.ts';

// Declare module for common components
declare module '../components/common/Modal' {
  import { ReactNode } from 'react';
  
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
  }
  
  const Modal: React.FC<ModalProps>;
  export default Modal;
}
