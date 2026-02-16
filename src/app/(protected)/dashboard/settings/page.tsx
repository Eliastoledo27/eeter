'use client';

import { useState } from 'react';
import { SettingsForm } from '@/components/admin/settings/v2/SettingsForm';
import { Settings, Shield, Bell, Palette, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'billing', label: 'Facturación', icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="animate-in fade-in duration-700 pb-20 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
          Configuración
        </h1>
        <p className="text-gray-400 text-sm font-medium max-w-md">
          Gestiona las preferencias y ajustes globales de la plataforma.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full lg:w-64 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === tab.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <SettingsForm category={activeTab} />
        </div>
      </div>
    </div>
  );
}
