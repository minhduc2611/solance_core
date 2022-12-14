import {
  AnchorProvider,
  BN,
  Program,
  SplToken,
  utils,
  Wallet,
  web3,
} from '@project-serum/anchor'
import { program as getSplProgram } from '@project-serum/anchor/dist/cjs/spl/token'
import { expect } from 'chai'

import SolanceCorePrg, { DEFAULT_PROGRAM_ID, isAddress } from '../app'
import { initializeAccount, initializeMint } from './pretest'

const PRIV_KEY_FOR_TEST_ONLY = Buffer.from([
  2, 178, 226, 192, 204, 173, 232, 36, 247, 215, 203, 12, 177, 251, 254, 243,
  92, 38, 237, 60, 38, 248, 213, 19, 73, 180, 31, 164, 63, 210, 172, 90, 85,
  215, 166, 105, 84, 194, 133, 92, 34, 27, 39, 2, 158, 57, 64, 226, 198, 222,
  25, 127, 150, 87, 141, 234, 34, 239, 139, 107, 155, 32, 47, 199,
])

describe('core', function () {
  const wallet = new Wallet(web3.Keypair.fromSecretKey(PRIV_KEY_FOR_TEST_ONLY))
  let solanceCorePrg: SolanceCorePrg,
    connection: web3.Connection,
    splProgram: Program<SplToken>,
    poolAddress: string,
    xTokenAddress: string,
    xTokenAccountAddress: string,
    yTokenAddress: string,
    yTokenAccountAddress: string

  before(async () => {
    const { program } = new SolanceCorePrg(wallet)
    const provider = program.provider as AnchorProvider
    splProgram = getSplProgram(provider)
    // Init X token
    const xToken = web3.Keypair.generate()
    xTokenAddress = xToken.publicKey.toBase58()
    await initializeMint(6, xToken, splProgram)
    xTokenAccountAddress = (
      await utils.token.associatedAddress({
        owner: wallet.publicKey,
        mint: new web3.PublicKey(xTokenAddress),
      })
    ).toBase58()
    await initializeAccount(
      xTokenAccountAddress,
      xTokenAddress,
      wallet.publicKey,
      provider,
    )
    await splProgram.methods
      .mintTo(new BN('1000000000000'))
      .accounts({
        mint: new web3.PublicKey(xTokenAddress),
        to: new web3.PublicKey(xTokenAccountAddress),
        authority: wallet.publicKey,
      })
      .rpc()
    // Init Y token
    const yToken = web3.Keypair.generate()
    yTokenAddress = yToken.publicKey.toBase58()
    await initializeMint(6, yToken, splProgram)
    yTokenAccountAddress = (
      await utils.token.associatedAddress({
        owner: wallet.publicKey,
        mint: new web3.PublicKey(yTokenAddress),
      })
    ).toBase58()
    await initializeAccount(
      yTokenAccountAddress,
      yTokenAddress,
      wallet.publicKey,
      provider,
    )
    await splProgram.methods
      .mintTo(new BN('1000000000000'))
      .accounts({
        mint: new web3.PublicKey(yTokenAddress),
        to: new web3.PublicKey(yTokenAccountAddress),
        authority: wallet.publicKey,
      })
      .rpc()
  })

  it('constructor', async () => {
    solanceCorePrg = new SolanceCorePrg(wallet)
    if (solanceCorePrg.program.programId.toBase58() !== DEFAULT_PROGRAM_ID)
      throw new Error('Cannot contruct a solanceCorePrg instance')
    // Setup test supporters
    connection = solanceCorePrg.program.provider.connection
  })

  it('create pool', async () => {
    const { poolAddress: _poolAddress } = await solanceCorePrg.createPool({
      x: new BN('500000000000'),
      y: new BN('500000000000'),
      xTokenAddress,
      yTokenAddress,
    })
    poolAddress = _poolAddress
    expect(poolAddress).to.be.an('string')
  })

  it('Get data #1', async () => {
    const { x, y } = await solanceCorePrg.getPoolData(poolAddress)
    expect(x.eq(new BN('500000000000'))).to.be.true
    expect(y.eq(new BN('500000000000'))).to.be.true
  })

  it('swap', async () => {
    const { txId } = await solanceCorePrg.swap({
      a: new BN('5000000000'),
      poolAddress,
    })
    expect(txId).to.be.an('string')
  })

  it('Get data #2', async () => {
    const { x, y } = await solanceCorePrg.getPoolData(poolAddress)
    expect(x.eq(new BN('505000000000'))).to.be.true
    expect(y.eq(new BN('495049504950'))).to.be.true
  })
})
