export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(202,138,4,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(12,10,9,0.08),_transparent_55%)]" />
      <div className="absolute top-[-20%] left-[-10%] w-[520px] h-[520px] bg-[#CA8A04]/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[520px] h-[520px] bg-black/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  )
}
