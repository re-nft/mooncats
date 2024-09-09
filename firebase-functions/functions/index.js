const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const moonCatMeta = {
  name: "Astrocat",
  description: "reNFT Genesis Card #1. To the Moon, Cat.",
  image: "ipfs://QmeJG3cax4mZ3fxDAWopck27hCKBHRYmdSJ27r9xRE9LSc/nft_1080p.jpg",
  image_preview:
    "ipfs://QmeJG3cax4mZ3fxDAWopck27hCKBHRYmdSJ27r9xRE9LSc/nft_320p.jpg",
  animation_url:
    "ipfs://QmeJG3cax4mZ3fxDAWopck27hCKBHRYmdSJ27r9xRE9LSc/nft.mp4",
  /* eslint-disable */
  properties: {
    twitter: "@renftlabs",
    video: "ipfs://QmeJG3cax4mZ3fxDAWopck27hCKBHRYmdSJ27r9xRE9LSc/nft.mp4",
    animation_url:
      "ipfs://QmeJG3cax4mZ3fxDAWopck27hCKBHRYmdSJ27r9xRE9LSc/nft.mp4",
    image_preview:
      "ipfs://QmeJG3cax4mZ3fxDAWopck27hCKBHRYmdSJ27r9xRE9LSc/nft_320p.jpg",
    "early bird": "gets the worm",
    reNFT: "genesis NFT",
  },
  /* eslint-enable */
};

/**
 * Handles the meta requests
 * @param {*} req request
 * @param {*} res response
 */
function getMetaHandler(req, res) {
  const tokenId = req.query.id;
  switch (tokenId) {
    case "1":
      res.json(moonCatMeta);
      res.set("Access-Control-Allow-Origin", "*");
      break;
    default:
      // TODO: throw 200
      res.json({});
      break;
  }
}

exports.getMeta = functions.https.onRequest(getMetaHandler);
