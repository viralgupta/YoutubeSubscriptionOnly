import React from 'react'

const Spinner = () => {
    return (
        <>
            <div className="flex justify-center m-0 p-0" >
                <object type="image/svg+xml" data='/static/loading.svg'>svg-animation</object>
            </div>
            <div className='text-center text-white m-2 text-xl -translate-y-6'>
                Fetching Video Content...
            </div>
        </>
    )
}
export default Spinner;