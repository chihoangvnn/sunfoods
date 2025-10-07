import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BulkMediaUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedCSV {
  success: boolean;
  data: any[];
  errors: any[];
  validRows: number;
  invalidRows: number;
  extraHeaders?: string[];
}

interface UploadResult {
  success: boolean;
  message: string;
  cloudinary: {
    total: number;
    uploaded: number;
    failed: number;
  };
  database: {
    saved: number;
    failed: number;
  };
  uploadResults: Array<{
    url: string;
    filename: string;
    success: boolean;
    error?: string;
  }>;
  assets: any[];
}

export function BulkMediaUpload({ open, onOpenChange }: BulkMediaUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParsedCSV | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [step, setStep] = useState<'upload' | 'validate' | 'execute' | 'complete'>('upload');

  // Parse CSV mutation
  const parseMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/media/bulk-upload/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ csvContent: content }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'CSV parse failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setParseResult(data);
      setStep('validate');
      if (data.validRows > 0) {
        toast({
          title: "CSV validated successfully",
          description: `${data.validRows} valid rows, ${data.invalidRows} invalid rows`,
        });
      } else {
        toast({
          title: "CSV validation completed",
          description: `All ${data.invalidRows} rows have errors. Please fix and try again.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Parse failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Execute upload mutation
  const executeMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const res = await fetch('/api/media/bulk-upload/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['content-assets'] });
      toast({
        title: "Bulk upload complete",
        description: `Uploaded ${data.cloudinary.uploaded}/${data.cloudinary.total} files to Cloudinary, saved ${data.database.saved} to database`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setStep('validate');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      parseMutation.mutate(content);
    };
    reader.readAsText(file);
  };

  const handleExecute = () => {
    if (!parseResult?.data) return;
    setStep('execute');
    executeMutation.mutate(parseResult.data);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/media/bulk-upload/template', {
        credentials: 'include',
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'media-upload-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download template",
        variant: "destructive",
      });
    }
  };

  const resetDialog = () => {
    setCsvFile(null);
    setCsvContent('');
    setParseResult(null);
    setUploadResult(null);
    setStep('upload');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Bulk Media Upload from CSV
          </DialogTitle>
          <DialogDescription>
            Upload multiple media files from URLs in a CSV file
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload CSV */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload CSV file or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV format: url, filename, altText, caption, tags, category
                </p>
              </label>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            {parseMutation.isPending && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Validating CSV...</p>
              </div>
            )}
          </div>
        )}

        {/* Step: Validate */}
        {step === 'validate' && parseResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Valid Rows</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{parseResult.validRows}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Invalid Rows</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{parseResult.invalidRows}</p>
              </div>
            </div>

            {parseResult.extraHeaders && parseResult.extraHeaders.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Extra columns detected</p>
                    <p className="text-sm text-yellow-700">
                      {parseResult.extraHeaders.join(', ')} will be ignored
                    </p>
                  </div>
                </div>
              </div>
            )}

            {parseResult.errors && parseResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-red-900">Validation Errors:</h4>
                <ScrollArea className="h-48 border rounded-lg p-3 bg-red-50">
                  {parseResult.errors.map((error: any, idx: number) => (
                    <div key={idx} className="mb-2 text-sm">
                      <Badge variant="destructive" className="mr-2">Row {error.row}</Badge>
                      <span className="text-red-700">{error.field}: {error.message}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleExecute}
                disabled={parseResult.validRows === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Upload {parseResult.validRows} Files
              </Button>
            </div>
          </div>
        )}

        {/* Step: Execute */}
        {step === 'execute' && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold">Uploading to Cloudinary...</p>
            <p className="text-sm text-gray-600">This may take a few moments</p>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && uploadResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-900 mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-600">{uploadResult.cloudinary.total}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-900 mb-1">Uploaded</p>
                <p className="text-2xl font-bold text-green-600">{uploadResult.cloudinary.uploaded}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-sm text-red-900 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{uploadResult.cloudinary.failed}</p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900 mb-1">Saved to Database</p>
              <p className="text-2xl font-bold text-purple-600">{uploadResult.database.saved}</p>
            </div>

            {uploadResult.uploadResults.some(r => !r.success) && (
              <div>
                <h4 className="font-semibold mb-2 text-red-900">Failed Uploads:</h4>
                <ScrollArea className="h-48 border rounded-lg p-3 bg-red-50">
                  {uploadResult.uploadResults
                    .filter(r => !r.success)
                    .map((result, idx) => (
                      <div key={idx} className="mb-2 text-sm">
                        <p className="font-medium text-red-900">{result.filename}</p>
                        <p className="text-red-700 text-xs">{result.error}</p>
                      </div>
                    ))}
                </ScrollArea>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
