import { fetchDune } from "./api/dune.js";
import marksLog from "./models/marksLog.js";

const LIMIT = 1000;
const BATCH_SIZE = 20;
const FETCH_DELAY_MS = 5000;

export async function getWalletAddresses() {
	let params = `limit=${LIMIT}&column="rk,ua"&offset=487000`;
	let hasMoreResults = true;

	console.log("Starting to fetch wallet addresses...");

	while (hasMoreResults) {
		try {
			console.log(`Fetching data with params: ${params}`);
			const result = await fetchDune(3437255, params);

			if (result?.result?.rows) {
				console.log(`Fetched ${result.result.rows.length} rows.`);
				for (
					let i = 0;
					i < result.result.rows.length;
					i += BATCH_SIZE
				) {
					const batch = result.result.rows.slice(i, i + BATCH_SIZE);
					console.log(`Saving batch: ${i / BATCH_SIZE + 1}`);
					await saveToDatabaseBatch(batch);
				}
			}

			if (result?.next_uri) {
				params = result.next_uri.split("?")[1];
				console.log("Fetching next page...");
				// await setTimeout(FETCH_DELAY_MS);
			} else {
				hasMoreResults = false;
				console.log("No more results to fetch.");
			}
		} catch (error) {
			console.error("Error in fetching or saving data:", error.message);
			hasMoreResults = false;
		}
	}

	console.log("Finished fetching wallet addresses.");
}

/**
 * Saves a batch of wallet addresses to the database.
 *
 * @param {Array} batch - Array of objects containing wallet addresses and their ranks.
 */
async function saveToDatabaseBatch(batch) {
	const savePromises = batch.map(({ ua: address, rk: rank }) =>
		marksLog.updateOne({ address }, { address, rank }, { upsert: true })
	);

	try {
		await Promise.all(savePromises);
		console.log(`Batch saved successfully: ${batch.length} items`);
	} catch (error) {
		console.error("Error saving batch: ", error.message);
	}
}
