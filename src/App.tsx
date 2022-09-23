import React from 'react';
import { Text} from 'ink';
import commands from './commands';
import modules from './modules';

type Tcommand = 'bundle'| 'deploy'| 'init'| 'revert'| 'scale'| 'start'| 'status'| 'stop' | string

interface IAppProps {
  command : Tcommand | undefined
  options? : Record<string, any>
}

function getCommand(command:string | undefined ){
  if (!command) return undefined;
  return command.charAt(0).toUpperCase() + command.slice(1) as keyof typeof commands;
}

const App = ({ command, options } : IAppProps)=>{

  // For Module 테스트
  if ( options?.['module'] ) {
    if (command === 'upload') modules[command](options as any)
    return <></>
  }


  const cmd = getCommand(command);

  if (!cmd) return (
    <>
      <Text color='red'>Command not found</Text>
    </>
  )

  const Component = commands[cmd];

  if (!Component) return (
    <>
      <Text color='red'>{`${cmd} is not a command. Please use 'ed-manager --help' and see blow.`}</Text>
    </>
  )

	return <Component {...options}/>
}

export default App;
export {
  IAppProps
}