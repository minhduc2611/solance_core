use crate::constants::*;
use crate::errors::ErrorCode;
use crate::schema::pool::*;
use crate::schema::task::*;
use crate::schema::user::*;
use anchor_lang::prelude::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::log::sol_log_compute_units;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

#[derive(Accounts)]
#[instruction(hashed_seed: String)]
pub struct TaskCreateRequest<'info> {
  // Task Contract
  #[account(
        init,
        seeds = [b"task_issuing".as_ref(), &hashed_seed.as_ref()],
        bump,
        payer = authority,
        space = size_of::<Task>() + Task::LEN,
    )]
  pub task: Account<'info, Task>,

  // // quản lý treasury, giữ tiền,  1 ví bình thường, được quản lý bởi program, có thể lấy tiền ra từ đây
  // /// CHECK: Just a pure account
  // #[account(seeds = [b"treasurer", &hashed_seed.as_ref()], bump)]
  // pub treasurer: AccountInfo<'info>,
  
  // // tiền 
  // #[account(
  //   init,
  //   payer = authority,
  // )]
  // pub treasury: AccountInfo<'info>,

  // Authority (this is signer who paid transaction fee)
  #[account(mut)]
  /// CHECK: signer ?
  pub authority: Signer<'info>,
  /// System program
  /// CHECK: Simple test account
  // pub system_program: Program<'info, System>,
  pub system_program: UncheckedAccount<'info>,
  // // // Token program
  #[account(constraint = token_program.key == &token::ID)]
  pub token_program: Program<'info, Token>,
  // Clock to save time
  pub clock: Sysvar<'info, Clock>,
}

pub fn exec(
  ctx: Context<TaskCreateRequest>,
) -> Result<()> {
  let mut task = &mut ctx.accounts.task;
  let mut authority = &mut ctx.accounts.authority;

  task.provider = authority.key();
  task.state = String::from(CONDITION_REQUESTED);
  // provider stake money
  // transfer_service_fee_lamports(authority, treasury, amount);
  msg!("Task requested!"); //logging
  sol_log_compute_units(); //Logs how many compute units are left, important for budget
  Ok(())
}

/// Transfers lamports from one account (must be program owned)
/// to another account. The recipient can by any account
fn transfer_service_fee_lamports(
  from_account: &AccountInfo,
  to_account: &AccountInfo,
  amount_of_lamports: u64,
) -> Result<()> {
  // Does the from account have enough lamports to transfer?
  if **from_account.try_borrow_lamports()? < amount_of_lamports {
    return err!(ErrorCode::InsufficientFundsForTransaction);
  }

  // Debit from_account and credit to_account
  // **from_account.lamports.borrow_mut() -= amount_of_lamports;
  // **to_account.lamports.borrow_mut() += amount_of_lamports;

  let source_starting_lamports = from_account.lamports();
  **from_account.lamports.borrow_mut() = source_starting_lamports
    .checked_sub(amount_of_lamports)
    .ok_or(ErrorCode::Overflow)?;

  let destination_starting_lamports = to_account.lamports();
  **to_account.lamports.borrow_mut() = destination_starting_lamports
    .checked_add(amount_of_lamports)
    .ok_or(ErrorCode::Overflow)?;
  Ok(())
}
