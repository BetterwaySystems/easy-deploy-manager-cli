import React from 'react';
import { Text} from 'ink';

interface IInitProps {
  type? : 'next' | 'nest'
}

const Init = ( props : IInitProps)=>{
	return (
    <>
		  <Text>{props.type} Initialize Complate</Text>
	  </>
  )
}

export default Init;
export {
  IInitProps
}