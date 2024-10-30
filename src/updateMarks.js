import got from "got";
import { setTimeout } from "timers/promises";
import marksLog from "./models/marksLog.js";

const PAGE_SIZE = 100; // Define your PAGE_SIZE constant
/**
 * Main function to update marks for all wallet addresses in the database.
 * @returns {Promise<void>} - A promise that resolves when the update process is complete.
 */
export async function updateMarks() {
	try {
		let page = 0;
		let hasMoreData = true;

		while (hasMoreData) {
			const walletAddresses = await fetchWalletAddresses(page);
			if (walletAddresses.length === 0) {
				hasMoreData = false;
			} else {
				await processBatches(walletAddresses);
				console.log(`Processed page ${page + 1}`);
				page++;
			}
		}

		console.log("Marks updated successfully");
	} catch (error) {
		console.error("Error updating marks:", error);
	}
}

/**
 * Fetches a chunk of wallet addresses from the database.
 * @param {number} page - The page number to fetch.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of wallet addresses.
 */
async function fetchWalletAddresses(page) {
	return await marksLog
		.find({}, "address")
		.skip(page * PAGE_SIZE)
		.limit(PAGE_SIZE)
		.lean()
		.exec();
}

/**
 * Processes wallet addresses in batches and updates the database.
 * @param {Array<Object>} walletAddresses - An array of wallet addresses to process.
 * @returns {Promise<void>} - A promise that resolves when the processing is complete.
 */
async function processBatches(walletAddresses) {
	const BATCH_SIZE = 20;
	while (walletAddresses.length) {
		const batch = walletAddresses.splice(0, BATCH_SIZE);
		const requests = batch.map(function ({ address }) {
			return fetchPointsForAddress(address);
		});
		const results = await Promise.all(requests);
		await updateMarksInDatabase(results);
		await setTimeout(1000);
	}
}

/**
 * Fetches the points for a given wallet address.
 * @param {string} address - The wallet address to fetch points for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the address and points.
 */
async function fetchPointsForAddress(address) {
	try {
		const response = await got
			.get(
				`https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/scroll/wallet-points?walletAddress=${address}`
			)
			.json();
		return {
			address,
			points: response?.[0].points || 0
		};
	} catch (error) {
		console.error(`Error fetching points for ${address}:`, error.message);
		return { address, points: null }; // Default to 0 points in case of an error
	}
}

/**
 * Updates the marks in the database for a given set of results.
 * @param {Array<Object>} results - An array of objects containing the address and points.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
async function updateMarksInDatabase(results) {
	const updatePromises = results.map(function ({ address, points }) {
		return marksLog.updateOne({ address }, { marks: points });
	});
	await Promise.all(updatePromises);
}
