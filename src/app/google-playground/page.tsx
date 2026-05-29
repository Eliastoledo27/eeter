'use client'

import React, { useState } from 'react';
import { 
  Mail, 
  Calendar, 
  FileSpreadsheet, 
  HardDrive, 
  MapPin, 
  ShieldAlert, 
  Send, 
  Plus, 
  FileUp, 
  Search, 
  Key, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  actionSendTestEmail,
  actionCreateTestEvent,
  actionExportTestSheets,
  actionUploadTestDrive,
  actionGetMapsAutocomplete,
  actionGetAuthUrl
} from '@/actions/google-actions';

type TabType = 'gmail' | 'calendar' | 'sheets' | 'drive' | 'maps' | 'auth';

export default function GooglePlayground() {
  const [activeTab, setActiveTab] = useState<TabType>('auth');
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>(['[System] Suite de prueba de Google API lista.']);

  // State for Gmail Form
  const [emailTo, setEmailTo] = useState('cliente-vip@example.com');
  const [emailSubject, setEmailSubject] = useState('Confirmación de Pedido VIP - Éter Store');
  const [emailBody, setEmailBody] = useState('<h1>¡Gracias por tu compra exclusiva en Éter!</h1><p>Tu orden ha sido procesada con éxito y está siendo preparada por nuestro concierge.</p>');

  // State for Calendar Form
  const [calSummary, setCalSummary] = useState('Asesoría de Estilo Exclusivo - Éter');
  const [calDesc, setCalDesc] = useState('Reunión uno a uno para discutir las prendas personalizadas del cliente.');
  const [calAttendee, setCalAttendee] = useState('cliente-vip@example.com');
  const [calDate, setCalDate] = useState('2026-06-01T15:00:00');

  // State for Sheets Form
  const [leadName, setLeadName] = useState('Santiago Bernabéu');
  const [leadEmail, setLeadEmail] = useState('santiago@example.com');
  const [leadPhone, setLeadPhone] = useState('+54 9 11 5555 5555');
  const [leadBudget, setLeadBudget] = useState('1500 USD');

  // State for Drive Form
  const [fileName, setFileName] = useState('reporte-ventas-eter.txt');
  const [fileText, setFileText] = useState('Reporte de Ventas Éter CRM - Mayo 2026\n---------------------------------------\nTotal Ventas: 45,000 USD\nLeads Nuevos: 124');

  // State for Maps Form
  const [addressInput, setAddressInput] = useState('Avenida Alvear 1800');
  const [addressPredictions, setAddressPredictions] = useState<any[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog(`Iniciando envío de email a ${emailTo}...`);
    const res = await actionSendTestEmail(emailTo, emailSubject, emailBody);
    setLoading(false);
    if (res.success && res.data) {
      addLog(`ÉXITO: Email enviado. ID: ${res.data.messageId} (Simulado: ${res.data.simulated})`);
    } else {
      addLog(`ERROR: ${res.error || 'Error desconocido'}`);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog(`Creando evento en Google Calendar...`);
    const endDate = new Date(new Date(calDate).getTime() + 60 * 60 * 1000).toISOString().split('.')[0]; // 1 hora de duración
    const res = await actionCreateTestEvent(calSummary, calDesc, new Date(calDate).toISOString(), endDate, calAttendee);
    setLoading(false);
    if (res.success && res.data) {
      addLog(`ÉXITO: Evento creado. ID: ${res.data.eventId} (Simulado: ${res.data.simulated})`);
      if (res.data.meetLink) {
        addLog(`Enlace de Google Meet generado: ${res.data.meetLink}`);
      }
    } else {
      addLog(`ERROR: ${res.error || 'Error desconocido'}`);
    }
  };

  const handleExportSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog(`Exportando fila a Google Sheets...`);
    const rowValues = [[
      new Date().toLocaleDateString(),
      leadName,
      leadEmail,
      leadPhone,
      leadBudget
    ]];
    const res = await actionExportTestSheets(rowValues);
    setLoading(false);
    if (res.success && res.data) {
      addLog(`ÉXITO: Datos añadidos a Sheets. Celdas modificadas: ${res.data.updatedCells} (Simulado: ${res.data.simulated})`);
    } else {
      addLog(`ERROR: ${res.error || 'Error desconocido'}`);
    }
  };

  const handleUploadDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog(`Subiendo archivo a Google Drive...`);
    const res = await actionUploadTestDrive(fileName, fileText);
    setLoading(false);
    if (res.success && res.data) {
      addLog(`ÉXITO: Archivo subido a Drive. ID: ${res.data.fileId} (Simulado: ${res.data.simulated})`);
      addLog(`Enlace de visualización: ${res.data.webViewLink}`);
    } else {
      addLog(`ERROR: ${res.error || 'Error desconocido'}`);
    }
  };

  const handleMapsSearch = async (val: string) => {
    setAddressInput(val);
    if (val.length < 3) return;
    const res = await actionGetMapsAutocomplete(val);
    if (res.success) {
      setAddressPredictions(res.predictions || []);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black font-sans pb-16">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-black shadow-lg shadow-cyan-500/20">
            É
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Éter Google Suite
            </h1>
            <p className="text-xs text-cyan-400 font-mono">Control de Integraciones de Google</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-400">Sandbox / Demo Mode</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Servicios Disponibles</h2>
            <nav className="space-y-2">
              {[
                { id: 'auth', label: '1. Google OAuth & Config', icon: Key },
                { id: 'gmail', label: '2. Gmail (Notificaciones)', icon: Mail },
                { id: 'calendar', label: '3. Google Calendar', icon: Calendar },
                { id: 'sheets', label: '4. Google Sheets', icon: FileSpreadsheet },
                { id: 'drive', label: '5. Google Drive', icon: HardDrive },
                { id: 'maps', label: '6. Google Maps (Direcciones)', icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      active 
                        ? 'bg-zinc-800/80 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5' 
                        : 'bg-zinc-950/40 border-white/5 text-zinc-300 hover:bg-zinc-800/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Console / Logs Panel */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">Historial de Ejecución</h3>
              <button 
                onClick={() => setLogs(['[System] Logs limpiados.'])} 
                className="text-[10px] font-mono text-zinc-500 hover:text-white underline"
              >
                Limpiar
              </button>
            </div>
            <div className="h-48 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {logs.map((log, index) => (
                <div key={index} className={`pb-1 border-b border-zinc-900/50 ${log.includes('ERROR') ? 'text-pink-500' : log.includes('ÉXITO') ? 'text-cyan-400' : 'text-zinc-400'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Playground Content */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Active Tab Panel */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 min-h-[500px] flex flex-col justify-between">
            
            <div>
              {/* Auth Connection / Info */}
              {activeTab === 'auth' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <Key className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Google Auth & Configuración del Entorno</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Para el funcionamiento en tiempo real de estas integraciones, se requiere vincular las claves de tu Google Cloud Console.
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl space-y-3 font-mono text-xs">
                    <p className="text-zinc-500 font-bold"># VARIABLES REQUERIDAS (.env.local)</p>
                    <p><span className="text-cyan-400">GOOGLE_CLIENT_ID</span>=tu_client_id.apps.googleusercontent.com</p>
                    <p><span className="text-cyan-400">GOOGLE_CLIENT_SECRET</span>=tu_client_secret</p>
                    <p><span className="text-cyan-400">GOOGLE_REFRESH_TOKEN</span>=tu_refresh_token</p>
                    <p><span className="text-pink-400">GOOGLE_MAPS_API_KEY</span>=tu_google_maps_key</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-zinc-300">Paso a paso para obtener las credenciales:</h4>
                    <ol className="list-decimal pl-5 text-sm text-zinc-400 space-y-2">
                      <li>Crea un proyecto en <a href="https://console.cloud.google.com/" target="_blank" className="text-cyan-400 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3.5 h-3.5" /></a>.</li>
                      <li>Habilita las APIs requeridas: **Gmail API**, **Google Calendar API**, **Google Sheets API**, **Google Drive API** y **Places API**.</li>
                      <li>Crea una pantalla de consentimiento OAuth interna o externa.</li>
                      <li>Crea credenciales de tipo **ID de cliente de OAuth 2.0** con la URI de redirección autorizada configurada.</li>
                    </ol>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500">Estado de credenciales locales:</span>
                      <p className="text-sm font-bold text-cyan-400">Modo Simulación (Seguro para Pruebas)</p>
                    </div>
                    <button
                      onClick={async () => {
                        addLog('Generando URL de Autorización OAuth2...');
                        const res = await actionGetAuthUrl();
                        if (res.success) {
                          addLog(`Redirección de login generada: ${res.url}`);
                          window.open(res.url, '_blank');
                        }
                      }}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 border border-white/5"
                    >
                      <span>Simular Conexión OAuth2</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Gmail Playground */}
              {activeTab === 'gmail' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">1. Gmail: Notificación de Pedido VIP</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Envía un correo estructurado en HTML premium simulando una confirmación de compra de un cliente en Éter.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Destinatario (Email)</label>
                      <input 
                        type="email" 
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Asunto</label>
                      <input 
                        type="text" 
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Contenido (HTML)</label>
                      <textarea 
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        rows={4}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Correo de Prueba</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Calendar Playground */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <Calendar className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">2. Google Calendar: Reserva de Asesoría</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Crea eventos y genera enlaces automáticos de Google Meet para sesiones privadas con clientes.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Título del Evento</label>
                        <input 
                          type="text" 
                          value={calSummary}
                          onChange={(e) => setCalSummary(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Email del Asistente</label>
                        <input 
                          type="email" 
                          value={calAttendee}
                          onChange={(e) => setCalAttendee(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Fecha y Hora</label>
                      <input 
                        type="datetime-local" 
                        value={calDate}
                        onChange={(e) => setCalDate(e.target.value)}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Descripción</label>
                      <textarea 
                        value={calDesc}
                        onChange={(e) => setCalDesc(e.target.value)}
                        rows={2}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creando Reunión...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Agendar Reunión</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Sheets Playground */}
              {activeTab === 'sheets' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">3. Google Sheets: Registro de Leads CRM</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Exporta datos calificados de leads capturados en Éter CRM para analizarlos en una planilla compartida.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleExportSheets} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Nombre del Lead</label>
                        <input 
                          type="text" 
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Email del Lead</label>
                        <input 
                          type="email" 
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">WhatsApp / Teléfono</label>
                        <input 
                          type="text" 
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Presupuesto Estimado</label>
                        <input 
                          type="text" 
                          value={leadBudget}
                          onChange={(e) => setLeadBudget(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Exportando...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Exportar Lead a Google Sheets</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Drive Playground */}
              {activeTab === 'drive' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <HardDrive className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">4. Google Drive: Guardado de Archivos</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Sube reportes, facturas o archivos de catálogo directamente a Google Drive para almacenamiento corporativo.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUploadDrive} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Nombre del Archivo</label>
                      <input 
                        type="text" 
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Contenido del Archivo</label>
                      <textarea 
                        value={fileText}
                        onChange={(e) => setFileText(e.target.value)}
                        rows={4}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-all text-white" 
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Subiendo archivo...</span>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-4 h-4" />
                          <span>Subir a Google Drive</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Maps Playground */}
              {activeTab === 'maps' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <MapPin className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">5. Google Maps: Autocompletado de Direcciones</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Simula la búsqueda y autocompletado de direcciones que se usaría en el carrito de compras de la tienda Éter.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">Escribe una dirección</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={addressInput}
                          onChange={(e) => handleMapsSearch(e.target.value)}
                          placeholder="Empieza a escribir, ej. Av. Alvear..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white" 
                        />
                        <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-3" />
                      </div>
                    </div>

                    {addressPredictions.length > 0 && (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-900">
                        {addressPredictions.map((pred, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setAddressInput(pred.description);
                              setAddressPredictions([]);
                              addLog(`Dirección seleccionada: "${pred.description}"`);
                            }}
                            className="p-3 hover:bg-zinc-900 cursor-pointer text-sm text-zinc-300 transition-all flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span>{pred.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Simulated / Real State Indicator */}
            <div className="border-t border-zinc-800/80 pt-5 mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-zinc-400">
                  Las funciones cuentan con fallbacks dinámicos en caso de no tener configuradas las API keys.
                </span>
              </div>
              <span className="text-[10px] font-mono bg-zinc-950 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Simulador Activo
              </span>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
