import React from 'react';
import Link from 'next/link';
import { Lightbulb, Fan, Wind, Flame, Anvil, Coffee } from 'lucide-react';

const getDeviceIcon = (name) => {
  const iconProps = {
    className: "w-8 h-8 transition-all duration-300 group-hover:text-emerald-600",
    strokeWidth: 1.5
  };
  
  switch (name) {
    case 'Light Bulb': return <Lightbulb {...iconProps} />;
    case 'Table Fan': return <Fan {...iconProps} />;
    case 'Hair Dryer': return <Wind {...iconProps} />;
    case 'Induction Stove': return <Flame {...iconProps} />;
    case 'Iron Box': return <Anvil {...iconProps} />;
    case 'Kettle': return <Coffee {...iconProps} />;
    default: return <Lightbulb {...iconProps} />;
  }
};

const randomUsage = () => Math.floor(50 + Math.random() * 50);

const Device = ({ image, name, redirectURL }) => {
  return (
    <Link href={redirectURL}>
      <div className="group relative overflow-hidden bg-white rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-100 border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col items-center space-y-6">
          <div className="p-6 bg-gradient-to-br from-emerald-100/80 to-teal-100/80 rounded-2xl group-hover:scale-110 transition-all duration-500 shadow-lg shadow-emerald-100/20">
            {getDeviceIcon(name)}
          </div>
          
          <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
            {name}
          </h2>
          
          <div className="absolute top-0 right-0 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Active
            </span>
          </div>
          
          <div className="w-full space-y-2">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500 group-hover:scale-x-110 origin-left"
                style={{ width: '75%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Usage</span>
              <span>{randomUsage()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default Device