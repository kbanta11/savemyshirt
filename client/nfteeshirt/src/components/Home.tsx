import { Box, Button, Center, Heading, Image, useDisclosure, Modal, Text, ModalOverlay, ModalContent, ModalBody, Flex, Divider } from '@chakra-ui/react';
import { HashLink } from 'react-router-hash-link';
import cloud from '../assets/cloud-bg.png';
import shirt from '../assets/shirt.png'
import savemyshirt from '../assets/header_text.png'
import metamask from '../assets/Metamask-logo.png';
import walletconnect from '../assets/WalletConnect-logo.png';
import '@fontsource/permanent-marker'
import MintModal from './MintModal';
import { useEthers, Mumbai, Polygon } from '@usedapp/core';
import Web3Modal from 'web3modal';
import ConnectModal from './ConnectModal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const Home = () => {
    const { isOpen: mintModalIsOpen, onOpen: mintModalOnOpen, onClose: mintModalOnClose } = useDisclosure();
    const { isOpen: connectIsOpen, onOpen: connectOnOpen, onClose: connectOnClose } = useDisclosure();
    const { activateBrowserWallet, account, activate, chainId, switchNetwork } = useEthers();

    const activateProvider = async () => {
        const providerOptions = {
          injected: {
            display: {
              name: 'Metamask',
              description: 'Connect with the provider in your Browser',
            },
            package: null,
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              bridge: 'https://bridge.walletconnect.org',
              infuraId: process.env.REACT_APP_INFURA_ID,
            },
          },
        }
    
        const web3Modal = new Web3Modal({
          providerOptions,
        })
        try {
          const provider = await web3Modal.connect()
          await activate(provider)
          //TO-DO: Handle Errors
        } catch (error: any) {
          //TO-DO: Handle Errors
        }
      }

    return(
        <Box overflow={'hidden'} bgColor={'#78CEFF'} bgImage={cloud} backgroundSize={'contain'} minWidth={'100%'} backgroundRepeat={'no-repeat'} minHeight={'100vh'} height={'100%'} margin={'0 auto'} paddingBottom={'2rem'}>
            <Image src={savemyshirt}
                height={['150px', '150px', '150px', '200px']}
                width={['90vw', 'auto']}
                margin={'auto'}
                display={'block'}
                zIndex={100} />
            <Box display={'flex'}
                marginTop={'-100px'}
                marginLeft={'auto'}
                marginRight={'auto'}
                bgImage={shirt} 
                backgroundSize={'contain'} 
                height={['400px', '550px', '750px', '750px']} 
                width={['400px', '550px', '750px', '750px']}>
                    <Box margin={'auto'} display={'flex'} flexDir={'column'} fontFamily={'Permanent Marker'}>
                        <HashLink smooth to={'/#about'}>
                            <Button 
                                marginBottom={'1rem'}
                                cursor={'pointer'}
                                borderRadius={'15px'}
                                padding={['5px 5px 5px 5px', '5px 10px 5px 10px']}
                                fontSize={['1rem', '1.5rem']}
                            >
                                I'M CONFUSED
                            </Button>
                        </HashLink>
                        <Button 
                            marginTop={'1rem'}
                            padding={'5px 10px 5px 10px'}
                            fontSize={['1rem', '1.5rem']}
                            borderRadius={'15px'}
                            onClick={async () => {
                                if(account) {
                                  if(chainId !== Polygon.chainId) {
                                    await switchNetwork(Polygon.chainId);
                                  } else {
                                    mintModalOnOpen();
                                  }
                                  return;
                                } else {
                                  activateProvider();
                                }
                                
                            }}
                        >MINT 4 FREE</Button>
                        <Modal isOpen={mintModalIsOpen} onClose={mintModalOnClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <MintModal />
                            </ModalContent>
                        </Modal>
                    </Box>
            </Box>
            <Box id="about" width={['90vw', '90vw', '90vw', '60vw']} marginTop={'-50px'} marginLeft={'auto'} marginRight={'auto'} fontSize={['1.2em']}>
                <Heading fontFamily={'Permanent Marker'} marginTop={'1rem'} marginBottom={'1rem'}>WTH is Save My Shirt?</Heading>
                <Text>I can't be the only one who keeps a box of old T-Shirts and clothes just for the nostalgia, right? I'll probably never wear these shirts again. I rarely open that box (except to add new items) and it just takes up space in my closet. But I don't want to lose the memories some of these shirts signify. Be honest: you're holding onto a few of your own sentimental clothing items too, aren't you?</Text>
                <Text marginTop={'1rem'}>Solution: I'm just gonna keep those memories on the blockchain, easily viewable in my crypto wallet as an NFT (and we've come full circle to keeping our prized pics in our wallets, it's just a Ledger, not leather!). And I think you should too! It's free and it frees up space in your closet.</Text>
                <Heading fontFamily={'Permanent Marker'} marginTop={'1rem'} marginBottom={'1rem'}>How does it work?</Heading>
                <Text>Save My Shirt allows you to save pictures of your favorite clothing items you no longer wear as an NFT on the blockchain. It uses the Polygon blockchain for low-fee minting (creating them is free, apart from the gas fee). Once created, the NFT representing your shirt (or other item) will be available in your wallet. It's pretty much that simple. Oh yeah, and I know the clothing industry is kinda crazy wasteful and harsh for workers, so if you'd like, you can donate 1 (or more) MATIC when you Save Your Shirt that will be donated periodically to charities, particularly focused on the environment or issues in the apparel industry. Since there are few charities accepting native MATIC tokens, I will wait until enough is stockpiled to convert (or also thinking of creating a protocol for charities to easily accept multi-chain donations).</Text>
                <Heading fontFamily={'Permanent Marker'} marginTop={'1rem'} marginBottom={'1rem'}>What do I do with the clothes after?</Heading>
                <Text>DONATE THEM! Now that you're done using these items, and you're memories are saved forever on-chain, it's time to let someone else to take over the story! Please don't waste good clothes. Take your clothes to your local Goodwill, Salvation Army or any other donation drop/non-profit that takes clothing.</Text>
            </Box>
        </Box>
    );
}

export default Home;