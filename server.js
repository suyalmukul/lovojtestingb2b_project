const colors = require("colors");
const fs = require("fs");
const path = require("path");
const { mongodb } = require("./config/mongo");
const { setupSocket } = require("./utils/setupSocket");
const { startWatcher } = require("./utils/watcher");
const http = require("http");

const ENV = process.env.NODE_ENV || "local";
const SECRET_NAME = ENV === "staging" ? "staging/env" : "live/env";

// Conditionally require secretsManager if it exists
let getSecrets = null;
const secretsManagerPath = path.join(__dirname, "config", "secretsManager.js");
if (fs.existsSync(secretsManagerPath)) {
    try {
        const secretsManager = require("./config/secretsManager");
        getSecrets = secretsManager.getSecrets;
    } catch (error) {
        console.warn(colors.yellow("Warning: Could not load secretsManager.js"), error.message);
    }
} else {
    console.log(colors.yellow("Info: secretsManager.js not found. Skipping AWS Secrets Manager. Using environment variables directly."));
}

async function startServer() {
    // Try to get secrets if secretsManager is available, but don't fail if it's not
    if (getSecrets) {
        try {
            await getSecrets(SECRET_NAME);
            console.log(colors.green("✅ Secrets loaded from AWS Secrets Manager"));
        } catch (err) {
            console.warn(colors.yellow("⚠️  Warning: Could not load secrets from AWS Secrets Manager. Continuing with existing environment variables."));
            console.warn(colors.yellow("   Error:"), err.message);
        }
    }
    
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

//ms mukul