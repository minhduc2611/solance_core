import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanceCore } from "../target/types/solance_core";
import { v4 as uuidv4 } from "uuid";

import {
  AnchorProvider,
  setProvider,
  workspace,
  Spl,
  web3,
  BN,
  utils,
} from "@project-serum/anchor";
import { initializeAccount, initializeMint, mintTo, requestAirdrop, toCrc32 } from "./pretest";
import { expect } from "chai";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";

describe.only("Task", () => {
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
  const id1 = uuidv4();
  const id2 = uuidv4();
  const taskInput1 = {
    hashedSeed: toCrc32(id1),
    id: id1,
    name: "MOCK TASK",
  };
  const taskInput2 = {
    hashedSeed: toCrc32(id2),
    id: id2,
    name: "MOCK TASK2",
  };

  const PRIV_KEY_FOR_TEST_ONLY_A = Buffer.from([
    237, 78, 198, 180, 95, 150, 154, 179, 40, 133, 205, 225, 230, 73, 137, 194,
    249, 19, 101, 224, 155, 129, 253, 184, 19, 190, 21, 181, 238, 127, 28, 158,
    17, 201, 177, 217, 37, 148, 1, 199, 207, 226, 183, 185, 224, 106, 44, 12,
    250, 12, 85, 20, 5, 6, 215, 192, 29, 253, 9, 245, 196, 24, 58, 191,
  ]);
  const PRIV_KEY_FOR_TEST_ONLY_B = Buffer.from([
    2, 178, 226, 192, 204, 173, 232, 36, 247, 215, 203, 12, 177, 251, 254, 243,
    92, 38, 237, 60, 38, 248, 213, 19, 73, 180, 31, 164, 63, 210, 172, 90, 85,
    215, 166, 105, 84, 194, 133, 92, 34, 27, 39, 2, 158, 57, 64, 226, 198, 222,
    25, 127, 150, 87, 141, 234, 34, 239, 139, 107, 155, 32, 47, 199,
  ]);
  const walletA = web3.Keypair.fromSecretKey(PRIV_KEY_FOR_TEST_ONLY_A);
  const walletB = web3.Keypair.fromSecretKey(PRIV_KEY_FOR_TEST_ONLY_B);
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
  it("Create task #1", async () => {

    await requestAirdrop(
      provider,
      walletA.publicKey,
      2 * web3.LAMPORTS_PER_SOL
    );
    // Derive treasury & treasurer
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput1.hashedSeed)],
      program.programId
    );

    const [treasurer_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("treasurer"), utf8.encode(taskInput1.hashedSeed)],
      program.programId
    );

    const txId = await program.methods
      .taskCreateAndIssueCond(
        taskInput1.hashedSeed,
        taskInput1.id,
        taskInput1.name,
        new BN(1e9)
      )
      .accounts({
        task: task_pda,
        treasurer: treasurer_pda,
        authority: walletA.publicKey,
        systemProgram: web3.SystemProgram.programId,
        // tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .signers([walletA])
      .rpc();
    expect(txId).to.be.an("string");
  });

  xit("Create task #2", async () => {
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput2.hashedSeed)],
      program.programId
    );

    const txId = await program.methods
      .taskCreateAndIssueCond(
        taskInput2.hashedSeed,
        taskInput2.id,
        taskInput2.name,
        new BN(1e9)
      )
      .accounts({
        task: task_pda,
        authority: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();
    expect(txId).to.be.an("string");
  });

  // get data
  it("Get data #1", async () => {
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput1.hashedSeed)],
      program.programId
    );
    const task2 = await program.account.task.fetch(task_pda);

    console.log("task2", task2);
    expect(task2.name).to.be.eq(taskInput1.name);
  });

  // Dev request task
  xit("Dev request task #1", async () => {
    //user choose task 1
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput1.hashedSeed)],
      program.programId
    );

    // walletA
    const txId = await program.methods
      .taskCreateRequest()
      .accounts({
        task: task_pda,
        authority: walletA.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .signers([walletA])
      .rpc();
    expect(txId).to.be.an("string");
  });

  xit("Expect task 1 has devOwner walletA publicKey #1", async () => {
    //user choose task 1
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(taskInput1.hashedSeed)],
      program.programId
    );

    const task1 = await program.account.task.fetch(task_pda);
    console.log("task1", task1);
    expect(task1.name).to.be.eq(taskInput1.name);
    expect(task1.provider).to.be.eq(walletA.publicKey);
  });

  it("Get data after", async () => {
    // let a = await provider.connection.getBalance(walletA.publicKey);
    // console.log("balance after A", a);
    // let b = await provider.connection.getBalance(walletB.publicKey);
    // console.log("balance after B", b);
    // const [treasurer_pda] = await web3.PublicKey.findProgramAddress(
    //   [utf8.encode("treasurer"), utf8.encode(taskInput1.hashedSeed)],
    //   program.programId
    // );

    let b = await provider.connection.getBalance(walletB.publicKey);
    console.log("balance after B", b);
  });
});
