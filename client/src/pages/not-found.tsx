export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content - perfectly centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-9xl md:text-[12rem] font-bold text-muted-foreground/60 select-none">
          404
        </div>
        <div className="text-6xl animate-bounce mt-4">
          🚀
        </div>
      </div>
      
      {/* Footer with JOBLANCE branding */}
      <div className="mb-8 flex items-center justify-center gap-2 text-muted-foreground">
        <span className="text-xl">🚀</span>
        <span className="font-semibold">JOBLANCE</span>
      </div>
    </div>
  );
}
