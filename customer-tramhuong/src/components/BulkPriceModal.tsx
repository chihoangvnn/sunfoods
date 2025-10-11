'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface BulkPriceModalProps {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  onUpdate: (updateType: 'set' | 'increase' | 'decrease', value: number) => void;
}

export function BulkPriceModal({ open, onClose, selectedCount, onUpdate }: BulkPriceModalProps) {
  const [updateType, setUpdateType] = useState<'set' | 'increase' | 'decrease'>('set');
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      toast.error('Vui lòng nhập giá trị hợp lệ');
      return;
    }
    
    onUpdate(updateType, numValue);
    onClose();
    setValue('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật giá hàng loạt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Áp dụng cho {selectedCount} sản phẩm đã chọn
          </p>
          
          <RadioGroup value={updateType} onValueChange={(v) => setUpdateType(v as 'set' | 'increase' | 'decrease')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="set" id="set" />
              <Label htmlFor="set">Đặt giá mới</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="increase" id="increase" />
              <Label htmlFor="increase">Tăng giá (%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="decrease" id="decrease" />
              <Label htmlFor="decrease">Giảm giá (%)</Label>
            </div>
          </RadioGroup>
          
          <div className="space-y-2">
            <Label htmlFor="price-value">
              {updateType === 'set' ? 'Giá mới (₫)' : 'Tỷ lệ (%)'}
            </Label>
            <Input
              id="price-value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={updateType === 'set' ? '450000' : '10'}
            />
          </div>
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
