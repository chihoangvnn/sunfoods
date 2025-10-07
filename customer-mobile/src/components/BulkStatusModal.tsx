'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface BulkStatusModalProps {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  onUpdate: (status: 'active' | 'out_of_stock') => void;
}

export function BulkStatusModal({ open, onClose, selectedCount, onUpdate }: BulkStatusModalProps) {
  const [status, setStatus] = useState<'active' | 'out_of_stock'>('active');
  
  const handleSubmit = () => {
    onUpdate(status);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thay đổi trạng thái hàng loạt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Áp dụng cho {selectedCount} sản phẩm đã chọn
          </p>
          
          <RadioGroup value={status} onValueChange={(v) => setStatus(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active" className="text-green-600 font-medium">
                ✓ Hoạt động
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="out_of_stock" id="out_of_stock" />
              <Label htmlFor="out_of_stock" className="text-red-600 font-medium">
                ✗ Hết hàng
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
