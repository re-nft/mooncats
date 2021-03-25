#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require("axios");
const path = require("path");
const { promises: fs } = require("fs");
const DATA_PATH = path.resolve(__dirname, "../", "public", "data.json");
const moonCatsData = require(DATA_PATH);

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30 * 1;

(async function () {
  try {
    if (
      new Date().getTime() >=
      new Date(moonCatsData.created_at).getTime() + ONE_MONTH
    ) {
      return;
    }

    console.log("fetching new mooncats !!");
    const { data: response } = await axios.get(
      "https://rarity.studio/files/new_mooncats.csv"
    );

    const rows = response.split("\n");
    const data = rows.slice(1).reduce((acc, r) => {
      const [
        row,
        catId,
        palette,
        pattern,
        color,
        statisticalRank,
        traitRarityRank,
      ] = r
        .trim()
        .split(",")
        .map((el) => el.trim().replace(/"/g, ""));
      acc.push({
        row,
        catId,
        palette,
        pattern,
        color,
        statisticalRank,
        traitRarityRank,
      });
      return acc;
    }, []);

    await fs.writeFile(
      DATA_PATH,
      JSON.stringify({ created_at: new Date().toISOString(), data })
    );

    console.log("done :)");
  } catch (err) {
    console.log("ERROR FETCHING MOONCATS DATA. ROLLING BACK");
    await fs.writeFile(DATA_PATH, JSON.stringify(moonCatsData));
    return;
  }
})();
