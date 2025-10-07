'use client';

interface FloatingCartButtonProps {
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
}

export default function FloatingCartButton({ itemCount, totalAmount, onClick }: FloatingCartButtonProps) {
  if (itemCount === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <button
        onClick={onClick}
        className="w-full bg-green-600 text-white py-4 rounded-lg shadow-lg flex items-center justify-between px-6 active:scale-95 transition-transform pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <span className="font-semibold">Xem đơn hàng ({itemCount} món)</span>
        </div>
        <div className="text-lg font-bold">
          {totalAmount.toLocaleString()}₫
        </div>
      </button>
    </div>
  );
}
