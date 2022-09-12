//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTShirt is ERC721 {
    uint256 public tokenCounter;
    address private _owner;
    mapping(uint256 => string) private _tokenURIs;

    modifier onlyOwner() {
        require(_owner == msg.sender, "Only contract owner can call this");
        _;
    }

    constructor(string memory name, string memory symbol) payable ERC721(name, symbol) {
        tokenCounter = 0;
        _owner = msg.sender;
    }

    function transferDonations(address _toAddress, uint256 _amount) public onlyOwner {
        //check that the amount is less or equal to contract balance
        require(_amount <= address(this).balance, "Not enough MATIC in contract");
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = _toAddress.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    function changeOwner(address newOwner) public onlyOwner {
        _owner = newOwner;
    }

    function checkDonationBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function mint(string memory _tokenURI) public payable {
        _safeMint(msg.sender, tokenCounter);
        _setTokenURI(tokenCounter, _tokenURI);
        tokenCounter++;
    }

    function _setTokenURI(uint256 _tokenId, string memory _tokenURI) internal virtual {
        require(_exists(_tokenId), "Token ID does not exist");
        _tokenURIs[_tokenId] = _tokenURI;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns(string memory){
        require(_exists(_tokenId), "Token ID does not exist");
        return _tokenURIs[_tokenId];
    }
}