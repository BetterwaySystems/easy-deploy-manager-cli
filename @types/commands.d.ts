export {}

declare global {
  interface ICommandProps {
    config?: IDefaultInitInfo
    options? : Record<string, any>
  }
}