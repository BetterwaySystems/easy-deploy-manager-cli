const NextBundler = function (this: any, config: any) {
  this._config = config;

  return {
    exec: NextBundler.prototype.exec,
  };
};

NextBundler.prototype.exec = function (command: string) {
  console.log("command", command);
  console.log("this._config", this._config);
};

export default NextBundler;
