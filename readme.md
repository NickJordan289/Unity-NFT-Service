# Unity NFT Service

## Getting Started
> The Alchemy.com sdk is used to fetch an address' NFT's
1. Setup your .env configuration as described below
2. Deploy container group using ```docker compose up```

## .env
```py
APP_SERVER_PORT=4000
REACT_APP_PORT=3000

# https://www.alchemy.com/
ALCHEMY_API_KEY="..."

MONGO_INITDB_ROOT_USERNAME="AzureDiamond"
MONGO_INITDB_ROOT_PASSWORD="hunter2"
```