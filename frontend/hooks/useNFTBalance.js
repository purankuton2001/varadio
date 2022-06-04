import {useMoralisDapp} from '../providers/MoralisDappProvider/MoralisDappProvider';
import {useEffect, useState} from 'react';
import {
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
  useMoralis,
} from 'react-moralis';
import {useIPFS} from './useIPFS';
let axios = require('axios');

export const useNFTBalance = props => {
  const {account} = useMoralisWeb3Api();
  const {chainId, walletAddress} = useMoralisDapp();
  const {isInitialized} = useMoralis();
  const {resolveLink} = useIPFS();
  const [data, setData] = useState();
  const [NFTBalance, setNFTBalance] = useState([]);
  async function fetch() {
    const res = await axios.get(
      `https://deep-index.moralis.io/api/v2/${walletAddress}/nft?chain=mumbai&format=decimal`,
      {
        headers: {
          'X-API-KEY':
            'cVfttjeoNgUpu1Plg6KlHBKAMl5MY5JDUBiktBNN8jZQHyioeg4xHCKUJ5dVglxk',
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      },
    );
    setData(res.data);
  }
  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    console.log(data);
    if (isInitialized) {
      if (data?.result) {
        const NFTs = data.result;
        for (let NFT of NFTs) {
          if (NFT?.metadata) {
            //Need to refactor
            try {
              NFT.metadata = JSON.parse(NFT.metadata);
            } catch (error) {
              NFT.metadata = JSON.parse(JSON.stringify(NFT.metadata));
            }

            // metadata is a string type
            NFT.image = resolveLink(NFT.metadata?.image);
            NFT.url = resolveLink(NFT.metadata?.animation_url);
          }
        }
        setNFTBalance(NFTs);
        console.log(NFTs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, chainId, walletAddress, data]);

  return {NFTBalance};
};
