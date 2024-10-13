/** @format */

import fetch from "node-fetch";
import * as fs from "fs";
import * as ffmpeg from "fluent-ffmpeg";
import { spawn, spawnSync } from "child_process";

export const downloadM3U8 = async (m3u8Url: string, outputFile: string) => {
    // Step 1: Fetch the m3u8 file
    const response = await fetch(m3u8Url);
    const m3u8Content = await response.text();

    // Extract media segment URLs
    const segmentUrls = m3u8Content
        .split("\n")
        .filter((line) => line && !line.startsWith("#"));

    // Step 2: Download media segments

    if (!fs.existsSync(".temp")) fs.mkdirSync(".temp");

    fs.writeFileSync(".temp/video.m3u8", m3u8Content);

    const downloadedSegments: string[] = [];
    for (const segmentUrl of segmentUrls) {
        const segmentFileName = `.temp/segment_${segmentUrls.indexOf(
            segmentUrl
        )}.ts`;
        await downloadSegment("https:" + segmentUrl, segmentFileName);
				process.stdout.write(`${segmentUrls.indexOf(segmentUrl)}/${segmentUrls.length}\r`);
        downloadedSegments.push(
            "file " + segmentFileName.replace(".temp/", "")
        );
    }

    // Step 3: Concatenate and convert to mp3 using FFmpeg
    fs.writeFileSync("files.txt", downloadedSegments.join("\n"));
    spawnSync("./convert.sh");
		fs.unlinkSync("files.txt");
    fs.unlinkSync(".temp");
};

export const downloadSegment = async (
    url: string,
    fileName: string
): Promise<void> => {
    const response = await fetch(url);
    const fileStream = fs.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
        response.body?.pipe(fileStream);
        response.body?.on("error", reject);
        fileStream.on("finish", resolve);
    });
};
