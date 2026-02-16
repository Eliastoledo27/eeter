export default function Loading() {
   return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
         <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
               <div className="absolute inset-0 rounded-full border-t-2 border-[#c88a04] opacity-20"></div>
               <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-[#c88a04] shadow-[0_0_10px_#c88a04]"></div>
            </div>
            <div className="animate-pulse font-mono text-xs tracking-[0.2em] text-[#c88a04]">
               SYSTEM // ETER_CORE INITIALIZING...
            </div>
         </div>
      </div>
   );
}
