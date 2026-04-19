'use client';

import { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, Loader2, Download, Terminal, Database, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { bulkImportProducts } from '@/app/actions/products';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
      setLogs([`ARCHIVO_PARSEADO_EXITOSAMENTE: ${data.length} NODOS IDENTIFICADOS.`]);
    } catch {
      setUploadStatus('error');
      setLogs(['ERR_FORMAT: Error en la lectura del archivo. Se requiere CSV/XLSX estructurado.']);
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
    setLogs(prev => [...prev, 'INICIANDO_VOLCADO_MÁSTRICO...']);

    try {
      const result = await bulkImportProducts(previewData);

      if (result.success) {
        setLogs(prev => [...prev, `✅ NODO_SYNC_COMPLETE: ${result.successCount} REGISTROS_INYECTADOS.`]);
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => {
            setLogs(prev => [...prev, `⚠️ NODO_ERR_ROW_${err.row}: ${err.error}`]);
          });
        }
        toast.success(`VOLCADO_EXITOSO: ${result.successCount} PRODUCTOS EN BASE.`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setLogs(prev => [...prev, `❌ ERR_CLUSTER: ${result.error || 'FALLO_SISTEMA_IMPORT'}`]);
        if (result.errors) {
          result.errors.forEach(err => {
            setLogs(prev => [...prev, `⚠️ NODO_ERR_ROW_${err.row}: ${err.error}`]);
          });
        }
      }
    } catch {
      setLogs(prev => [...prev, '❌ ERR_CONEXION_TIMEOUT: RED INOPERATIVA.']);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { name: "Ejemplo Zapatilla", description: "Descripción del producto", category: "Sneakers", base_price: 150, stock_by_size: JSON.stringify({ "28": 5, "35": 10, "40": 10, "47": 5 }), image_url: "https://example.com/image.jpg" }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "ETER_IMPORT_SCHEMA.xlsx");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-[40px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#030303] rounded-[3.5rem] shadow-[0_0_120px_-20px_rgba(0,229,255,0.15)] border border-white/5 flex flex-col max-h-[88vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-10 pb-8 border-b border-white/5 bg-gradient-to-r from-white/[0.01] to-transparent flex items-center justify-between">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-[#00E5FF]/10 p-2 rounded-lg border border-[#00E5FF]/20">
                        <Database size={16} className="text-[#00E5FF]" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                        VOLCADO_ <span className="text-[#00E5FF]">DATA</span>
                    </h2>
                </div>
                <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">
                    IMPORTACIÓN MASIVA DE REGISTROS DESDE HOJAS DE CÁLCULO
                </p>
            </div>
          <button onClick={onClose} className="p-5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl transition-all text-white/20 hover:text-white border border-white/5 active:scale-90">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 flex-1 overflow-y-auto space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.02),transparent_60%)]">

          {/* Template Download */}
          <div className="bg-[#00E5FF]/5 p-6 rounded-[2rem] border border-[#00E5FF]/10 flex justify-between items-center group hover:bg-[#00E5FF]/10 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] border border-[#00E5FF]/20 group-hover:scale-110 transition-transform">
                <Download size={20} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">PLATILLA_SCHEMA_PROD</h4>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.1em] mt-1">FORMATO PRE-ESTABLECIDO PARA INYECCIÓN SIN ERRORES.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={downloadTemplate} className="border-white/5 text-[#00E5FF] hover:bg-[#00E5FF]/20 bg-black/40 px-6 h-12 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] font-mono">
              GET_SCHEMA
            </Button>
          </div>

          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-white/5 hover:border-[#00E5FF]/40 rounded-[2.5rem] p-16 transition-all duration-700 bg-white/[0.01] text-center group hover:bg-[#00E5FF]/5 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[#00E5FF]/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-6 text-white/10 group-hover:text-[#00E5FF] transition-all duration-700">
              {uploadStatus === 'parsing' ? (
                <>
                  <Loader2 size={56} className="text-[#00E5FF] animate-spin" strokeWidth={1.5} />
                  <span className="font-black text-xs text-white uppercase tracking-[0.4em] animate-pulse">ANALIZANDO_PAQUETES...</span>
                </>
              ) : file ? (
                <>
                  <FileSpreadsheet size={56} className="text-emerald-500" strokeWidth={1.5} />
                  <div>
                    <span className="font-black text-xl text-white block uppercase tracking-tighter">{file.name}</span>
                    <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.3em] mt-2 block">{(file.size / 1024).toFixed(1)} KB_DETECTED</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center text-white/5 group-hover:border-[#00E5FF]/40 transition-all duration-700">
                    <Upload size={40} strokeWidth={1} />
                  </div>
                  <div className="space-y-3">
                    <span className="font-black text-lg text-white/30 group-hover:text-white transition-colors block uppercase tracking-tighter">VOLCAR_ARCHIVO_AQUÍ</span>
                    <span className="text-[10px] text-white/10 font-black uppercase tracking-[0.4em]">SOPORTE_SISTEMA: *.XLSX / *.CSV</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview & Logs */}
          <AnimatePresence>
            {logs.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/80 rounded-[2rem] p-6 border border-white/5 max-h-48 overflow-y-auto font-mono text-[10px] shadow-3xl custom-scrollbar"
                >
                    <div className="flex items-center gap-3 mb-4 text-[#00E5FF]/40">
                        <Terminal size={12} />
                        <span className="font-black uppercase tracking-[0.4em]">OUTPUT_LOG:</span>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-2 font-medium tracking-tight ${log.includes('❌') || log.includes('ERR') ? 'text-rose-500/80' : log.includes('✅') || log.includes('SYNC') ? 'text-[#00E5FF]' : 'text-white/20'}`}>
                            {`[${new Date().toLocaleTimeString()}] > ${log}`}
                        </div>
                    ))}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Preview Data Summary */}
          <AnimatePresence>
            {previewData.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 text-emerald-500 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 shadow-3xl"
                >
                <CheckCircle size={20} className="text-emerald-500" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">ARCHIVO_VALIDADO: LISTO PARA LA INYECCIÓN DE <strong className="text-white">{previewData.length}</strong> REGISTROS.</span>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-white/5 bg-white/[0.01] flex justify-end gap-6 items-center">
            <div className="mr-auto hidden md:flex items-center gap-3 text-white/5">
                <ShieldAlert size={14} />
                <span className="text-[8px] font-black tracking-[0.3em] uppercase">AUDITORÍA_ACTIVA_POR_SEGURIDAD</span>
            </div>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isUploading} 
            className="text-white/20 hover:text-white uppercase px-8 h-16 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all"
          >
            ANULAR_CARGA
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || isUploading}
            className="bg-white text-black hover:bg-[#00E5FF] min-w-[200px] h-16 rounded-2xl font-black text-[10px] tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all active:scale-95 border-none"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-4 h-5 w-5 animate-spin" />
                INYECTANDO...
              </>
            ) : (
              'IMPORTAR_SISTEMA'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
