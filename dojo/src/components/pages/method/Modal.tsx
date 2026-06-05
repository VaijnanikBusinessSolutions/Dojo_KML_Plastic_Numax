
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerColor?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    headerContent?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    subtitle,
    headerColor = 'from-blue-600 to-indigo-700',
    size = 'lg',
    showCloseButton = true,
    headerContent
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Size classes
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-6xl'
    };

    const modalContent = (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            />
            
            {/* Modal Container */}
            <div 
                className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden`}
                style={{
                    animation: 'modalFadeIn 0.2s ease-out',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || headerContent) && (
                    <div className={`p-6 bg-gradient-to-r ${headerColor} text-white flex-shrink-0`}>
                        {headerContent ? (
                            headerContent
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    {title && <h2 className="text-2xl font-bold">{title}</h2>}
                                    {subtitle && <p className="opacity-80 mt-1">{subtitle}</p>}
                                </div>
                                {showCloseButton && (
                                    <button 
                                        onClick={onClose}
                                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );

    // Render using Portal to document.body
    return createPortal(modalContent, document.body);
};

export default Modal;