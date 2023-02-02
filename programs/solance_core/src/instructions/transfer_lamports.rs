use crate::constants::*;
use crate::errors::ErrorCode;
use crate::schema::pool::*;
use crate::schema::task::*;
use crate::schema::user::*;
use anchor_lang::prelude::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::log::sol_log_compute_units;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

#[derive(Accounts)]
pub struct Transfer<'info> {
  #[account(mut)]
  /// CHECK: This is not dangerous because we just pay to this account
  pub to: AccountInfo<'info>,
  #[account(mut, signer)]
  /// CHECK: This is not dangerous because we just pay to this account
  pub from: AccountInfo<'info>,
  pub system_program: Program<'info, System>,
}

pub fn exec(ctx: Context<Transfer>, amount_of_lamports: u64) -> Result<()> {
  let from_account = &ctx.accounts.from;
  let to_account = &ctx.accounts.to;

  // transfer_lamports(from_account, to_account, amount_of_lamports);
  if **from_account.clone().try_borrow_lamports()? < amount_of_lamports {
    return err!(ErrorCode::InsufficientFundsForTransaction);
  }

  let sol_transfer = anchor_lang::solana_program::system_instruction::transfer(
    from_account.key,
    to_account.key,
    amount_of_lamports,
  );
  
  invoke(&sol_transfer, &[from_account.clone(), to_account.clone()])?;
  
  msg!("Task requested!"); //logging
  sol_log_compute_units(); //Logs how many compute units are left, important for budget
  Ok(())
}

/// Transfers lamports from one account (must be program owned)
/// to another account. The recipient can by any account
fn transfer_lamports(
  from_account: &AccountInfo,
  to_account: &AccountInfo,
  amount_of_lamports: u64,
) -> Result<()> {
  // // Does the from account have enough lamports to transfer?
  // if **from_account.try_borrow_lamports()? < amount_of_lamports {
  //   return err!(ErrorCode::InsufficientFundsForTransaction);
  // }

  // // Debit from_account and credit to_account
  // // **from_account.lamports.borrow_mut() -= amount_of_lamports;
  // // **to_account.lamports.borrow_mut() += amount_of_lamports;

  // let source_starting_lamports = from_account.lamports();
  // **from_account.lamports.borrow_mut() = source_starting_lamports
  //   .checked_sub(amount_of_lamports)
  //   .ok_or(ErrorCode::Overflow)?;

  // let destination_starting_lamports = to_account.lamports();
  // **to_account.lamports.borrow_mut() = destination_starting_lamports
  //   .checked_add(amount_of_lamports)
  //   .ok_or(ErrorCode::Overflow)?;

  Ok(())
}
