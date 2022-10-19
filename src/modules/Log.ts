import chalk from 'chalk';

class Log {
  
  name;
  _log;
  _chalk;
  
  constructor(name: string){
    this.name = name;
    this._log = console.log;
    this._chalk = chalk;
  }

  info(message : string){
    message = `[ INFO ] ${this.name} : ${message}`;
    this._log(chalk.blue(message));
  }
  warn(message : string){
    message = `[ WRAN ] ${this.name} : ${message}`;
    this._log(chalk.yellow(message));
  }
  error(message : string){
    message = `[ ERROR ] ${this.name} : ${message}`;
    this._log(chalk.red(message));
  }
}

export default Log;