import { ethers } from 'ethers';
import abi from './abi/contractABI.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed!');
  }

  const celoTestnet = {
    chainId: '0xaa36a7',
    chainName: 'Celo Sepolia Testnet',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18
    },
    rpcUrls: ['https://forno.celo-sepolia.celo-testnet.org'],
    blockExplorerUrls: ['https://celo-sepolia.blockscout.com']
  };

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: celoTestnet.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [celoTestnet],
      });
    } else {
      throw error;
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export async function storeHashOnChain(hash, signer) {
  if (!signer) throw new Error("Wallet not connected");

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  const tx = await contract.storeHash(hash);
  console.log("Transaction sent:", tx.hash);

  await tx.wait();

  return tx.hash;
}

export async function verifyHashOnChain(hash, provider) {
  if (!provider) throw new Error("Provider not available");

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  const isAuthentic = await contract.verifyHash(hash);

  return isAuthentic;
}