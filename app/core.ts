import {
  web3,
  Program,
  utils,
  BN,
  AnchorProvider,
} from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";

import {
  DEFAULT_RPC_ENDPOINT,
  DEFAULT_PROGRAM_ID,
  DEFAULT_IDL,
} from "./constant";
import {
  SolanceCoreIdl,
  AnchorWallet,
  SolanceCoreEvents,
  PoolData,
} from "./types";
import { isAddress } from "./utils";

class SolanceCorePrg {
  private _connection: web3.Connection;
  private _provider: AnchorProvider;
  readonly program: Program<SolanceCoreIdl>;

  constructor(
    wallet: AnchorWallet,
    rpcEndpoint: string = DEFAULT_RPC_ENDPOINT,
    programId: string = DEFAULT_PROGRAM_ID
  ) {
    console.log('rpcEndpoint', DEFAULT_RPC_ENDPOINT)
    console.log('programId', DEFAULT_PROGRAM_ID)
    if (!isAddress(programId)) throw new Error("Invalid program id");
    // Private
    this._connection = new web3.Connection(rpcEndpoint, "confirmed");
    this._provider = new AnchorProvider(this._connection, wallet, {
      skipPreflight: true,
      commitment: "confirmed",
    });
    // Public
    this.program = new Program<SolanceCoreIdl>(
      DEFAULT_IDL,
      programId,
      this._provider
    );
  }

  /**
   * Get list of event names
   */
  get events() {
    return this.program.idl.events.map(({ name }) => name);
  }

  /**
   * Listen changes on an event
   * @param eventName Event name
   * @param callback Event handler
   * @returns Listener id
   */
  addListener = <T extends keyof SolanceCoreEvents>(
    eventName: T,
    callback: (data: SolanceCoreEvents[T]) => void
  ) => {
    return this.program.addEventListener(
      eventName as string,
      (data: SolanceCoreEvents[T]) => callback(data)
    );
  };

  /**
   * Remove listener by its id
   * @param listenerId Listener id
   * @returns
   */
  removeListener = async (listenerId: number) => {
    try {
      await this.program.removeEventListener(listenerId);
    } catch (er: any) {
      console.warn(er.message);
    }
  };

  /**
   * Parse pool buffer data.
   * @param data Pool buffer data.
   * @returns Pool readable data.
   */
  parsePoolData = (data: Buffer): PoolData => {
    return this.program.coder.accounts.decode("pool", data);
  };

  /**
   * Get pool data.
   * @param poolAddress Pool address.
   * @returns Pool readable data.
   */
  getPoolData = async (poolAddress: string): Promise<PoolData> => {
    return this.program.account.pool.fetch(poolAddress);
  };

  /**
   * Derive treasurer address of a pool.
   * @param poolAddress The pool address.
   * @returns Treasurer address that holds the secure token treasuries of the pool.
   */
  deriveTreasurerAddress = async (poolAddress: string) => {
    if (!isAddress(poolAddress)) throw new Error("Invalid pool address");
    const [treasurerPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("treasurer"), new web3.PublicKey(poolAddress).toBuffer()],
      this.program.programId
    );
    return treasurerPublicKey.toBase58();
  };

  /**
   * Create a new pool
   * @param opt.x Amount of X tokens
   * @param opt.y Amount of Y tokens
   * @param opt.xTokenAddress X mint address
   * @param opt.yTokenAddress Y mint address
   * @param opt.pool (Optional) Pool keypair
   * @param sendAndConfirm (Optional) Send and confirm the transaction immediately.
   * @returns { tx, txId, poolAddress }
   */
  createPool = async (
    {
      x,
      y,
      xTokenAddress,
      yTokenAddress,
      pool = web3.Keypair.generate(),
    }: {
      x: BN;
      y: BN;
      xTokenAddress: string;
      yTokenAddress: string;
      pool?: web3.Keypair;
    },
    sendAndConfirm = true
  ) => {
    if (!isAddress(xTokenAddress) || !isAddress(yTokenAddress))
      throw new Error("Invalid token address");
    if (!x.gt(new BN(0)) || !y.gt(new BN(0)))
      throw new Error("Token amounts must be greater than zero");

    const xTokenPublicKey = new web3.PublicKey(xTokenAddress);
    const yTokenPublicKey = new web3.PublicKey(yTokenAddress);

    const srcXAccountPublicKey = await utils.token.associatedAddress({
      mint: xTokenPublicKey,
      owner: this._provider.wallet.publicKey,
    });
    const srcYAccountPublicKey = await utils.token.associatedAddress({
      mint: yTokenPublicKey,
      owner: this._provider.wallet.publicKey,
    });

    const treasurerAddress = await this.deriveTreasurerAddress(
      pool.publicKey.toBase58()
    );
    const treasurerPublicKey = new web3.PublicKey(treasurerAddress);
    const xTreasuryPublicKey = await utils.token.associatedAddress({
      mint: xTokenPublicKey,
      owner: treasurerPublicKey,
    });
    const yTreasuryPublicKey = await utils.token.associatedAddress({
      mint: yTokenPublicKey,
      owner: treasurerPublicKey,
    });

    const builder = this.program.methods
      .createPool(x, y)
      .accounts({
        authority: this._provider.wallet.publicKey,
        pool: pool.publicKey,
        xToken: xTokenPublicKey,
        yToken: yTokenPublicKey,
        srcXAccount: srcXAccountPublicKey,
        srcYAccount: srcYAccountPublicKey,
        treasurer: treasurerPublicKey,
        xTreasury: xTreasuryPublicKey,
        yTreasury: yTreasuryPublicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([pool]);

    const tx = await builder.transaction();
    const txId = sendAndConfirm
      ? await builder.rpc({ commitment: "confirmed" })
      : "";

    return { tx, txId, poolAddress: pool.publicKey.toBase58() };
  };

  swap = async (
    {
      a,
      poolAddress,
    }: {
      a: BN;
      poolAddress: string;
    },
    sendAndConfirm = true
  ) => {
    if (!isAddress(poolAddress)) throw new Error("Invalid pool address");
    if (!a.gt(new BN(0)))
      throw new Error("The token amount must be greater than zero");

    const poolPublicKey = new web3.PublicKey(poolAddress);
    const { xToken: xTokenPublicKey, yToken: yTokenPublicKey } =
      await this.getPoolData(poolAddress);

    const srcXAccountPublicKey = await utils.token.associatedAddress({
      mint: xTokenPublicKey,
      owner: this._provider.wallet.publicKey,
    });
    const dstYAccountPublicKey = await utils.token.associatedAddress({
      mint: yTokenPublicKey,
      owner: this._provider.wallet.publicKey,
    });

    const treasurerAddress = await this.deriveTreasurerAddress(poolAddress);
    const treasurerPublicKey = new web3.PublicKey(treasurerAddress);
    const xTreasuryPublicKey = await utils.token.associatedAddress({
      mint: xTokenPublicKey,
      owner: treasurerPublicKey,
    });
    const yTreasuryPublicKey = await utils.token.associatedAddress({
      mint: yTokenPublicKey,
      owner: treasurerPublicKey,
    });

    const builder = this.program.methods.swap(a).accounts({
      authority: this._provider.wallet.publicKey,
      pool: poolPublicKey,
      xToken: xTokenPublicKey,
      yToken: yTokenPublicKey,
      srcXAccount: srcXAccountPublicKey,
      dstYAccount: dstYAccountPublicKey,
      treasurer: treasurerPublicKey,
      xTreasury: xTreasuryPublicKey,
      yTreasury: yTreasuryPublicKey,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY,
    });

    const tx = await builder.transaction();
    const txId = sendAndConfirm
      ? await builder.rpc({ commitment: "confirmed" })
      : "";

    return { tx, txId };
  };

  createTask = async (
    {
      id,
      name,
    }: {
      id: string;
      name: string;
    },
    sendAndConfirm = true
  ) => {
    const [task_pda] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("task_issuing"), utf8.encode(id)],
      this.program.programId
    );
    const builder = this.program.methods
      .taskCreateAndIssueCond(id, name)
      .accounts({
        task: task_pda,
        authority: this._provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      });

    const tx = await builder.transaction();
    const txId = sendAndConfirm
      ? await builder.rpc({ commitment: "confirmed" })
      : "";

    return { tx, txId };
  };
}

export default SolanceCorePrg;
