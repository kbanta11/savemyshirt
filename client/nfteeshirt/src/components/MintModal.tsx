import { Box, Heading, Input, Text, Image, Button, NumberInputField, NumberInput, NumberInputStepper, InputRightAddon, InputGroup, NumberDecrementStepper, InputRightElement, NumberIncrementStepper, Flex, IconButton, Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverHeader, PopoverCloseButton, PopoverArrow, Center } from "@chakra-ui/react";
import { useEthers, useContractFunction } from "@usedapp/core";
import NFTShirt from '../artifacts/contracts/NFTShirt.sol/NFTShirt.json';
import { Contract, utils } from "ethers";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import { create, CID, IPFSHTTPClient } from 'ipfs-http-client';
import { ImInfo } from 'react-icons/im';
import PacmanLoader from 'react-spinners/PacmanLoader'

export interface IMintData {
    image: File,
    type: string,
    title: string,
    amount: number,
}

const MintModal = () => {
    const { account } = useEthers();
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({accept: {
        'image/*': ['.jpeg', '.png', '.gif']
      },
    });
    const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const [mintData, setMintData] = useState({amount: 0} as IMintData);
    const mintContract = new Contract('0x45A7F54fF6DDcD52c1B5954b7e1143D1134CcdCb', NFTShirt.abi);
    const { state, send } = useContractFunction(mintContract, 'mint');
    const { status } = state

    const verifyData = () => {
        if(!mintData.image) {
            alert('No Image!')
            return false;
        }
        if(!mintData.title || mintData.title === '') {
            alert('Add a title!')
            return false;
        }
        return true;
    }

    const mintShirt = async () => {
        const verified = verifyData();
        if(!verified) {
            return;
        }
        setIsLoadingButton(true);
        //setup IPFS connection
        const authorization = "Basic " + window.btoa(process.env.REACT_APP_INFURA_IPFS_PROJECT_ID + ":" + process.env.REACT_APP_INFURA_IPFS_SECRET);
        let ipfs: IPFSHTTPClient | undefined;
        try {
            ipfs = create({
                url: 'https://ipfs.infura.io:5001',
                headers: {
                    authorization
                }
            });
        } catch (error) {
            alert('There was an error uploadin your image. Please try again!')
        }
        if(!ipfs) {
            return;
        }
        //upload image to IPFS and get link
        const result = await ipfs.add(mintData.image, {pin: true});
        //upload metadata with image link to IPFS (lookup current minting token id)
        const metadata = {
            'name': mintData.title ?? 'SaveMyShirt #',
            'description': 'Saving worn-out memories on the blockchain',
            'image': 'ipfs://' + result.path,
            'attributes': [
                {
                    'trait_type': 'Donor',
                    'value': mintData.amount > 0 ? true : false
                },
                {
                    'trait_type': 'Donation Amount',
                    'value': mintData.amount
                }
            ]
        }
        //upload metadata to ipfs
        const metaResult = await ipfs.add(Buffer.from(JSON.stringify(metadata)), {pin: true});
        const metaUrl = 'ipfs://' + metaResult.path;
        //get signature for transaction from connected wallet to call mint function on contract
        await send(metaUrl, { value: utils.parseEther(mintData.amount.toString() ?? '0')})
        setIsLoadingButton(false);
    }

    const getBase64 = (file:File):Promise<string> => {
        return new Promise<string> ((resolve,reject)=> {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString() || '');
            reader.onerror = error => reject(error);
        })
    }
    
    return (
        <Box padding={'10px'}>
            <Heading>Save Your Shirt!</Heading>
            <Text fontWeight={'bold'} marginTop={'1rem'}>Mint To</Text>
            <Text>{account}</Text>
            {
            mintData.image ? <Image marginTop={'1rem'} marginBottom={'1rem'} src={URL.createObjectURL(mintData.image)}/> :
            <Box padding={'5px'} marginTop={'1rem'} {...getRootProps({ className: "dropzone" })} textAlign={'center'} borderRadius={'15px'} borderColor={'gray.200'} borderWidth={'2px'} borderStyle={'dashed'}>
                <input {...getInputProps()} onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                    setIsLoadingPhoto(true);
                    setMintData({} as IMintData);
                    if(!event.target.files) {
                        return;
                    }
                    let file = event.target.files![0];
                    const clarifaiRaw = JSON.stringify({
                        "user_app_id": {
                            "user_id": process.env.REACT_APP_CLARIFAI_USER_ID,
                            "app_id": process.env.REACT_APP_CLARIFAI_APP_ID
                        },
                        "inputs": [
                            {
                                "data": {
                                    "image": {
                                        "base64": await (await getBase64(file)).split(',').pop()
                                    }
                                }
                            }
                        ]
                    });
                    const requestOptions = {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Key ' + process.env.REACT_APP_CLARIFAI_PAT
                        },
                        body: clarifaiRaw
                    };
                    fetch("https://api.clarifai.com/v2/models/apparel-recognition/outputs", requestOptions)
                        .then(response => {
                            return response.json();
                        })
                        .then(result => {
                            const concepts = result['outputs'][0]['data']['concepts'];
                            if(concepts[0].value >= 0.75) {
                                setMintData({...mintData, type: concepts[0].name, image: file})
                            } else {
                                alert('This does not appear to be a clothing article. Please take another photo and try again. If this continues in error, email me kbantadevelopment@gmail.com');
                            }
                        })
                        .catch(error => console.log('error: ', error));
                        setIsLoadingPhoto(false);
                }} />
                {isLoadingPhoto ? <Center><PacmanLoader color={'#FE73AF'} /></Center> : <Text marginTop={'1rem'} marginBottom={'1rem'}>Drag and drop or click here to upload a photo of your shirt (or other clothes)!</Text>}
            </Box>
            }  
            <Flex marginTop={'1rem'} alignItems={'center'} gap={2}>
                <Text fontWeight={'bold'}>Type</Text>
                <Popover>
                    <PopoverTrigger>
                        <Box><ImInfo /></Box>
                    </PopoverTrigger>
                    <PopoverContent bgColor={'#FE73AF'}>
                    <PopoverArrow bgColor={'#FE73AF'} />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight={'bold'}>Type</PopoverHeader>
                    <PopoverBody>The type of clothing item you upload should be automatically detected (using Clarifai APIs). If the wrong clothing article type comes up, please try to take another photo with just the single clothing item that you are minting. If the problem persists, please send me an email at kbantadevelopment@gmail (and if you're comfortable, attach the photo that is incorrectly being identified!).</PopoverBody>
                    </PopoverContent>
                </Popover>
            </Flex>
            <Text>{mintData.type ?? ''}</Text>
            <Text marginTop={'1rem'} fontWeight={'bold'}>Title</Text>
            <Input onChange={(element: React.ChangeEvent<HTMLInputElement>) => {
                setMintData({...mintData, title: element.target.value})
            }} />
            <Flex marginTop={'1rem'} alignItems={'center'} gap={2}>
                <Text><span style={{fontWeight: 'bold'}}>Donate</span> (optional)</Text>
                <Popover>
                    <PopoverTrigger>
                        <Box><ImInfo /></Box>
                    </PopoverTrigger>
                    <PopoverContent bgColor={'#FE73AF'}>
                    <PopoverArrow bgColor={'#FE73AF'} />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight={'bold'}>Donations</PopoverHeader>
                    <PopoverBody>You can donate a little MATIC when you mint your shirt and your memory NFT will get a special little indicator. MATIC donated will be held in the contract address until I can identify some good non-profits that accept native MATIC (I would love any suggestions, particularly that focus on the environment, clothing waste or working conditions in the apparel industry).</PopoverBody>
                    </PopoverContent>
                </Popover>
            </Flex>
            <InputGroup marginTop={'0.5rem'}>
                <NumberInput value={mintData.amount} min={0} step={0.5} onChange={(str, value: number) => {setMintData({...mintData, amount: value})}}>            
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <InputRightAddon>MATIC</InputRightAddon>
            </InputGroup>
            <Button marginTop={'1rem'} marginBottom={'2rem'} width={'100%'} bgColor={'#FE73AF'} onClick={async ()=> {
                if(!isLoadingButton) {
                    mintShirt();
                }
            }}
                _active={{bg: '#FE73AF80'}}
                _after={{bg: '#FE73AF'}}
                _hover={{bg: '#FE73AF80'}}
            >{isLoadingButton ? <Center marginBottom={'5px'}><PacmanLoader color={'#FFFFFF'} size={'0.8rem'}/></Center> : 'Mint My Shirt!'}</Button>
        </Box>
    );
}

export default MintModal;