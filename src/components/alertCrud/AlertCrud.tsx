import React, { useState, useEffect } from 'react';

interface ResponseAlertCrudProps {
  status: boolean;
  message: string;
}

const AlertCrud: React.FC<{ ResponseAlertCrudProps: ResponseAlertCrudProps }> = ({
  ResponseAlertCrudProps
}) => {
  const { status, message } = ResponseAlertCrudProps;

  const [isVisible, setIsVisible] = useState(false); // Menunda visibilitas
  const [isFullyVisible, setIsFullyVisible] = useState(false); // Kontrol transisi

  const handleDismiss = () => {
    setIsFullyVisible(false); // Memulai fade-out
    setTimeout(() => setIsVisible(false), 300); // Hapus elemen setelah transisi selesai
  };

  // Menambahkan delay untuk muncul
  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setIsVisible(true); // Tampilkan elemen
      setTimeout(() => setIsFullyVisible(true), 10); // Mulai animasi transisi
    }, 500); // Delay 2 detik

    const autoDismissTimeout = setTimeout(() => handleDismiss(), 5000); // Auto-dismiss setelah 7 detik

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(autoDismissTimeout);
    };
  }, []);

  if (!isVisible) return null;

  const icon = status ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      ></path>
    </svg>
  );

  const bgColor = status ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`fixed z-30 bottom-0 lg:bottom-5 transition-opacity duration-300 ${
        isFullyVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`gap-x-2 mt-3 relative flex items-center w-full p-3 text-sm text-white font-medium rounded-md ${bgColor}`}
      >
        {icon}
        <span>{message}</span>
        <button onClick={handleDismiss}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-4 w-4"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export { AlertCrud };
