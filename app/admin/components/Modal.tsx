"use client";

export default function Modal({ open, title, children, onClose }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-rose-600">{title}</h2>

        <div className="mb-4">{children}</div>

        <button
          onClick={onClose}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg mt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
