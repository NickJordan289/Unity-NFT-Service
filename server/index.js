import express from "express";
import { Network, Alchemy } from "alchemy-sdk";
import { CosmosClient } from "@azure/cosmos";
import * as util from "ethereumjs-util";
import cors from "cors";

const PORT = process.env.APP_SERVER_PORT || 4000;
// const key = process.env.COSMOS_KEY;
// const endpoint = process.env.COSMOS_ENDPOINT;
const key =
  "wJSlFra1ZyUXQDzM1AjnKziAcdGeTdX5wrsZ0oS6ZCNzVTRyYrZ4dVQNJDzo22FSm3HYANWFQYbj3Kc1FKANOg==";
const endpoint = "https://unitynftservicedb.documents.azure.com:443/";

// Set Database name and container name with unique timestamp
const databaseName = `unitynftservice`;
const containerName = `accounts`;
const partitionKeyPath = ["/id"];

const cosmosClient = new CosmosClient({ endpoint, key });

// Create database if it doesn't exist
const { database } = await cosmosClient.databases.createIfNotExists({
  id: databaseName,
});
console.log(`${database.id} database ready`);

// Create container if it doesn't exist
const { container } = await database.containers.createIfNotExists({
  id: containerName,
  partitionKey: {
    paths: partitionKeyPath,
  },
});
console.log(`${container.id} container ready`);

const app = express();
app.use(cors());
app.use(express.json());

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

app.get("/api/nfts", (req, res) => {
  const nfts = alchemy.nft.getNftsForOwner(req.query.account).then(
    async (nfts) => {
      await container.items.upsert({
        id: req.query.account,
        account: req.query.account,
        ownedNfts: nfts.ownedNfts,
      });
      res.json(nfts.ownedNfts);
    },
    (err) => {
      res.json(err);
    }
  );
});

app.get("/login", async (req, res) => {
  const { account, signature } = req.query;
  await container.items.upsert({
    id: account,
    account: account,
    ownedNfts: [],
  });

  return "keytosign";
});

app.post("/api/validateWalletLogin", async (req, res) => {
  const { address, message, signature } = req.body;

  let signedMessage =
    "\x19Ethereum Signed Message:\n" + message.length + message;

  const messageBuffer = util.keccak(Buffer.from(signedMessage, "utf-8"));
  const { v, r, s } = util.fromRpcSig(signature);
  const pubKey = util.ecrecover(util.toBuffer(messageBuffer), v, r, s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);
  if (addr == address) {
    // generate session id and save to database
    const sessionId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    await container.items.upsert({
      id: address,
      account: address,
      sessions: [
        {
          sessionId: sessionId,
          timestamp: Date.now(),
        },
      ],
    });
    res.json({ sessionId: sessionId, success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
