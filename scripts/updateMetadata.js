import {
  getProgram,
  getWallet,
  TOKEN_METADATA_PROGRAM_ID,
  programAddress,
} from "./helper.js";
import * as anchor from "@project-serum/anchor";
const { SystemProgram } = anchor.web3;
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import pkg from "@solana/web3.js";
const { Transaction, Connection, clusterApiUrl } = pkg;

const wallet = await getWallet();
const program = await getProgram(wallet);
const connection = new Connection(clusterApiUrl("devnet"));

const creator = new anchor.web3.PublicKey(
  "5p5pzWAJnT8vZtKaGRZxpQiz6fu35bYwLmrVNbjLtbuT"
);
const newtitle = "hi";
const newSymbo = "HI";
const newUri = "hskjdhkfjs";
const mint = new anchor.web3.PublicKey(
  "G4ViqLGmz1fuSaY3LHnJo3FE4qajRrAfFdxRJHHW6BiQ"
);

async function updateMetadata() {
  const metadata = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  const owners = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("owner")],
    programAddress
  );

  const tx = await program.methods
    .updateMetadata(creator, newtitle, newSymbo, newUri)
    .accounts({
      owner: wallet.publicKey,
      mint: mint,
      metadata: metadata[0],
      owners: owners[0],
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  let ix = new Transaction();

  ix.add(tx);
  ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  ix.feePayer = wallet.publicKey;

  wallet.signTransaction(ix);

  const sign = await connection.sendRawTransaction(ix.serialize());

  const hash = await connection.confirmTransaction(sign, "confirmed");
  return mint.publicKey.toBase58();
}
updateMetadata();
