import { BatteryMedium, DoorClosed, Flame, ScanLine, Thermometer } from 'lucide-react';

const SENSOR_ICONS = {
  door: DoorClosed,
  motion: ScanLine,
  smoke: Flame,
  temperature: Thermometer,
};

export default function SensorRow({ sensor, showBattery = false }) {
  const Icon = SENSOR_ICONS[sensor.icon] ?? ScanLine;

  return (
    <div className="flex min-w-0 items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-100">{sensor.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-400">{sensor.model}</p>
        {showBattery && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
            <BatteryMedium className="h-3.5 w-3.5" />
            Bateria {sensor.battery}%
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${sensor.tone === 'safe' ? 'text-emerald-300' : 'text-slate-100'}`}>
          {sensor.status}
        </p>
        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{sensor.detail}</p>
      </div>
    </div>
  );
}
