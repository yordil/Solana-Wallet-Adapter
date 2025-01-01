"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButtonDynamic = dynamic(
	async () =>
		(await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
	{ ssr: false }
);

const Homepage = () => {
	const wallet = useWallet();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="text-center">
				<h1 className="text-white font-bold mb-8">
					<span className="text-5xl">Connect </span>{" "}
					<span className="text-4xl"> Your Wallet</span>
				</h1>
				<div>
					<WalletMultiButtonDynamic className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
						{wallet.publicKey
							? `${wallet.publicKey.toBase58().substring(0, 7)}...`
							: "Connect Wallet"}
					</WalletMultiButtonDynamic>
				</div>
			</div>
		</div>
	);
};

export default Homepage;
