export const EduLiteLogo = ({ className = "", size = 40 }: { className?: string; size?: number }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-primary">
        <path 
          d="M4 19.5V4.5A1.5 1.5 0 015.5 3h7A1.5 1.5 0 0114 4.5v15a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 014 19.5zM10 3v18" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <circle cx="18" cy="6" r="2" fill="hsl(var(--edu-indigo))" className="animate-pulse"/>
        <path 
          d="M16 8l2 2M20 6l-2 2" 
          stroke="hsl(var(--edu-indigo))" 
          strokeWidth="1" 
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        EduLite
      </span>
    </div>
  );
};