const InitFileValidator = function (this: any, config: any) {
  this._config = config;
};

InitFileValidator.prototype.exist = function (command: string) {
  console.log("command", command);
  console.log("this._config", this._config);
};

InitFileValidator.prototype.existBuildType = function (command: string) {
  console.log("command", command);
  console.log("this._config", this._config);
};
InitFileValidator.prototype.existAppLocaion = function (command: string) {
  console.log("command", command);
  console.log("this._config", this._config);
};

export default InitFileValidator;
