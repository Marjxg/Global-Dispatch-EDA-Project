import solace from "solclientjs";

solace.SolclientFactory.init({
    profile: solace.SolclientFactoryProfiles.version10,
});

const factory = solace.SolclientFactory;

let session: ReturnType<typeof factory.createSession> | null = null;

export function getSolaceSession() {
    if (!session) {
        throw new Error("Solace is not connected.");
    }

    return session;
}

export function connectSolace(): Promise<void> {
    return new Promise((resolve, reject) => {
        const connection = factory.createSession({
            url: process.env.SOLACE_URL!,
            vpnName: process.env.SOLACE_VPN!,
            userName: process.env.SOLACE_USERNAME!,
            password: process.env.SOLACE_PASSWORD!,
            connectRetries: 5,
            reconnectRetries: 10,
            reconnectRetryWaitInMsecs: 3000,
        });

        let settled = false;

        connection.on(
            solace.SessionEventCode.UP_NOTICE,
            () => {
                console.log("[Solace] Connected.");
                session = connection;

                if (!settled) {
                    settled = true;
                    resolve();
                }
            }
        );

        connection.on(
            solace.SessionEventCode.CONNECT_FAILED_ERROR,
            (event) => {
                console.error("[Solace] Connection failed:", event.infoStr);

                if (!settled) {
                    settled = true;
                    reject(new Error(event.infoStr));
                }
            }
        );

        connection.on(
            solace.SessionEventCode.DOWN_ERROR,
            (event) => {
                console.error("[Solace] Connection lost:", event.infoStr);
                session = null;
            }
        );

        connection.connect();
    });
}
