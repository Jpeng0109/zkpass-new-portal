/** Metadata for 5 zkTLS template types — drives dashboard cards, charts, and seed proofs */

export const TEMPLATE_TYPES = [
  "ASSET_SOLVENCY",
  "SYNTHETIC_STOCK",
  "REAL_ESTATE_RWA",
  "SUPPLY_CHAIN_FACTORING",
  "INSTITUTIONAL_LIQUIDITY",
];

export const TEMPLATE_META = {
  ASSET_SOLVENCY: {
    key: "ASSET_SOLVENCY",
    label: "Fiat Proof of Reserve",
    pageTitle: "Fiat Attestation",
    metricTitles: ["Fiat Attestation", "Total Fiat Reserves", "Collateralization Ratio", "Custodial Banks"],
    metricValues: ["Bank Balance Verified", "$500,000,000.00", "102.4%", "4 Entities"],
    chartTitle: "Reserve vs Supply Discrepancy",
    chartSubtitle: "Time-series verification of fiat solvency (Last 24h)",
    chartType: "area",
    seed: 0,
    assetUnit: "USD Reserve",
    protocol: "zkTLS · Banking-API v3.1",
    seedProofs: [
      { proofId: "PR-1001", name: "JPMorgan Chase", ticker: "ACC-4421", amount: "$185.4M", status: "VERIFIED", txHash: "0x71c765a8f2b1e4d3c9a7b2e1f0d8c6a5b4e3d2c1", merkleRoot: "0x9a2f4b8c1d3e5f7a9b0c2d4e6f8a1b3c4d5e6f7a8" },
      { proofId: "PR-1002", name: "Bank of America", ticker: "ACC-9930", amount: "$142.8M", status: "VERIFIED", txHash: "0x82d876b9a3c2f5e4d0b8c3f2e1a9d7b6c5a4f3e2d1", merkleRoot: "0xab3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0" },
      { proofId: "PR-1003", name: "Wells Fargo", ticker: "ACC-7712", amount: "$98.2M", status: "PENDING", txHash: "0x93e987c0b4d3a6f5e1c9d4a3f2b0e8c7d6b5a4f3e2d1", merkleRoot: "0xbc4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2" },
      { proofId: "PR-1004", name: "Citibank N.A.", ticker: "ACC-3380", amount: "$73.6M", status: "FAILED", txHash: "0xa4f098d1c5e4b7a6f2d0e5b4a3f2c1d0e9f8a7b6c5d4", merkleRoot: "0xINVALID_ROOT_MISMATCH_0x9a2f" },
      { proofId: "PR-1005", name: "HSBC Holdings", ticker: "ACC-6651", amount: "$45.0M", status: "VERIFIED", txHash: "0xb5a109e2d6f5c8b7a3e1f6c5b4a3f2e1d0c9b8a7f6e5", merkleRoot: "0xcd5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3" },
    ],
  },
  SYNTHETIC_STOCK: {
    key: "SYNTHETIC_STOCK",
    label: "Broker Stock Custody",
    pageTitle: "Equity Stock Proof",
    metricTitles: ["Equity Stock Proof", "Total Custodied Shares", "Liquidity Matching Rate", "Prime Brokers"],
    metricValues: ["AAPL/TSLA Assets Check", "$84,290,120.00", "100.0%", "3 Brokers"],
    chartTitle: "Collateralization Health & Order Match",
    chartSubtitle: "Time-series verification of equity custody (Last 24h)",
    chartType: "area",
    seed: 2,
    assetUnit: "Shares",
    protocol: "zkTLS · Broker-API v2.4",
    seedProofs: [
      { proofId: "PR-2001", name: "Apple Inc.", ticker: "AAPL", amount: "210,400 sh", status: "VERIFIED", txHash: "0xc6b210f3e7a6d9c8b5f2a7e6d5c4b3a2f1e0d9c8b7", merkleRoot: "0xde6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4" },
      { proofId: "PR-2002", name: "Tesla, Inc.", ticker: "TSLA", amount: "84,900 sh", status: "VERIFIED", txHash: "0xd7c321a4f8b7e0d9c6a3b8f7e6d5c4b3a2f1e0d9c8", merkleRoot: "0xef7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3" },
      { proofId: "PR-2003", name: "NVIDIA Corp.", ticker: "NVDA", amount: "55,300 sh", status: "PENDING", txHash: "0xe8d432b5a9c8f1e0d7b4c9a8f7e6d5c4b3a2f1e0", merkleRoot: "0xfa8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2" },
      { proofId: "PR-2004", name: "Microsoft Corp.", ticker: "MSFT", amount: "129,100 sh", status: "VERIFIED", txHash: "0xf9e543c6b0d9a2f1e8c5b0a9f8e7d6c5b4a3f2e1", merkleRoot: "0x0b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1" },
      { proofId: "PR-2005", name: "Goldman Custody", ticker: "GS-CUS", amount: "32,000 sh", status: "FAILED", txHash: "0x0af654d7c1e0b3a2f9d6c1b0a9f8e7d6c5b4a3f2", merkleRoot: "0xINVALID_BROKER_ROOT_0x1c2d" },
    ],
  },
  REAL_ESTATE_RWA: {
    key: "REAL_ESTATE_RWA",
    label: "Property & Yield Attestation",
    pageTitle: "Deed & Property Proof",
    metricTitles: ["Deed & Property Proof", "Appraised Asset Value", "Occupancy & Yield Rate", "SPV / Trust Entities"],
    metricValues: ["Manhattan Luxury Condo #302", "$18,500,000.00", "88.5% (6.2% APY)", "2 SPVs"],
    chartTitle: "Real-time Rental Cashflow Attestation",
    chartSubtitle: "Monthly rental yield attestation by property (Last 12 mo)",
    chartType: "bar",
    seed: 4,
    assetUnit: "USD Valued",
    protocol: "zkTLS · RWA Registry v1.2",
    seedProofs: [
      { proofId: "PR-3001", name: "Manhattan Condo #302", ticker: "DEED-NY-302", amount: "$18.5M", status: "VERIFIED", txHash: "0x1ab765e8f7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2", merkleRoot: "0x2bc876f9a8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3" },
      { proofId: "PR-3002", name: "Brooklyn Loft #14B", ticker: "DEED-NY-14B", amount: "$4.2M", status: "VERIFIED", txHash: "0x2cd987a0b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4", merkleRoot: "0x3de098a1c0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5" },
      { proofId: "PR-3003", name: "Miami Beach Villa", ticker: "DEED-FL-VL2", amount: "$12.8M", status: "PENDING", txHash: "0x3de098b1c0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5", merkleRoot: "0x4ef109b2d1b0a9f8e7d6c5b4a3f2e1d0c9b8a7" },
      { proofId: "PR-3004", name: "Aspen Chalet 7", ticker: "DEED-CO-07", amount: "$7.9M", status: "FAILED", txHash: "0x4ef109c2d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8", merkleRoot: "0xINVALID_DEED_ROOT_0x5fa" },
      { proofId: "PR-3005", name: "Hamptons Estate", ticker: "DEED-NY-HE1", amount: "$22.1M", status: "VERIFIED", txHash: "0x5fa21ad3e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9", merkleRoot: "0x6ab32be4f4e3d2c1b0a9f8e7d6c5b4a3f2e1a0" },
    ],
  },
  SUPPLY_CHAIN_FACTORING: {
    key: "SUPPLY_CHAIN_FACTORING",
    label: "E-Commerce Receivables",
    pageTitle: "Store Storefront Proof",
    metricTitles: ["Store Storefront Proof", "Verified Receivables", "Order Fulfillment Score", "Logistics Platforms"],
    metricValues: ["Amazon US Store-04", "$3,450,000.00", "99.1% (Low Dispute)", "5 Carriers"],
    chartTitle: "Receivables Snapshot",
    chartSubtitle: "Time-series receivables & fulfillment (Last 24h)",
    chartType: "area",
    seed: 6,
    assetUnit: "USD Invoiced",
    protocol: "zkTLS · Commerce-API v2.0",
    seedProofs: [
      { proofId: "PR-4001", name: "Amazon US Store-04", ticker: "AMZN-04", amount: "$1.2M", status: "VERIFIED", txHash: "0x6ac43cf5a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0", merkleRoot: "0x7bd54da6b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1" },
      { proofId: "PR-4002", name: "Shopify Brand Co.", ticker: "SHOP-BC", amount: "$640K", status: "VERIFIED", txHash: "0x7bd54da6b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1", merkleRoot: "0x8ce65eb7c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2" },
      { proofId: "PR-4003", name: "eBay Power Seller", ticker: "EBAY-PS", amount: "$420K", status: "PENDING", txHash: "0x8ce65eb7c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2", merkleRoot: "0x9df76fc8d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4" },
      { proofId: "PR-4004", name: "Walmart Marketplace", ticker: "WMT-MP", amount: "$890K", status: "FAILED", txHash: "0x9df76fc8d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4", merkleRoot: "0xINVALID_STORE_ROOT_0xa1b2" },
      { proofId: "PR-4005", name: "TikTok Shop CN-7", ticker: "TTS-07", amount: "$300K", status: "VERIFIED", txHash: "0xa0e87a09e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5", merkleRoot: "0xb1f98b10f0e9d8c7b6a5f4e3d2c1b0a9f8e7" },
    ],
  },
  INSTITUTIONAL_LIQUIDITY: {
    key: "INSTITUTIONAL_LIQUIDITY",
    label: "CEX Net Equity Monitor",
    pageTitle: "Exchange Net Balance",
    metricTitles: ["Exchange Net Balance", "Total Net Equity (NAV)", "Maintenance Margin Ratio", "Connected CEXs"],
    metricValues: ["Binance Margin Account #1", "$25,400,000.00", "245.8% (Safe)", "6 Exchanges"],
    chartTitle: "NAV Snapshot",
    chartSubtitle: "Time-series net equity & margin ratio (Last 24h)",
    chartType: "area",
    seed: 8,
    assetUnit: "USD NAV",
    protocol: "zkTLS · Exchange-API v4.0",
    seedProofs: [
      { proofId: "PR-5001", name: "Binance Margin #1", ticker: "BNB-M1", amount: "$8.4M", status: "VERIFIED", txHash: "0xc0a09a01b1f0e9d8c7b6a5f4e3d2c1b0a9f8e7", merkleRoot: "0xd1b10b12c2a1f0e9d8c7b6a5f4e3d2c1b0a9f8" },
      { proofId: "PR-5002", name: "Coinbase Prime", ticker: "CB-PRM", amount: "$6.1M", status: "VERIFIED", txHash: "0xd1b10b12c2a1f0e9d8c7b6a5f4e3d2c1b0a9f8", merkleRoot: "0xe2c21c23d3b2a1f0e9d8c7b6a5f4e3d2c1b0" },
      { proofId: "PR-5003", name: "Kraken Pro", ticker: "KRK-PRO", amount: "$4.2M", status: "PENDING", txHash: "0xe2c21c23d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9", merkleRoot: "0xf3d32d34e4c3b2a1f0e9d8c7b6a5f4e3d2c1" },
      { proofId: "PR-5004", name: "OKX Institutional", ticker: "OKX-INS", amount: "$3.5M", status: "FAILED", txHash: "0xf3d32d34e4c3b2a1f0e9d8c7b6a5f4e3d2c1b0", merkleRoot: "0xINVALID_CEX_ROOT_0xc4d5" },
      { proofId: "PR-5005", name: "Bybit Derivatives", ticker: "BYB-DRV", amount: "$3.2M", status: "VERIFIED", txHash: "0xa4e43e45f5d4c3b2a1f0e9d8c7b6a5f4e3d2c1", merkleRoot: "0xb5f54f56a6e5d4c3b2a1f0e9d8c7b6a5f4e3" },
    ],
  },
};

export function makeChartSeries(seed, chartType = "area") {
  if (chartType === "bar") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((t, i) => ({
      t,
      a: 42000 + Math.sin(i / 2 + seed) * 12000 + i * 2800,
      b: 38000 + Math.cos(i / 3 + seed) * 9000 + i * 2100,
    }));
  }
  return Array.from({ length: 11 }, (_, i) => ({
    t: `${(8 + i).toString().padStart(2, "0")}:00`,
    a: 30000 + Math.sin(i / 2 + seed) * 8000 + i * 1500 + seed * 1000,
    b: 28000 + Math.cos(i / 2 + seed) * 7000 + i * 1200 + seed * 800,
  }));
}
