import { BatteryMedium, DoorClosed, Droplets, Flame, ScanLine, Thermometer, Wifi } from 'lucide-react';

const SENSOR_ICONS = {
  door: DoorClosed,
  motion: ScanLine,
  smoke: Flame,
  temperature: Thermometer,
  humidity: Droplets,
};

const TONE_CLASSES = {
  safe: 'text-emerald-300',
  alert: 'text-red-300',
  neutral: 'text-slate-100',
};

const TELEMETRY_LABELS = {
  presence: 'Presença',
  smoke: 'Gás / fumaça',
  temperature: 'Temperatura',
  humidity: 'Umidade',
};

export default function SensorRow({ sensor, showBattery = false }) {
  const Icon = SENSOR_ICONS[sensor.icon] ?? ScanLine;

  return (
    <div className="flex min-w-0 items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${sensor.tone === 'alert' ? 'bg-red-400/10 text-red-300' : 'bg-slate-800/80 text-slate-300'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-100">{TELEMETRY_LABELS[sensor.telemetryKey] ?? sensor.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-400">{sensor.model}</p>
        {showBattery && sensor.telemetryKey && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
            <Wifi className="h-3.5 w-3.5" />
            Telemetria via Arduino
          </p>
        )}
        {showBattery && !sensor.telemetryKey && sensor.battery != null && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
            <BatteryMedium className="h-3.5 w-3.5" />
            Bateria {sensor.battery}%
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${TONE_CLASSES[sensor.tone] ?? TONE_CLASSES.neutral}`}>
          {sensor.status}
        </p>
        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{sensor.detail}</p>
      </div>
    </div>
  );
}
