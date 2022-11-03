class CommandBuild {
  command: Array<string>;

  constructor() {
    this.command = [];
  }

  push(...item: Array<string>) {
    this.command = [...this.command, ...item];
  }

  getCmd(opt?: any) {
    if (opt?.prefix) this.command = [opt?.prefix, ...this.command];
    const newCommand = this.command.join(opt.operator);
    this.command = [];

    return newCommand;
  }
}

export default CommandBuild;
