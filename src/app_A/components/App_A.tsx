import * as React from 'react'

export default function App_A() {

  React.useEffect(() => {


    return () => { // clean-up function
    }
  }, [])

  return (
    <div className='container'>
      <h1 className='heading'>
          App_A welcomes you!
      </h1>


    </div>
  );

}
