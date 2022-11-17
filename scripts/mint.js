import * as anchor from "@project-serum/anchor";
import pkg from "@solana/web3.js";
const { Keypair, Publickey, Connection, clusterApiUrl, Transaction } = pkg;
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  getWallet,
  getProgram,
  TOKEN_METADATA_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  programAddress,
} from "./helper.js";

const { SystemProgram } = anchor.web3;

const connection = new Connection(clusterApiUrl("devnet"));

const wallet = await getWallet();

const program = await getProgram(wallet);

let uris = ["hello", "hi"];
let creator = [
  "5p5pzWAJnT8vZtKaGRZxpQiz6fu35bYwLmrVNbjLtbuT",
  "5p5pzWAJnT8vZtKaGRZxpQiz6fu35bYwLmrVNbjLtbuT",
];
let name = ["hi", "ki"];
let symbol = ["SYM", "BOL"];

async function mintMultipleNfts() {
  if (
    uris.length == creator.length ||
    name.length == symbol.length ||
    creator.length == symbol.length
  ) {
    for (let i = 0; i < creator.length; i++) {
      const mints = await mint(
        new anchor.web3.PublicKey(creator[i]),
        uris[i],
        name[i],
        symbol[i]
      );
      console.log("minted Nft", mints);
    }
  }
  return;
}
async function mint(creator, uri, name, symbol) {
  const mint = Keypair.generate();

  const NftTokenAccount = await anchor.web3.PublicKey.findProgramAddress(
    [
      wallet.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );
  const metadata = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  const owners = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("owner")],
    programAddress
  );

  const tx = await program.methods
    .mint(creator, uri, name, symbol)
    .accounts({
      owner: wallet.publicKey,
      beneficiary: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadata: metadata[0],
      authority: wallet.publicKey,
      mint: mint.publicKey,
      ata: NftTokenAccount[0],
      owners: owners[0],
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      SystemProgram: SystemProgram,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    })
    .instruction();

  let ix = new Transaction();

  ix.add(tx);
  ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  ix.feePayer = wallet.publicKey;

  ix.partialSign(mint);

  wallet.signTransaction(ix);

  const sign = await connection.sendRawTransaction(ix.serialize());

  const hash = await connection.confirmTransaction(sign, "confirmed");
  return mint.publicKey.toBase58();
}

mintMultipleNfts();
