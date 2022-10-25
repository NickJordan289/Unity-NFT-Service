import express from "express";
import { Network, Alchemy } from "alchemy-sdk";
import * as util from "ethereumjs-util";
import cors from "cors";
import { MongoClient } from "mongodb";

const PORT = process.env.APP_SERVER_PORT || 4000;

// Initialize MongoDB and ensure the database and container exist
const databaseName = `unitynftservice`;
const containerName = `accounts`;

const mongoClient = new MongoClient(process.env.MONGODB_CONNSTRING);
const db = await mongoClient.connect().then((client) => {
  return client.db(databaseName);
});
console.log(`${databaseName} database ready`);
const accounts = db.collection(containerName);
console.log(`${containerName} container ready`);

// Initialize Alchemy
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

// Setup express to use cors and return json
const app = express();
app.use(cors());
app.use(express.json());

/// API Endpoints

// GET /api/nfts/?sessionId=...
// Query Parameters:
//   sessionId: string - the sessionId generated on login
// Return the nfts for the account associated with the sessionId
// Will also use cached response for 5 minutes
app.get("/nfts", async (req, res) => {
  const { sessionId } = req.query;

  const result = await accounts.findOne({
    "sessions.sessionId": sessionId,
  });

  if (result) {
    const account = result.id;
    const minutes5 = 5 * 60 * 1000;
    if (result.lastSynced && result.lastSynced > Date.now() - minutes5) {
      res.json(result.nfts);
    } else {
      alchemy.nft.getNftsForOwner(account).then(
        async (nfts) => {
          res.json(nfts.ownedNfts);
          await accounts.updateOne(
            { id: account },
            { $set: { nfts: nfts.ownedNfts, lastSynced: new Date() } }
          );
        },
        (err) => {
          res.json(err);
        }
      );
    }
  } else {
    res.status(403).json([]);
  }
});

// POST /api/validateWalletLogin/
// Body:
//   address: string - the self reported address
//   message: string - the generated message that the wallet signed
//   signature: string - the signature of the wallet signed message
// Validate the signature from the wallet login and return a sessionId
// If resolved address does not match the address in the request, fail and let user try again
app.post("/validateWalletLogin", async (req, res) => {
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

    await accounts.updateOne(
      { id: address },
      {
        $push: {
          sessions: {
            sessionId: sessionId,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true }
    );

    res.json({ sessionId: sessionId, success: true });
  } else {
    res.json({ success: false });
  }
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
