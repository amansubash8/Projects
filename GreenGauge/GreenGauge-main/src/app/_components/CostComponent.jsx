import React from 'react'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const CostComponent = ({power, duration}) => {
  return (
    <div className='flex flex-col space-y-2 bg-green-200 border border-black px-6 py-5 rounded-xl w-fit items-start justify-center mt-7 mb-5 mx-auto'>
        <div className='flex flex-row space-x-1'>
            <AccessTimeIcon />
            <p>
                <span className='font-bold'>Duration: </span>
                {duration.toFixed(2)} hrs
            </p>
        </div>
        <div className='flex flex-row'>
            <CurrencyRupeeIcon />
            <p>
                <span className='font-bold'>Cost: </span>
                {(duration*power*6.15/1000).toFixed(4)} INR
            </p>
        </div>
    </div>
  )
}

export default CostComponent