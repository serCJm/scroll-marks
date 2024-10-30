import { getMarksDistribution } from "./getMarksDistribution.js";
import { connectDb } from "./services/db.js";

process.on("unhandledRejection", (reason) => {
	const errorMessage =
		reason instanceof Error ? reason.stack || reason.message : reason;
	console.error(`Unhandled Rejection at Promise. Error: ${errorMessage}`);
	process.exit(1);
});

await connectDb();
// await getWalletAddresses();
// await updateMarks();
await getMarksDistribution();
