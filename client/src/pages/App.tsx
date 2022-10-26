import React from "react";
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
import Web3 from "web3";
import MetaMaskOnboarding from "@metamask/onboarding";

// import metamaskfox from "../images/metamask-fox.svg";
import metamaskfox from "../images/metamask-fox.png";
import LoadingModal from "../components/LoadingModal";
import "./App.css";

function App() {
  const toast = useToast();
  const params = new URLSearchParams(window.location.search);
  const redirect_uri = params.get("redirect_uri") || "http://localhost:8001";

  const web3 = new Web3(Web3.givenProvider);
  const onboarding = new MetaMaskOnboarding();

  const [loadingText, setLoadingText] = React.useState("Authorize Connection.");
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function onboard() {
    setLoadingText("Authorize Connection.");
    onOpen();
    try {
      if (window.ethereum) {
        let eth = window.ethereum;

        // eslint-disable-next-line no-undef
        var accounts = await eth.request({ method: "eth_requestAccounts" });

        const nonce =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        const datetime = new Date().toISOString();

        let text = `${window.location.hostname} wants you to sign in with your Ethereum account: 
${accounts[0]}
This won't cost you any Ether. 

URI: ${window.location.hostname}
Chain ID: 1
Nonce: ${nonce}
Issued At: ${datetime}`;

        // Sign the phrase and get signature
        setLoadingText("Sign Message.");
        let signature = await web3.eth.personal
          .sign(text, accounts[0], "")
          .then((signature) => {
            return signature;
          });

        setLoadingText("Validating signature.");
        await fetch("/api/validateWalletLogin", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: accounts[0],
            message: text,
            signature: signature,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              const sessionId = data.sessionId;
              document.cookie = `sessionId=${sessionId}; path=/`;
              window.location.href = `${redirect_uri}?sessionId=${sessionId}`;
            } else {
              toast({
                title: "Error",
                description: "Something went wrong. Try again.",
                status: "error",
                duration: 9000,
                isClosable: true,
              });
              onClose();
            }
          });
      } else {
        onboarding.startOnboarding();
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
            <Button borderColor="metamask.100" paddingLeft={2} paddingRight={2}>
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
        </Box>
      </VStack>
    </>
  );
}

export default App;
