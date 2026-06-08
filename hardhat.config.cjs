require("dotenv").config({ path: ".env.local" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    xdcapothem: {
      url: process.env.XDC_RPC_URL || "https://rpc.apothem.network",
      accounts: process.env.BACKEND_WALLET_PRIVATE_KEY
        ? [`0x${process.env.BACKEND_WALLET_PRIVATE_KEY.replace(/^0x/, "")}`]
        : [],
      chainId: 51,
    },
    xdcmainnet: {
      url: process.env.XDC_RPC_URL || "https://rpc.xinfin.network",
      accounts: process.env.BACKEND_WALLET_PRIVATE_KEY
        ? [`0x${process.env.BACKEND_WALLET_PRIVATE_KEY.replace(/^0x/, "")}`]
        : [],
      chainId: 50,
    },
  },
  etherscan: {
    apiKey: {
      xdcapothem: "abc",
      xdcmainnet: "abc",
    },
    customChains: [
      {
        network: "xdcapothem",
        chainId: 51,
        urls: {
          apiURL: "https://api-apothem.blocksscan.io/api",
          browserURL: "https://apothem.blocksscan.io",
        },
      },
      {
        network: "xdcmainnet",
        chainId: 50,
        urls: {
          apiURL: "https://api.blocksscan.io/api",
          browserURL: "https://blocksscan.io",
        },
      },
    ],
  },
};
