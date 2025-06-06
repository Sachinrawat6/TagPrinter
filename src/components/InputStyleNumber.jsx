import React, { useState } from 'react'
import TagPrint from './TagPrint';
import QzPrint from './QzPrint';

const InputStyleNumber = () => {
    const [styleNumber, setStyleNumber] = useState("");
    const [size, setSize] = useState("");

  return (
    <div className='w-2xl bg-gray-50 mt-10 p-10 shadow-xs rounded-xl mx-auto'>
        <h2 className='font-medium text-xl text-gray-700'>Tag Generator</h2>
        <form className='mt-4 flex gap-2'>
            <input
            className='border py-2 px-4 rounded border-gray-300 outline-blue-100 w-full'
            onChange={(e)=>setStyleNumber(e.target.value)}
            type="text" placeholder='Enter style number...' />
            <select
            className='border outline-blue-100 border-gray-300 w-full rounded'
            onChange={(e)=>setSize(e.target.value)}
            >
                <option value="">Select Size</option>
                <option value="XXS">XXS </option>
                <option value="XS">XS </option>
                <option value="S">S </option>
                <option value="M">M </option>
                <option value="L">L </option>
                <option value="XL">XL </option>
                <option value="2XL">2XL </option>
                <option value="3XL">3XL </option>
                <option value="4XL">4XL</option>
                <option value="5XL">5XL</option>
            </select>
        </form>
        {/* {styleNumber && size ?<TagPrint styleNumber={styleNumber} size={size} />:""} */}
        {styleNumber && size ?<QzPrint styleNumber={styleNumber} size={size} />:""}
        

    </div>
  )
}

export default InputStyleNumber