import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  parseCSVFile, 
  validateCSVData, 
  generateCSVTemplate, 
  convertCSVRowToProductForm,
  ProductCSVRow,
  CSV_HEADERS
} from '@/utils/csvUtils';
import { createProduct } from '@/services/productService';
import { ProductFormData } from '@/services/productService';

interface BulkProductUploadProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  isMobile: boolean;
}

const BulkProductUpload: React.FC<BulkProductUploadProps> = ({ 
  onSuccess, 
  onError,
  isMobile 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ProductCSVRow[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalToUpload, setTotalToUpload] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv') {
        onError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      validateFile(file);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'text/csv') {
        onError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      validateFile(file);
    }
  };

  // Validate the uploaded CSV file
  const validateFile = async (file: File) => {
    setIsValidating(true);
    setValidationErrors([]);
    setValidationSuccess(false);
    
    try {
      const { data, errors } = await parseCSVFile(file);
      
      // Check for parsing errors
      if (errors.length > 0) {
        setValidationErrors(errors.map(err => `Parse error: ${err.message} at row ${err.row}`));
        setIsValidating(false);
        return;
      }
      
      // Validate headers
      const firstRow = data[0];
      const missingHeaders = CSV_HEADERS.filter(header => !(header in firstRow));
      
      if (missingHeaders.length > 0) {
        setValidationErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
        setIsValidating(false);
        return;
      }
      
      // Validate data
      const validation = validateCSVData(data);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setIsValidating(false);
        return;
      }
      
      // If all validations pass
      setParsedData(data);
      setValidationSuccess(true);
      setTotalToUpload(data.length);
    } catch (error) {
      console.error('Error validating CSV file:', error);
      setValidationErrors(['Failed to validate CSV file. Please check the format and try again.']);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    // Use the static template file instead of generating it dynamically
    const templateUrl = '/templates/product_upload_template.csv';
    const link = document.createElement('a');
    link.href = templateUrl;
    link.setAttribute('download', 'product_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process and upload products
  const handleUploadProducts = async () => {
    if (!parsedData.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedCount(0);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        const productData: ProductFormData = convertCSVRowToProductForm(row);
        
        try {
          const result = await createProduct(productData);
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error creating product:', error);
          errorCount++;
        }
        
        setUploadedCount(i + 1);
        setUploadProgress(Math.round(((i + 1) / parsedData.length) * 100));
      }
      
      if (errorCount > 0) {
        onError(`Uploaded ${successCount} products with ${errorCount} errors`);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading products:', error);
      onError('Failed to upload products');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setParsedData([]);
      setValidationSuccess(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    setValidationSuccess(false);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto", isMobile ? "p-2" : "p-4")}>
      <div className={cn("bg-cropsay-darkSecondary rounded-lg", isMobile ? "p-4" : "p-6")}>
        <h2 className={cn("font-medium mb-6", isMobile ? "text-lg" : "text-xl")}>
          Bulk Product Upload
        </h2>
        
        {/* Template Download Section */}
        <div className="mb-6 bg-cropsay-dark p-4 rounded-lg border border-cropsay-grayDark">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <FileText size={isMobile ? 20 : 24} className="text-cropsay-green" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">CSV Template</h3>
              <p className="text-sm text-cropsay-grayText mb-3">
                Download our CSV template with all required fields for bulk product upload.
              </p>
              <Button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 bg-cropsay-green hover:bg-green-600 text-white"
                size={isMobile ? "sm" : "default"}
              >
                <Download size={16} />
                Download Template
              </Button>
            </div>
          </div>
        </div>
        
        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload CSV File</label>
          
          {/* Drag & Drop Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
              isDragging ? "border-cropsay-green bg-cropsay-green/10" : "border-cropsay-grayDark hover:border-cropsay-grayMedium",
              selectedFile ? "bg-cropsay-dark" : ""
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FileText size={isMobile ? 32 : 40} className="text-cropsay-green mb-2" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-cropsay-grayText">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                {!isValidating && !validationSuccess && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    <X size={14} className="mr-1" /> Remove
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={isMobile ? 32 : 40} className="text-cropsay-grayText mb-2" />
                <p className="font-medium">Drag & drop your CSV file here</p>
                <p className="text-sm text-cropsay-grayText">or click to browse</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileSelect}
            />
          </div>
        </div>
        
        {/* Validation Status */}
        {isValidating && (
          <div className="mb-6 bg-cropsay-dark p-4 rounded-lg border border-cropsay-grayDark">
            <div className="flex items-center">
              <Loader size={20} className="text-cropsay-green animate-spin mr-2" />
              <p>Validating CSV file...</p>
            </div>
          </div>
        )}
        
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-900/20 p-4 rounded-lg border border-red-900/30">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400 mb-2">Validation Errors</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-300">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {validationSuccess && (
          <div className="mb-6 bg-green-900/20 p-4 rounded-lg border border-green-900/30">
            <div className="flex items-start">
              <CheckCircle size={20} className="text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-400 mb-1">Validation Successful</p>
                <p className="text-sm text-green-300">
                  {parsedData.length} products ready to upload
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 bg-cropsay-dark p-4 rounded-lg border border-cropsay-grayDark">
            <p className="mb-2 font-medium">Uploading Products...</p>
            <div className="w-full bg-cropsay-grayDark rounded-full h-2.5 mb-2">
              <div 
                className="bg-cropsay-green h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-cropsay-grayText">
              {uploadedCount} of {totalToUpload} products uploaded ({uploadProgress}%)
            </p>
          </div>
        )}
        
        {/* Instructions */}
        <div className="mb-6 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
          <div className="flex items-start">
            <Info size={20} className="text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400 mb-2">CSV Format Instructions</p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li className="text-blue-300">Use the template for correct column headers</li>
                <li className="text-blue-300">Required fields: name, category, brand, description, price, quantity</li>
                <li className="text-blue-300">For multiple image URLs, separate them with commas</li>
                <li className="text-blue-300">For tags, use comma-separated values (e.g., "Organic,Premium,Best Seller")</li>
                <li className="text-blue-300">Product type must be either "Regular" or "Organic"</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleUploadProducts}
            disabled={!validationSuccess || isUploading}
            className={cn(
              "bg-cropsay-green hover:bg-green-600 text-white flex items-center gap-2",
              isMobile ? "flex-1" : ""
            )}
          >
            {isUploading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Products
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isValidating || isUploading || (!selectedFile && !validationSuccess)}
            className={cn(
              "border-cropsay-grayDark hover:bg-cropsay-dark",
              isMobile ? "flex-1" : ""
            )}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;