declare type Tcommand = 'build' | 'deploy' | 'init' | 'revert' | 'scale' | 'start' | 'status' | 'stop' | string;
interface IAppProps {
    command: Tcommand | undefined;
    options?: Record<string, unknown>;
}
declare const App: ({ command, options }: IAppProps) => JSX.Element;
export default App;
export { IAppProps };
