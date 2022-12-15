import bs58 from 'bs58'
import { BorshAccountsCoder } from '@project-serum/anchor'

import { IDL } from '../target/types/solance_core'

export const DEFAULT_RPC_ENDPOINT = 'https://api.devnet.solana.com'
// export const DEFAULT_RPC_ENDPOINT = 'http://127.0.0.1:8899'
// export const DEFAULT_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
export const DEFAULT_PROGRAM_ID = 'Cwhe8TUEsSucAd4TTCZ3Fej1TDAKpiu5k8C7EuLMXgAn'
export const DEFAULT_IDL = IDL

export const POOL_DISCRIMINATOR = bs58.encode(
  BorshAccountsCoder.accountDiscriminator('pool'),
)
