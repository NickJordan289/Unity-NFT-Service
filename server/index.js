const path = require("path");
const express = require("express");
const alchemy2 = require("alchemy-sdk");

const PORT = process.env.PORT || 3001;

const app = express();
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: alchemy2.Network.ETH_MAINNET,
};
const alchemy = new alchemy2.Alchemy(settings);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

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

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
