/** @format */

import puppeteer from "puppeteer";
import { downloadM3U8 } from "./m3u8";

(async () => {
    const url =
        "https://kisskh.co/Drama/Harry-Potter-And-The-Order-Of-The-Phoenix/Episode-1?id=1963&ep=49217&page=0&pageSize=100"; // Replace this with your desired URL

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // To store all the requested resources
    const resources: string[] = [];

    // Intercepting all requests made by the page
    page.on("request", async(request) => {
        resources.push(request.url());
        if (request.url().toLowerCase().includes("m3u8")) {
            console.log(request.url());
            await downloadM3U8(request.url(), "output.mp4");

            process.exit(0);
        }
    });

    try {
        // Navigate to the provided URL
        await page.goto(url, {
            waitUntil: "networkidle2", // waits until no more than 2 network connections for at least 500ms
        });

        var m3u8Url = resources.find((resource) =>
            resource.toLowerCase().includes("m3u8")
        );

        if (!m3u8Url) {
            console.log("No m3u8 URL found.");
            process.exit(1);
        }
    } catch (error) {
        console.error("Error loading page:", error);
    } finally {
        await browser.close();
    }
})();
