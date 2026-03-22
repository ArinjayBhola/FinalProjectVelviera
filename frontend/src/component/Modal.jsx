import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiXMark } from 'react-icons/hi2';

const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const icons = {
    success: <HiOutlineCheckCircle className="w-12 h-12 text-green-500" />,
    error: <HiOutlineXCircle className="w-12 h-12 text-red-500" />,
    warning: <HiOutlineExclamationCircle className="w-12 h-12 text-yellow-500" />,
    info: <HiOutlineInformationCircle className="w-12 h-12 text-blue-500" />,
  };

  const borderColors = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    warning: 'border-yellow-500/20',
    info: 'border-blue-500/20',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-md bg-white border ${borderColors[type]} rounded-2xl shadow-2xl overflow-hidden`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                className="mb-4"
              >
                {icons[type]}
              </motion.div>

              <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {message}
              </p>

              <button
                onClick={onClose}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                  type === 'success' ? 'bg-green-500 text-white hover:bg-green-600' :
                  type === 'error' ? 'bg-red-500 text-white hover:bg-red-600' :
                  type === 'warning' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                  'bg-black text-white hover:opacity-90'
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
