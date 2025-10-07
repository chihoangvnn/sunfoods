'use client'

import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (products: any[]) => void;
}

interface ParsedProduct {
  productName: string;
  quantity: number;
  consignmentPrice: number;
  discountPercent: number;
  expiryDate?: string;
  errors: string[];
}

export function BulkUploadModal({ open, onClose, onImportSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview'>('upload');
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };
  
  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const products = jsonData.map((row: any, index) => {
        const errors: string[] = [];
        
        if (!row['Tên sản phẩm']) errors.push('Thiếu tên sản phẩm');
        if (!row['Số lượng'] || row['Số lượng'] <= 0) errors.push('Số lượng không hợp lệ');
        if (!row['Giá ký gửi'] || row['Giá ký gửi'] <= 0) errors.push('Giá ký gửi không hợp lệ');
        
        const discount = parseFloat(row['Chiết khấu (%)']);
        if (isNaN(discount) || discount < 0 || discount > 100) {
          errors.push('Chiết khấu không hợp lệ (0-100%)');
        }
        
        return {
          productName: row['Tên sản phẩm'] || '',
          quantity: parseInt(row['Số lượng']) || 0,
          consignmentPrice: parseFloat(row['Giá ký gửi']) || 0,
          discountPercent: parseFloat(row['Chiết khấu (%)']) || 0,
          expiryDate: row['Ngày hết hạn'] || undefined,
          errors
        };
      });
      
      setParsedProducts(products);
      setUploadStep('preview');
    } catch (error) {
      console.error('Excel parse error:', error);
      toast.error('Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleImport = () => {
    const validProducts = parsedProducts.filter(p => p.errors.length === 0);
    
    if (validProducts.length === 0) {
      toast.error('Không có sản phẩm hợp lệ để nhập');
      return;
    }
    
    const newProducts = validProducts.map((p, index) => ({
      id: `vp-bulk-${Date.now()}-${index}`,
      vendorId: 'v1',
      productId: `PROD-${Date.now()}-${index}`,
      quantity: p.quantity,
      consignmentPrice: p.consignmentPrice,
      discountPercent: p.discountPercent,
      wholesalePrice: p.consignmentPrice * 0.6,
      shopMarkup: 40,
      suggestedRetailPrice: p.consignmentPrice * 1.2,
      revenueShareVendor: 70,
      revenueShareShop: 30,
      status: 'active' as const,
      expiryDate: p.expiryDate ? new Date(p.expiryDate) : undefined,
      productName: p.productName,
      productImage: '/placeholder-product.jpg'
    }));
    
    onImportSuccess(newProducts);
    handleClose();
  };
  
  const handleClose = () => {
    setFile(null);
    setParsedProducts([]);
    setUploadStep('upload');
    onClose();
  };
  
  const downloadTemplate = () => {
    const template = [
      {
        'Tên sản phẩm': 'Bộ trầm hương cao cấp',
        'Số lượng': 100,
        'Giá ký gửi': 450000,
        'Chiết khấu (%)': 15,
        'Ngày hết hạn': '2025-12-31'
      },
      {
        'Tên sản phẩm': 'Sách Kinh Phật',
        'Số lượng': 200,
        'Giá ký gửi': 180000,
        'Chiết khấu (%)': 10,
        'Ngày hết hạn': ''
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
    XLSX.writeFile(workbook, 'mau_nhap_san_pham.xlsx');
  };
  
  const validCount = parsedProducts.filter(p => p.errors.length === 0).length;
  const errorCount = parsedProducts.length - validCount;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Nhập sản phẩm hàng loạt từ Excel
          </DialogTitle>
        </DialogHeader>
        
        {uploadStep === 'upload' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                File Excel phải có các cột: Tên sản phẩm, Số lượng, Giá ký gửi, Chiết khấu (%), Ngày hết hạn (tùy chọn)
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button variant="outline" onClick={downloadTemplate}>
                Tải file mẫu
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
              />
              <label 
                htmlFor="excel-upload" 
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">
                  {file ? file.name : 'Chọn file Excel để tải lên'}
                </p>
                <p className="text-sm text-gray-400">
                  Định dạng: .xlsx, .xls
                </p>
              </label>
            </div>
            
            {isProcessing && (
              <p className="text-center text-gray-600">Đang xử lý file...</p>
            )}
          </div>
        )}
        
        {uploadStep === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {validCount} hợp lệ
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    <X className="w-3 h-3 mr-1" />
                    {errorCount} lỗi
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setUploadStep('upload')}>
                Chọn file khác
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Giá ký gửi</TableHead>
                      <TableHead>Chiết khấu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedProducts.map((product, index) => (
                      <TableRow key={index} className={product.errors.length > 0 ? 'bg-red-50' : ''}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{product.productName || '-'}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{product.consignmentPrice.toLocaleString('vi-VN')} ₫</TableCell>
                        <TableCell>{product.discountPercent}%</TableCell>
                        <TableCell>
                          {product.errors.length === 0 ? (
                            <Badge variant="default" className="bg-green-600">OK</Badge>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <Badge variant="destructive">Lỗi</Badge>
                              <div className="text-xs text-red-600">
                                {product.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          {uploadStep === 'preview' && (
            <Button 
              onClick={handleImport}
              disabled={validCount === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Nhập {validCount} sản phẩm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
