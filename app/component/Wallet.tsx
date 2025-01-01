"use client";

import {
	WalletProvider,
	ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
	AlphaWalletAdapter,
	CoinbaseWalletAdapter,
	LedgerWalletAdapter,
	SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { walletConnect } from "wagmi/connectors";
import { FC, useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react"; // Importing useWallet
import axios from "axios";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import { WalletConnectWalletAdapter } from "@walletconnect/solana-adapter";
// Function to save wallet address to the database
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
const saveToDB = async (walletAddress: string, discordID: string) => {
	const url = process.env.REACT_APP_BACKEND_URL || "https://your-backend-url";
	const body = { walletAddress, discordID };

	try {
		const response = await axios.post(url, body, {
			headers: { "Content-Type": "application/json" },
		});
		console.log("Saved to DB:", response.data);
	} catch (error) {
		console.error("Error saving to DB:", error);
	}
};

// Helper function to remove wallet address from the database
const removeFromDB = async (walletAddress: string, discordID: string) => {
	const url = process.env.REACT_APP_BACKEND_URL || "https://your-backend-url";
	const body = { walletAddress, discordID };

	try {
		const response = await axios.delete(url, {
			data: body,
			headers: { "Content-Type": "application/json" },
		});
		console.log("Removed from DB:", response.data);
	} catch (error) {
		console.error("Error removing from DB:", error);
	}
};

type Props = {
	children?: React.ReactNode;
};

export const Wallet: FC<Props> = ({ children }) => {
	// Input your RPC as your endpoint value
	const endpoint = "https://api.devnet.solana.com";
	// const	;
	const projectId = "our project ID ";
	const wallets = useMemo(
		() => [
			new SolflareWalletAdapter(),
			new AlphaWalletAdapter(),
			new LedgerWalletAdapter(),
			new CoinbaseWalletAdapter(),
			new PhantomWalletAdapter(),
			new WalletConnectWalletAdapter({
				network: WalletAdapterNetwork.Mainnet,
				options: {
					projectId: process.env.WALLET_CONNECT_ID,
				},
			}),
		],
		[WalletAdapterNetwork.Mainnet]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect={true}>
				<WalletModalProvider>
					{children}
					<WalletAddressLogger />{" "}
					{/* Added the WalletAddressLogger component */}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

// Component to log wallet address
const WalletAddressLogger: FC = () => {
	const { publicKey, connected } = useWallet();
	const { discordID } = useParams<{ discordID: string }>();
	const [previousWalletAddress, setPreviousWalletAddress] = useState<
		string | null
	>(null);

	useEffect(() => {
		if (connected && publicKey) {
			const currentWalletAddress = publicKey.toString();

			if (
				previousWalletAddress &&
				previousWalletAddress !== currentWalletAddress
			) {
				console.log(
					"Wallet Changed: Previous Wallet:",
					previousWalletAddress,
					"New Wallet:",
					currentWalletAddress
				);
				if (discordID) {
					removeFromDB(previousWalletAddress, discordID); // Remove the previous wallet
					saveToDB(currentWalletAddress, discordID); // Save the new wallet
				}
			} else if (!previousWalletAddress) {
				console.log("First Wallet Connected:", currentWalletAddress);
				if (discordID) saveToDB(currentWalletAddress, discordID);
			}

			setPreviousWalletAddress(currentWalletAddress);
		}

		if (!connected && previousWalletAddress) {
			console.log("Wallet Disconnected:", previousWalletAddress);
			if (discordID) removeFromDB(previousWalletAddress, discordID);
			setPreviousWalletAddress(null);
		}
	}, [connected, publicKey, discordID, previousWalletAddress]);

	return null;
};
