import { web3 } from '@project-serum/anchor'
var CRC32 = require("crc-32");

/**
 * Validate an address
 * @param address Base58 string
 * @returns true/false
 */
export const isAddress = (address: string | undefined): address is string => {
  if (!address) return false
  try {
    const publicKey = new web3.PublicKey(address)
    if (!publicKey) throw new Error('Invalid public key')
    return true
  } catch (er) {
    return false
  }
}

export const toCrc32 = (str: String) => {
  let a = CRC32.buf(Buffer.from(str, "binary"), 0) >>> 0; // to unsigned int
  return a.toString();
};