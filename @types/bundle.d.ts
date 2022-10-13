export {};

declare global {
  type TBuildType = 'next' | 'nest';

  interface IBundler {
    exec(): any;
  }

  interface IBuilder {
    exec(): any;
    validator(): any;
  }
}
