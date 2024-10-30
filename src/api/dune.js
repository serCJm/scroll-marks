import got from "got";
import { HttpsProxyAgent } from "hpagent";

if (!process.env.DUNE_API) throw new Error("Missing Dune API Key!");

/**
 * Fetches data from the Dune API.
 *
 * @param {number} queryId - The query id for the API URL
 * @param {string} urlParams - The query parameters to be appended to the API URL.
 * @returns {Promise<Object|null>} The JSON response from the API or null if an error occurs.
 */
export async function fetchDune(queryId, urlParams) {
	const url = `https://api.dune.com/api/v1/query/${queryId}/results?${urlParams}`;
	console.log(`Fetching data from Dune API with URL: ${url}`);

	try {
		const response = await got(url, {
			headers: {
				"X-Dune-API-Key": process.env.DUNE_API
			},
			agent: {
				https: new HttpsProxyAgent({ proxy: process.env.PROXY })
			}
		});

		const jsonData = JSON.parse(response.body);
		console.log("Data fetched successfully.");
		return jsonData;
	} catch (error) {
		console.error(
			`Error fetching page with url ${url}:`,
			error.response?.body || error.message
		);
		return null;
	}
}
