import React from 'react';

interface AlertProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => {
  const getStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getCustomStyle = () => {
    if (type === 'warning') {
      return {
        backgroundColor: '#D20A0A',
      };
    }
    return {};
  };

  return (
    <div
      className={`w-full px-4 py-3 rounded-xl shadow-md mb-4 ${getStyle()}`}
      style={getCustomStyle()}
    >
      <p className="text-sm font-medium text-center">{message}</p>
    </div>
  );
};

export default Alert;
