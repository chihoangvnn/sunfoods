'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Package as PackageIcon } from "lucide-react";
import type { Package } from "../mockData";

interface CancelPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package;
  cancellerRole: "sender" | "driver";
  onConfirmCancel: (reason: string) => void;
}

export function CancelPackageDialog({
  open,
  onOpenChange,
  package: pkg,
  cancellerRole,
  onConfirmCancel
}: CancelPackageDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const minCharacters = 10;
  const maxCharacters = 500;
  const characterCount = reason.length;

  const handleConfirm = () => {
    if (characterCount < minCharacters) {
      setError(`Lý do phải có ít nhất ${minCharacters} ký tự`);
      return;
    }
    
    onConfirmCancel(reason);
    handleClose();
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  const handleReasonChange = (value: string) => {
    if (value.length <= maxCharacters) {
      setReason(value);
      if (error && value.length >= minCharacters) {
        setError("");
      }
    }
  };

  const warningMessage = cancellerRole === "sender" 
    ? "Bạn có chắc chắn muốn hủy đơn hàng này?"
    : "Bạn có chắc chắn muốn hủy nhận giao đơn hàng này?";

  const placeholder = cancellerRole === "sender"
    ? "Vui lòng cho biết lý do hủy đơn hàng..."
    : "Vui lòng cho biết lý do không thể giao hàng...";

  const isConfirmDisabled = characterCount < minCharacters;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Hủy đơn hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-2">
              {warningMessage}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <PackageIcon className="h-4 w-4 text-red-600" />
              <span className="font-medium">Mã đơn hàng:</span>
              <span className="text-red-700 font-semibold">{pkg.id.toUpperCase()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder={placeholder}
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              rows={4}
              className={`resize-none ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              maxLength={maxCharacters}
            />
            <div className="flex justify-between items-center">
              {error ? (
                <span className="text-xs text-red-600 font-medium">
                  {error}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Tối thiểu {minCharacters} ký tự
                </span>
              )}
              <span className={`text-xs ${
                characterCount > maxCharacters * 0.9 
                  ? 'text-orange-600 font-medium' 
                  : 'text-muted-foreground'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="flex-1 sm:flex-none"
          >
            Không
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isConfirmDisabled}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
          >
            Xác nhận hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
