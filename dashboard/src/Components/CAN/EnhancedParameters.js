import { useState, useEffect } from 'react';
import { 
  Percent, 
  Droplet, 
  Thermometer, 
  ArrowUpCircle, 
  Flame, 
  Zap, 
  AlertOctagon, 
  Truck,
  Activity,
  GaugeCircle
} from 'lucide-react';

// Data for the gauges
const vehicleData = {
  relativeThrottlePosition: { value: 4.40, unit: "%", icon: Percent, title: "REL THROTTLE POS", max: 100, steps: [0, 25, 50, 75, 100], warning: 90, danger: 95 },
  absoluteEvapSystemVaporPressure: { value: 12.40, unit: "kPa", icon: Droplet, title: "EVAP SYS PRESSURE", max: 30, steps: [0, 7.5, 15, 22.5, 30], warning: 25, danger: 28 },
  engineOilTemperature: { value: 92.30, unit: "°C", icon: Thermometer, title: "OIL TEMPERATURE", max: 150, steps: [0, 35, 70, 105, 140], warning: 110, danger: 120 },
  relativeAcceleratorPedalPosition: { value: 5.80, unit: "%", icon: ArrowUpCircle, title: "REL PEDAL POS", max: 100, steps: [0, 25, 50, 75, 100], warning: 90, danger: 95 },
  engineFuelRate: { value: 4.65, unit: "L/h", icon: Flame, title: "FUEL RATE", max: 20, steps: [0, 5, 10, 15, 20], warning: 18, danger: 19 },
  driversDemandEnginePercentTorque: { value: 28.40, unit: "%", icon: Zap, title: "DEMAND TORQUE", max: 100, steps: [0, 25, 50, 75, 100], warning: 90, danger: 95 },
  actualEnginePercentTorque: { value: 27.20, unit: "%", icon: Zap, title: "ACTUAL TORQUE", max: 100, steps: [0, 25, 50, 75, 100], warning: 90, danger: 95 },
  engineReferenceTorque: { value: 385.00, unit: "N-m", icon: AlertOctagon, title: "REF TORQUE", max: 600, steps: [0, 150, 300, 450, 600], warning: 550, danger: 580 },
  cylinderFuelRate: { value: 12.35, unit: "mg/stroke", icon: Truck, title: "CYL FUEL RATE", max: 25, steps: [0, 6.25, 12.5, 18.75, 25], warning: 20, danger: 22 }
};

// Gauge component
const Gauge = ({ data }) => {
  const { value, unit, icon: Icon, title, max, warning, danger } = data;
  const percentage = (value / max) * 100;
  
  // Determine color based on value
  const getColor = () => {
    if (value >= danger) return "text-red-500";
    if (value >= warning) return "text-yellow-400";
    return "text-blue-400";
  };

  return (
    <div className="rounded-xl p-4 bg-gray-900 shadow-lg border border-gray-800 transition-all duration-300 hover:shadow-blue-900/30 hover:border-blue-900/50">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`${getColor()}`} size={20} />
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className={`text-lg font-bold ${getColor()}`}>
          {value.toFixed(1)}{unit}
        </div>
      </div>
      
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mt-2">
        <div 
          className={`absolute top-0 left-0 h-full ${value >= danger ? 'bg-red-500' : value >= warning ? 'bg-yellow-400' : 'bg-blue-500'} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        {data.steps.map((step, index) => (
          <span key={index}>{step}</span>
        ))}
      </div>
    </div>
  );
};

// Circular Gauge for featured metrics
const CircularGauge = ({ data }) => {
  const { value, unit, icon: Icon, title, max, warning, danger } = data;
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on value
  const getColor = () => {
    if (value >= danger) return "text-red-500 stroke-red-500";
    if (value >= warning) return "text-yellow-400 stroke-yellow-400";
    return "text-blue-400 stroke-blue-400";
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800 hover:shadow-blue-900/30 hover:border-blue-900/50 transition-all duration-300">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <Icon className={getColor()} size={24} />
          <span className={`text-3xl font-bold ${getColor()}`}>{value.toFixed(1)}</span>
          <span className={`text-sm font-medium ${getColor()}`}>{unit}</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="mt-1 flex justify-center gap-2">
          <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">{0}</span>
          <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">{max}</span>
        </div>
      </div>
    </div>
  );
};

export default function VehicleDashboard() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black p-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CircularGauge data={vehicleData.engineOilTemperature} />
        <CircularGauge data={vehicleData.engineFuelRate} />
        <CircularGauge data={vehicleData.actualEnginePercentTorque} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(vehicleData).map((data, index) => (
          <Gauge key={index} data={data} />
        ))}
      </div>
      
      <footer className="mt-8 text-center text-gray-500 border-t border-gray-800 pt-4">
        <p>Vehicle Diagnostics Interface • OBD-II Monitor</p>
      </footer>
    </div>
  );
}