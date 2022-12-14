use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Operation overflowed")]
  Overflow,
  #[msg("Invalid amount")]
  InvalidAmount,
  #[msg("Cannot find treasurer account")]
  NoBump,
}
