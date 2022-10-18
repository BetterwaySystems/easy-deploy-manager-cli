import React from 'react';
import { Text} from 'ink';
import commands from './commands';
import { getConfig } from './modules/common/parseJsonFile';

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

  try {
    const config = getConfig(options?.['config']);
    return <Component config={config} options={options} />
  }catch {
    if (command !== 'init') return <Component options={options} />
    else return <Text color='red'>{`${cmd} is not a command. Please use 'ed-manager --help' and see blow.`}</Text>
  }
}

export default App;
export {
  IAppProps
}
