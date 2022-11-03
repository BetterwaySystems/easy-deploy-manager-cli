interface ICommandBuildOptions {
  mode? : 'parallel' | 'sequential' // default sequential ( && )
  nodeVersion? : string
}
class CommandBuilder {
  mode : '&&' | '&'
  commandList: Array<string>;

  constructor(options?: ICommandBuildOptions) {
    this.commandList = [];
    this.mode= options?.mode === 'parallel' ? '&' : '&&'

    if (options?.nodeVersion) {
      this.commandList.push(`nvm use ${options.nodeVersion}`);
    }
  }

  setMode(mode : ICommandBuildOptions['mode']){
    this.mode = mode === 'parallel' ? '&' : '&&';
    return this;
  }

  add(command: string) {
    this.commandList.push(command);
    return this;
  }

  getCommand() {
    const commandString = this.commandList.join(this.mode);
    this.clear();
    
    return commandString;
  }

  clear(){
    this.commandList = [];
  }
}

export default CommandBuilder;
