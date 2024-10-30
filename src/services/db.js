import mongoose from "mongoose";
import { clearIntervalIfNeeded } from "../utils/timeouts.js";

let reconnectIntervalId = null;

mongoose.connection.on("error", (err) => {
	console.error("MongoDB connection error:", err);
	attemptReconnect();
});

export async function connectDb() {
	if (!process.env.DB_URL) throw new Error("Missing MongoDB URL");
	try {
		clearIntervalIfNeeded(reconnectIntervalId);
		await mongoose.connect(process.env.DB_URL);
		console.log("MongoDB connected successfully.");
	} catch (error) {
		console.error("Failed to connect to MongoDB:", error.message);
		attemptReconnect();
	}
}

process.on("SIGINT", () => {
	disconnectDb().then(() => {
		clearIntervalIfNeeded(reconnectIntervalId);
		console.log("Process terminated");
		process.exit(0);
	});
});

async function disconnectDb() {
	try {
		clearIntervalIfNeeded(reconnectIntervalId);
		await mongoose.disconnect();
		console.log("MongoDB disconnected successfully.");
	} catch (error) {
		console.error("Failed to disconnect from MongoDB:", error.message);
	}
}

async function attemptReconnect() {
	const reconnectInterval = 60000;

	if (!reconnectIntervalId) {
		console.log("Attempting to reconnect to MongoDB...");
		reconnectIntervalId = setInterval(async () => {
			try {
				await connectDb();
			} catch (error) {
				console.error(`Failed to reconnect to MongoDB: ${error}`);
			}
		}, reconnectInterval);
	}
}
