# Nft-minter

With this program we can mint nfts, update its metadata, and it has ownable feature as well in solana.

Deployed program address : `5GazsE1oEPBpPWSc7UFAyNr2LfTSpBKQ8AX7was68VqY` (Devnet)

To operate this program we can use the deployed version directly without building or deploying the contract.

## steps

1. Clone this repo 
```bash
git clone https://github.com/Maverick9081/Nft-minter
```

2. Move to the scripts folder
```bash
cd Nft-minter/scripts
```

3.install dependencies
```bash
npm install
```
At the first deployment we have to run `createOwner` file to give the program its first owner, otherwise no function will run

4.minting nfts in bulk

To mint nfts we have the go the `mint`file.At there we have to edit `creator`,`uri`,`symbol` and `title` according to our need of minting.The amount of input in all the arrays should be the same.
```bash
node mint
```
and it will mint the nfts

5.Updating metadata

we can update symbol,uri,title. But we have to eneter the verified creator address to make it work, we can't remove a verified creator from metadata.
```bash
node updateMetadata
```

6.Updating Authority

By changing new_owner address the authority will change,and none of the functions will work without the authority signing
```bash
node updateOwner
```
