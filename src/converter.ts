import fs from "fs/promises";
import { xml2json, json2xml } from "xml-js";
import { gunzip, gzip } from "../utils/zlib";
import { mkdir } from "../utils/file";

export const alsToJson = async (fileName: string): Promise<void> => {
  try {
    const fileContent = await fs.readFile(`live_set/ableton/${fileName}.als`);
    const unzippedALS = await gunzip(fileContent);
    const json = xml2json(unzippedALS.toString(), { compact: true, spaces: 4 });
    await mkdir("live_set/json");
    await fs.writeFile(`live_set/json/${fileName}.json`, json);
  } catch (error: any) {
    throw new Error(
      `An error occurred while converting the Ableton file to JSON. ${error.message}`
    );
  }
};

export const jsonToAls = async (fileName: string): Promise<void> => {
  try {
    const fileContent = await fs.readFile(`live_set/json/${fileName}.json`);
    let xml = json2xml(fileContent.toString(), { compact: true, spaces: 4 });
    // Fix unescaped ampersands in attribute values that xml-js doesn't re-escape.
    // Matches & that is NOT already part of &amp; &lt; &gt; &quot; &apos; or a numeric ref.
    xml = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, "&amp;");
    await mkdir("live_set/ableton/");
    const zipped = await gzip(xml);
    await fs.writeFile(`live_set/ableton/${fileName}.als`, zipped);
  } catch (error: any) {
    throw new Error(
      `An error occurred while converting the JSON file to Ableton file. ${error.message}`
    );
  }
};
