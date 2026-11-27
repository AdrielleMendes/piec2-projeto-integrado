import { Maximize2, MapPin } from 'lucide-react';

export default function CameraCard({ camera, onOpen, large = false }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(camera)}
      className={`group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-left shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nx-bg)] cursor-pointer ${
        large ? 'aspect-[16/9]' : 'aspect-[16/10]'
      }`}
      aria-label={`Abrir câmera ${camera.name}`}
    >
      <img
        src={camera.image}
        alt={`Visualização da câmera ${camera.name}`}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/5 to-slate-950/40" />

      <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2 sm:left-4 sm:right-4 sm:top-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          AO VIVO
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/65 text-white opacity-100 backdrop-blur-md transition group-hover:bg-blue-600 sm:opacity-0 sm:group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <h3 className="text-base font-bold text-white sm:text-lg">{camera.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300 sm:text-sm">
          <MapPin className="h-3.5 w-3.5 text-slate-300" />
          {camera.location}
        </p>
      </div>
    </button>
  );
}
