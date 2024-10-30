import fs from "fs";
import marksLog from "./models/marksLog.js";

/**
 * Calculates the distribution of marks for specified top percentage ranks.
 * @returns {Promise<Object>} - An object containing the marks distribution.
 */
export async function getMarksDistribution() {
	console.log("Starting getMarksDistribution");
	try {
		const totalAccounts = await marksLog.countDocuments().exec();
		console.log(`Total accounts: ${totalAccounts}`);

		if (totalAccounts === 0) {
			console.log("No accounts found.");
			return {
				top1: 0,
				top5: 0,
				top10: 0,
				top20: 0,
				top30: 0,
				top50: 0
			};
		}

		const batchSize = 10000; // Adjust batch size based on your memory constraints
		console.log(`Batch size: ${batchSize}`);
		let result = [];

		for (
			let currentPage = 0;
			currentPage * batchSize < totalAccounts;
			currentPage++
		) {
			console.log(`Fetching batch starting from page: ${currentPage}`);
			const batch = await marksLog
				.find({}, { marks: 1, address: 1, rank: 1, _id: 0 })
				.skip(currentPage * batchSize)
				.limit(batchSize)
				.exec();

			result = result.concat(batch);
			console.log(`Current result length: ${result.length}`);
		}

		// Perform sorting once after fetching all the data
		result.sort((a, b) => b.marks - a.marks);

		// Calculate marks for each percentage rank
		const percentages = [1, 5, 10, 20, 30, 50];
		console.log("Percentages to calculate:", percentages);

		const distribution = percentages.reduce((acc, percentage) => {
			const rank = Math.ceil((percentage / 100) * totalAccounts);
			console.log(`Calculated rank for top ${percentage}%: ${rank}`);
			acc[`top${percentage}`] = result[rank - 1]
				? result[rank - 1].marks
				: 0;
			return acc;
		}, {});

		console.log("Final distribution:", distribution);
		printDistribution(distribution);

		await writeSortedDataToFile(result);

		return distribution;
	} catch (error) {
		console.error("Error in getting marks distribution:", error);
		throw error;
	}
}

/**
 * Pretty prints the distribution of marks to the console.
 * @param {Object} distribution - The distribution of marks.
 */
function printDistribution(distribution) {
	console.log("Marks Distribution:");
	for (const [key, value] of Object.entries(distribution)) {
		console.log(`${key}: ${value}`);
	}
}

/**
 * Writes the sorted data to a file.
 * @param {Array<Object>} data - The sorted data.
 */
async function writeSortedDataToFile(data) {
	const writeStream = fs.createWriteStream("sorted_marks.txt", {
		flags: "w"
	});
	data.forEach((item) => {
		writeStream.write(`${item.marks}:${item.address}:${item.rank}\n`);
	});
	writeStream.end();
	writeStream.on("finish", () => {
		console.log("Sorted data written to file successfully.");
	});
	writeStream.on("error", (error) => {
		console.error("Error writing sorted data to file:", error);
		throw error;
	});
}
