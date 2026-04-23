import React from 'react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="tw:fixed tw:inset-0 tw:bg-black/50 tw:flex tw:items-center tw:justify-center tw:z-50">
      <div className="tw:bg-white tw:rounded-lg tw:shadow-xl tw:w-full tw:max-w-lg tw:mx-4 tw:max-h-[90vh] tw:flex tw:flex-col">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:shrink-0">
          <h2 className="tw:text-lg tw:font-semibold tw:text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="tw:text-gray-400 tw:hover:text-gray-600 tw:text-xl tw:leading-none"
          >
            ✕
          </button>
        </div>
        <div className="tw:p-5 tw:overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
