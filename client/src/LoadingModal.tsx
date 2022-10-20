import {
  Center,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Progress,
  VStack,
} from "@chakra-ui/react";

interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadingText: string;
}

export default function LoadingModal(props: LoadingModalProps) {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Center>
            <VStack
              height="30vh"
              gap={4}
              justifyContent="center"
              alignItems="start"
            >
              <Heading size={"lg"}>{props.loadingText}</Heading>
              <Progress size="sm" alignSelf="stretch" isIndeterminate />
            </VStack>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
