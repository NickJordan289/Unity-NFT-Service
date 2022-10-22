const path = require("path");
const express = require("express");
const alchemy2 = require("alchemy-sdk");

const PORT = process.env.APP_SERVER_PORT || 4000;

const app = express();
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: alchemy2.Network.ETH_MAINNET,
};
const alchemy = new alchemy2.Alchemy(settings);

app.get("/api", (req, res) => {
  const nfts = alchemy.nft.getNftsForOwner(req.query.account).then(
    (nfts) => {
      res.json(nfts.ownedNfts);
    },
    (err) => {
      res.json(err);
    }
  );
});

app.get("/login", (req, res) => {
  return "keytosign";
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
