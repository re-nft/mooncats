#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const DATA_PATH = path.resolve('./public', 'data.json');

(async function () {
  try {
    console.log('fetching new mooncats !!');
    const { data: response } = await axios.get(
      'https://rarity.studio/files/new_mooncats.csv'
    );

    const rows = response.split('\n');
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
        .split(',')
        .map((el) => el.trim().replace(/"/g, ''));
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

    if (await fs.pathExists(DATA_PATH)) await fs.unlink(DATA_PATH);

    await fs.writeFile(
      DATA_PATH,
      JSON.stringify({ created_at: new Date().toISOString(), data })
    );
  } catch (err) {
    console.warn(err);
    await fs.writeFile(
      DATA_PATH,
      JSON.stringify({ created_at: new Date().toISOString(), data: [] })
    );
    return;
  }
})();
