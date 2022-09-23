import { Client, ClientErrorExtensions } from "ssh2";
import { readFileSync } from "fs";

interface ISSHConfig {
	host: string;
	port: number | 22;
	username: string;
	password?: string;
	privateKey?: Buffer;
}

interface ISSH {
	_client: Array<Client> | null;
	closeAllConnections: Function;
}

const SSH = function (this: any, configList: Array<ISSHConfig>) {
	return new Promise<ISSH>((resolve, reject) => {
		this._client = configList.map((config) => {
			const conn = new Client();
			conn
				.once("ready", (err: Error & ClientErrorExtensions) => {
					if (err) {
						this._client = null;
						return reject(err);
					}
					console.log(`${config.host}:${config.port} is connect`);
				})
				.once("close", () => {
					console.log(`${config.host}:${config.port} is closed`);
				})
				.once("error", (err: Error) => {
					console.log(`${config.host}:${config.port} cannot connected`);
					this._client = null;
					return reject(err);
				})
				.connect(config);

			return conn;
		});

		resolve(this);
	});
};

SSH.prototype.closeAllConnections = function() {
	return Promise.all(this._client.map((c:Client) => c.end()));
}

const connection = async ({ module }: { module: boolean }) => {
	const configList : Array<ISSHConfig> = [
		{
			host: "3.37.232.213",
			port: 22,
			username: "ec2-user",
			privateKey: readFileSync(
				"/Users/a220403/Documents/Key/dev-platformteam-server-key.pem",
			),
		},
	];

	if (module) {
		const client: ISSH = await new (SSH as any)(configList);

		setTimeout(async () => {
			await client.closeAllConnections();
		}, 3000);
	}
};

export { SSH, connection };
