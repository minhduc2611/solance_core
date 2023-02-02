import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanceCore } from "../target/types/solance_core";
import {
  AnchorProvider,
  setProvider,
  workspace,
  Spl,
  web3,
  BN,
  utils,
} from "@project-serum/anchor";
import { initializeAccount, initializeMint, mintTo } from "./pretest";
import { expect } from "chai";
describe("solance_core", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = anchor.workspace.SolanceCore as Program<SolanceCore>;

  const spl = Spl.token();

  const xToken = new web3.Keypair();
  let xTokenAccount: web3.PublicKey;

  const yToken = new web3.Keypair();
  let yTokenAccount: web3.PublicKey;

  const pool = new web3.Keypair();

  let treasurer: web3.PublicKey;
  let xTreasury: web3.PublicKey;
  let yTreasury: web3.PublicKey;

  before(async () => {
    // Init mints
    await initializeMint(6, xToken, spl); // token usually has 6 - 9 decimal ->> create SLP token
    await initializeMint(6, yToken, spl);
    // Init accounts
    xTokenAccount = await utils.token.associatedAddress({
      mint: xToken.publicKey,
      owner: provider.wallet.publicKey,
    });

    await initializeAccount(
      xTokenAccount,
      xToken.publicKey,
      provider.wallet.publicKey,
      provider
    );

    yTokenAccount = await utils.token.associatedAddress({
      mint: yToken.publicKey,
      owner: provider.wallet.publicKey,
    });

    await initializeAccount(
      yTokenAccount,
      yToken.publicKey,
      provider.wallet.publicKey,
      provider
    );
    // Mint tokens
    // mint lamports
    await mintTo(new BN("1000000000000"), xToken.publicKey, xTokenAccount, spl);
    await mintTo(new BN("1000000000000"), yToken.publicKey, yTokenAccount, spl);

    // Derive treasury & treasurer
    const [treasurerPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("treasurer"), pool.publicKey.toBuffer()],
      program.programId
    );

    treasurer = treasurerPublicKey;

    xTreasury = await utils.token.associatedAddress({
      mint: xToken.publicKey,
      owner: treasurer,
    });

    yTreasury = await utils.token.associatedAddress({
      mint: yToken.publicKey,
      owner: treasurer,
    });
  });
  it("Create pool", async () => {
    // Add your test here.
    const txId = await program.methods
      .createPool(new BN("500000000000"), new BN("500000000000"))
      .accounts({
        authority: provider.wallet.publicKey,
        pool: pool.publicKey,
        xToken: xToken.publicKey,
        yToken: yToken.publicKey,
        srcXAccount: xTokenAccount,
        srcYAccount: yTokenAccount,
        treasurer,
        xTreasury,
        yTreasury,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([pool])
      .rpc();
    expect(txId).to.be.an("string");
  });

  it("Get data #1", async () => {
    const { x, y } = await program.account.pool.fetch(pool.publicKey);
    expect(x.eq(new BN("500000000000"))).to.be.true;
    expect(y.eq(new BN("500000000000"))).to.be.true;
  });

  it("Swap", async () => {
    const txId = await program.methods
      .swap(new BN("5000000000"))
      .accounts({
        authority: provider.wallet.publicKey,
        pool: pool.publicKey,
        xToken: xToken.publicKey,
        yToken: yToken.publicKey,
        srcXAccount: xTokenAccount,
        dstYAccount: yTokenAccount,
        treasurer,
        xTreasury,
        yTreasury,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    expect(txId).to.be.an("string");
  });

  it("Get data #2", async () => {
    const { x, y } = await program.account.pool.fetch(pool.publicKey);
    expect(x.eq(new BN("505000000000"))).to.be.true;
    expect(y.eq(new BN("495049504950"))).to.be.true;
  });

  it("Get Lamports", async () => {
    // await mintTo(new BN("1000000000000"), lampr, yTokenAccount, spl);
    // const connection = provider.connection;
    // await connection.requestAirdrop('DLe4LjZ8REDqQ1GiL54xiauAETM9jmtxPkyAzHFp9GQM' as unknown as web3.PublicKey, 2*web3.LAMPORTS_PER_SOL); // 1 SOL

    // connection
    const dev_net_connection = new web3.Connection(
      web3.clusterApiUrl("devnet")
    );
    // const connection = provider.connection;
    // 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8
    const feePayer = web3.Keypair.fromSecretKey(
      Uint8Array.from([
        166, 232, 63, 183, 107, 234, 11, 83, 128, 146, 22, 147, 24, 13, 0, 38,
        178, 15, 47, 30, 116, 1, 219, 224, 77, 23, 215, 20, 22, 123, 16, 151,
        183, 84, 45, 252, 219, 189, 156, 24, 101, 68, 109, 148, 29, 38, 88, 58,
        182, 142, 6, 219, 67, 102, 63, 155, 237, 216, 150, 160, 176, 73, 79,
        214,
      ])
    );
    (async () => {
      try {
        // 1e9 lamports = 10^9 lamports = 1 SOL
        let txhash = await dev_net_connection.requestAirdrop(
          feePayer.publicKey,
          4e9
        );
        console.log(`txhash: ${txhash}`);
      } catch (error) {
        console.log(`error: ${error}`);
      }
    })();
  });
});
