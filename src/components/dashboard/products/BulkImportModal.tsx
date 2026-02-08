'use client';

import { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { bulkImportProducts } from '@/app/actions/products';
import { toast } from 'sonner';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type ImportRow = Record<string, unknown>;

export function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus('parsing');
    setLogs([]);

    try {
      const data = await parseFile(selectedFile);
      setPreviewData(data);
      setUploadStatus('idle');
      setLogs([`Archivo parseado correctamente: ${data.length} filas encontradas.`]);
    } catch {
      // console.error(error);
      setUploadStatus('error');
      setLogs(['Error al leer el archivo. Asegúrate de que sea un CSV o Excel válido.']);
    }
  };

  const parseFile = (file: File): Promise<ImportRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<ImportRow>(sheet);
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;

    setIsUploading(true);
    setLogs(prev => [...prev, 'Iniciando carga masiva...']);

    try {
      const result = await bulkImportProducts(previewData);

      if (result.success) {
        setLogs(prev => [...prev, `✅ Carga completada. ${result.successCount} productos importados.`]);
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => {
            setLogs(prev => [...prev, `⚠️ Fila ${err.row}: ${err.error}`]);
          });
        }
        toast.success(`Se importaron ${result.successCount} productos`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setLogs(prev => [...prev, `❌ Error: ${result.error || 'Falló la importación'}`]);
        if (result.errors) {
          result.errors.forEach(err => {
            setLogs(prev => [...prev, `⚠️ Fila ${err.row}: ${err.error}`]);
          });
        }
      }
    } catch {
      setLogs(prev => [...prev, '❌ Error de red o servidor.']);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { name: "Ejemplo Zapatilla", description: "Descripción del producto", category: "Sneakers", base_price: 150, stock_by_size: JSON.stringify({ "40": 10, "42": 5 }), image_url: "https://example.com/image.jpg" }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_productos.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="text-orange-600" />
              Carga Masiva de Productos
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Sube un archivo Excel (.xlsx) o CSV para importar productos.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Download size={20} />
              </div>
              <div>
                <h4 className="text-blue-900 font-bold text-sm">Plantilla de Importación</h4>
                <p className="text-blue-600/80 text-xs">Descarga el formato correcto para evitar errores.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="border-blue-200 text-blue-700 hover:bg-blue-100 bg-white shadow-sm">
              Descargar Plantilla
            </Button>
          </div>

          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-8 transition-all bg-slate-50 text-center group hover:bg-orange-50/30">
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-orange-600 transition-colors">
              {uploadStatus === 'parsing' ? (
                <>
                  <Loader2 size={48} className="text-orange-500 animate-spin" />
                  <span className="font-bold text-slate-900">Analizando archivo...</span>
                </>
              ) : file ? (
                <>
                  <FileSpreadsheet size={48} className="text-emerald-500" />
                  <span className="font-bold text-slate-900">{file.name}</span>
                  <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                </>
              ) : (
                <>
                  <Upload size={48} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                  <span className="font-bold text-slate-700">Arrastra tu archivo aquí o haz clic para buscar</span>
                  <span className="text-xs text-slate-500">Soporta .xlsx y .csv</span>
                </>
              )}
            </div>
          </div>

          {/* Preview & Logs */}
          {logs.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 max-h-40 overflow-y-auto font-mono text-xs shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className={`mb-1 ${log.includes('❌') || log.includes('⚠️') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Preview Data Summary */}
          {previewData.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <CheckCircle size={16} className="text-emerald-600" />
              <span>Listo para importar <strong>{previewData.length}</strong> productos.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isUploading} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium">
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || isUploading}
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] font-bold shadow-lg shadow-orange-600/20"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Importar Productos'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
