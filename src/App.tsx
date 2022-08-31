import React from 'react';
import { Text} from 'ink';
import commands from './commands'

type Tcommand = 'bundle'| 'deploy'| 'init'| 'revert'| 'scale'| 'start'| 'status'| 'stop' | string

interface IAppProps {
  command : Tcommand | undefined
  options? : Record<string, unknown>
}

function getCommand(command:string | undefined ){
  if (!command) return undefined;
  return command.charAt(0).toUpperCase() + command.slice(1) as keyof typeof commands;
}

const App = ({ command, options } : IAppProps)=>{

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