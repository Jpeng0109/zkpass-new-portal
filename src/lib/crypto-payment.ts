/** Official zkPass treasury — crypto payments only */
export const OFFICIAL_CRYPTO = {
  network: "Ethereum Mainnet",
  asset: "USDC (ERC-20)",
  address: "0x1fff6ab30f7e5d7b5269ddf525ade9f56744c527",
  memo: "Include your Project ID or Invoice ID in the wallet memo when supported.",
} as const;

export function formatUsdcAmount(usd: number) {
  return `${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

export function isValidTxHash(tx: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(tx.trim());
}
