import React from 'react'
import Device from '@/app/_components/Device'

const deviceList = [
    {
        name: 'Light Bulb',
        redirectURL: '/device/lightbulb',
        image: {
            imageURL: '/bulb.png',
            imageHeight: 150,
            imageWidth: 150,
            imageClass: 'mx-6'
        }
    },
    {
        name: 'Table Fan',
        redirectURL: '/device/table_fan',
        image: {
            imageURL: '/fan.png',
            imageHeight: 180,
            imageWidth: 180,
            imageClass: 'mx-4 my-3'
        }
    },
    {
        name: 'Hair Dryer',
        redirectURL: '/device/hair_dryer',
        image: {
            imageURL: '/hairdryer.png',
            imageHeight: 150,
            imageWidth: 150,
            imageClass: 'mx-8 my-9'
        }
    },
    {
        name: 'Induction Stove',
        redirectURL: '/device/induction_stove',
        image: {
            imageURL: '/inductionStove.png',
            imageHeight: 400,
            imageWidth: 190,
            imageClass: 'mb-20 mt-14 mx-2'
        }
    },
    {
        name: 'Iron Box',
        redirectURL: '/device/iron_box',
        image: {
            imageURL: '/ironbox.png',
            imageHeight: 200,
            imageWidth: 150,
            imageClass: 'mb-16 mt-14 mx-6'
        }
    },
    {
        name: 'Kettle',
        redirectURL: '/device/kettle',
        image: {
            imageURL: '/kettle.png',
            imageHeight: 200,
            imageWidth: 200,
            imageClass: 'my-9'
        }
    },
]

const Devices = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-12">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <h1 className="text-4xl font-bold text-white mb-4">
                Your Smart Devices
              </h1>
              <p className="text-lg text-emerald-50">
                Monitor and manage your energy consumption in real-time with our intelligent tracking system.
              </p>
            </div>
            
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-300/10 rounded-full blur-3xl" />
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {deviceList.map((device, id) => (
              <Device 
                key={id} 
                name={device.name} 
                image={device.image} 
                redirectURL={device.redirectURL}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

export default Devices