'use client'

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizes = [
    { cm: 16, wrist: '14-15cm', recommended: 'Cổ tay nhỏ (nữ, trẻ em)' },
    { cm: 17, wrist: '15-16cm', recommended: 'Cổ tay trung bình (nữ)' },
    { cm: 18, wrist: '16-17cm', recommended: 'Cổ tay lớn (nam, nữ)' },
    { cm: 19, wrist: '17-18cm', recommended: 'Cổ tay lớn (nam)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-tramhuong-primary/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-2xl border border-tramhuong-accent/30 shadow-[0_8px_32px_rgba(193,168,117,0.3)] p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-tramhuong-accent/10 hover:bg-tramhuong-accent/20 border border-tramhuong-accent/30 flex items-center justify-center transition-all duration-300"
        >
          <X className="h-5 w-5 text-tramhuong-primary" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-tramhuong-primary mb-2 flex items-center gap-3">
            <Ruler className="h-7 w-7 text-tramhuong-accent" />
            Hướng dẫn chọn size vòng tay
          </h2>
          <p className="text-tramhuong-primary/70 font-nunito">
            Chọn size phù hợp để vòng tay vừa vặn và thoải mái
          </p>
        </div>

        <div className="mb-8 p-6 bg-tramhuong-accent/10 rounded-xl border border-tramhuong-accent/30">
          <h3 className="text-lg font-playfair font-semibold text-tramhuong-primary mb-4">
            Cách đo chu vi cổ tay
          </h3>
          <ol className="space-y-3 font-nunito text-tramhuong-primary/80">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tramhuong-accent text-white text-sm font-semibold flex items-center justify-center">
                1
              </span>
              <span>Dùng thước dây hoặc sợi chỉ quấn quanh cổ tay tại vị trí đeo vòng</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tramhuong-accent text-white text-sm font-semibold flex items-center justify-center">
                2
              </span>
              <span>Đảm bảo thước/chỉ vừa khít, không quá chặt hay quá lỏng</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tramhuong-accent text-white text-sm font-semibold flex items-center justify-center">
                3
              </span>
              <span>Đo độ dài đã quấn bằng thước kẻ để có chu vi cổ tay</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tramhuong-accent text-white text-sm font-semibold flex items-center justify-center">
                4
              </span>
              <span>Tham khảo bảng size bên dưới để chọn size phù hợp</span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-playfair font-semibold text-tramhuong-primary mb-4">
            Bảng size vòng tay
          </h3>
          {sizes.map((size) => (
            <div
              key={size.cm}
              className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-tramhuong-accent/20 hover:border-tramhuong-accent/40 hover:shadow-[0_4px_16px_rgba(193,168,117,0.2)] transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tramhuong-primary to-tramhuong-accent text-white font-playfair font-bold text-xl flex items-center justify-center shadow-lg">
                    {size.cm}cm
                  </div>
                  <div>
                    <div className="font-nunito font-semibold text-tramhuong-primary">
                      Chu vi cổ tay: {size.wrist}
                    </div>
                    <div className="font-nunito text-sm text-tramhuong-primary/70">
                      {size.recommended}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-tramhuong-accent/10 text-tramhuong-accent font-nunito font-medium border border-tramhuong-accent/30 hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent/50 transition-all duration-300"
                >
                  Chọn size này
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-tramhuong-primary/10 rounded-xl border border-tramhuong-primary/20">
          <p className="font-nunito text-sm text-tramhuong-primary/80 text-center">
            💡 <strong>Lưu ý:</strong> Nếu chu vi cổ tay của bạn nằm giữa 2 size, 
            nên chọn size lớn hơn để thoải mái khi đeo
          </p>
        </div>
      </div>
    </div>
  );
};
