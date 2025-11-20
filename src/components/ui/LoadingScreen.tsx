import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  tip?: string;
  appName?: string;
  subtitle?: string;
}

export function LoadingScreen({
  message = "Cargando datos",
  tip = "Esto puede demorar unos momentos...",
  appName,
  subtitle
}: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8 px-4">
        {/* Logo/Icon animado */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Anillo exterior giratorio */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin" />

          {/* Anillo medio giratorio (más lento) */}
          <div
            className="absolute inset-2 border-4 border-transparent border-b-purple-500 border-l-purple-500 rounded-full animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          />

          {/* Centro con icono */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-pulse">🎮</div>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </h2>
          <p className="text-sm text-slate-400">{tip}</p>
        </div>

        {/* Barra de progreso indeterminada */}
        <div className="w-80 max-w-[90vw] h-2 mx-auto bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
          <div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            style={{
              animation: "loading-bar 1.5s ease-in-out infinite",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            }}
          />
        </div>

        {/* Footer personalizable - Estilo PlayStation */}
        {(appName || subtitle) && (
          <div className="mt-12 space-y-2">
            {appName && (
              <p className="text-xs text-slate-500">
                {appName}
              </p>
            )}
            {subtitle && (
              <p className="text-[10px] text-slate-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}
