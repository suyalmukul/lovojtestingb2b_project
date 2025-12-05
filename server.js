const colors = require("colors");
const { getSecrets } = require("./config/secretsManager");
const { mongodb } = require("./config/mongo");
const { setupSocket } = require("./utils/setupSocket");
const { startWatcher } = require("./utils/watcher");
const http = require("http");

const ENV = process.env.NODE_ENV || "local";
const SECRET_NAME = ENV === "staging" ? "staging/env" : "live/env";

async function startServer() {
    await getSecrets(SECRET_NAME); 
    const app = require("./app"); //
    mongodb(); 

    const server = http.createServer(app);

    setupSocket(server);

    require("./autoTriggerTesting/autotrigger");

    const PORT = process.env.B2B_PORT || 5001;

    server.listen(PORT, () => {
        console.log(colors.magenta("Server Running on Port " + PORT));
    });
}

// Run the server
startServer().catch((err) => {
    console.error("Error starting server:", err);
});
