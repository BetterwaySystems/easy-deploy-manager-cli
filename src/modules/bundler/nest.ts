const NestBundler = function (this: any, config: any) {
  this._config = config;

  return {
    exec: NestBundler.prototype.exec,
  };
};

NestBundler.prototype.exec = function (command: string) {
  console.log("command", command);
  console.log("this._config", this._config);
};

export default NestBundler;
