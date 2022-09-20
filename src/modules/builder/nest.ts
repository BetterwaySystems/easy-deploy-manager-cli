const NestBuilder = function (this: any, config: any) {
  this._config = config;

  return {
    exec: NestBuilder.prototype.exec,
  };
};

NestBuilder.prototype.exec = function (command: string) {
  console.log("command", command);
  console.log("this._config", this._config);
};

export default NestBuilder;
