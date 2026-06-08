// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DeploymentProofNFT
 * @notice ERC-721 NFT minted for every VM deployment on TeleCloudX.
 *         Only the backend wallet (owner) can mint.
 */
contract DeploymentProofNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    /// @notice Emitted when a deployment proof NFT is minted
    event DeploymentProofMinted(
        uint256 indexed tokenId,
        string indexed vmId,
        address indexed owner,
        string tokenURI
    );

    constructor(address initialOwner)
        ERC721("TeleCloudX Deployment Proof", "TCDP")
        Ownable()
    {
        transferOwnership(initialOwner);
    }

    /**
     * @notice Mint a deployment proof NFT.
     * @param to The wallet address that owns the VM.
     * @param uri The IPFS JSON metadata URI.
     * @param vmId The CloudStack VM ID for indexing.
     * @return tokenId The newly minted token ID.
     */
    function mintDeploymentProof(
        address to,
        string calldata uri,
        string calldata vmId
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit DeploymentProofMinted(tokenId, vmId, to, uri);
    }

    /// @notice Total number of deployment proof NFTs minted.
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    // ── Overrides required by Solidity ──
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
