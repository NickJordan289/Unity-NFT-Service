import React from "react";
import "./App.css";
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Image,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import metamaskfox from "./metamask-fox.svg";
import LoadingModal from "./LoadingModal";
import Web3 from "web3";
function App() {
  const params = new URLSearchParams(window.location.search);
  const redirect_uri = params.get("redirect_uri") || "http://localhost:8001";
  const toast = useToast();
  const [loadingText, setLoadingText] = React.useState("Authorize Connection.");
  const [isDone, setIsDone] = React.useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const web3 = new Web3(Web3.givenProvider);

  async function onboard() {
    setLoadingText("Authorize Connection.");
    onOpen();
    try {
      if (window.ethereum) {
        let eth = window.ethereum;
        // Will open the MetaMask UI
        // You should disable this button while the request is pending!
        // eslint-disable-next-line no-undef
        var accounts = await eth.request({ method: "eth_requestAccounts" });
        setLoadingText("Sign Message.");
        const nonce =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        let text = `${
          window.location.hostname
        } wants you to sign in with your Ethereum account: 
${accounts[0]}
This won’t cost you any Ether. 

URI: ${window.location.hostname}
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

        // Sign the phrase and get signature
        web3.eth.personal
          .sign(text, accounts[0], "")
          .then((signature) => {
            fetch(
              `${redirect_uri}?signature=${signature}&nonce=${nonce}&address=${accounts[0]}`
            );
          })
          .then(() => {
            setLoadingText("Finding NFT's.");

            fetch(`/api?account=${accounts[0]}`)
              .then((res) => res.json())
              .then((nfts) => {
                setLoadingText(`Found ${nfts.length}.`);
                // wait 2 seconds
                setTimeout(() => {
                  onClose();
                  toast({
                    title: "Wallet Connected.",
                    description: "You may now close this window.",
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                  });
                  setIsDone(true);
                }, 1500);
              });
          });
      } else {
        // If the provider is not detected, detectEthereumProvider resolves to null
        console.log("Please install MetaMask!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <LoadingModal
        loadingText={loadingText}
        onClose={onClose}
        isOpen={isOpen}
      />
      <VStack textAlign={"center"} marginLeft={200} marginRight={200}>
        <Box p={5}>
          {isDone ? (
            <Text fontSize="26px">
              You can now return to the application that brought you here.
            </Text>
          ) : (
            <>
              <Box maxWidth="700px">
                <Heading fontSize="40px">Connect with MetaMask</Heading>
                <Text fontSize="26px" lineHeight="36px">
                  Press the connect button and follow the prompts to share your
                  NFT's with the application that brought you here.
                </Text>
              </Box>
              <ButtonGroup
                isAttached
                variant="outline"
                onClick={onboard}
                paddingTop="5px"
              >
                <Button
                  borderColor="metamask.100"
                  paddingLeft={2}
                  paddingRight={2}
                >
                  <Image src={metamaskfox} boxSize="25px" />
                </Button>
                <Button
                  borderColor="metamask.100"
                  paddingLeft={2}
                  paddingRight={2}
                  fontWeight="bold"
                >
                  {" "}
                  Connect Wallet
                </Button>
              </ButtonGroup>
            </>
          )}
        </Box>
      </VStack>
    </>
  );
}

export default App;
