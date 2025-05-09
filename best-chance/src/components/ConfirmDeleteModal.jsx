import React from "react";

const ConfirmDeleteModal = ({ productName, page, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90vw] sm:w-[500px]">
        <h2 className="text-lg font-semibold text-center mb-4">確認刪除</h2>
        <p className="text-center mb-2">
          你確定要刪除 <strong>{productName}</strong> 嗎？
        </p>
        {page && (
          <p className="text-center text-sm text-gray-600">
            注意：呢個操作只會刪除項目資料，而唔會刪除項目開支報告。
          </p>
        )}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
