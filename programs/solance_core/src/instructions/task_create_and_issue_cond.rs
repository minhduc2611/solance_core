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
use anchor_spl::token::{self, Token};
use std::mem::size_of;

#[derive(Accounts)]
#[instruction(hashed_seed: String)]
pub struct TaskCreateAndIssueCondition<'info> {
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
  /// CHECK: Just a pure account
  #[account(seeds = [b"treasurer", &hashed_seed.as_ref()], bump)]
  pub treasurer: AccountInfo<'info>,

  // // tiền
  // #[account(
  //   init,
  //   payer = authority,
  // )]
  // pub treasury: AccountInfo<'info>,

  // Authority (this is signer who paid transaction fee)
  #[account(mut, signer)]
  /// CHECK: signer ?
  pub authority: AccountInfo<'info>,
  /// System program
  /// CHECK: Simple test account
  // pub system_program: Program<'info, System>,
  pub system_program: UncheckedAccount<'info>,

  // Clock to save time
  pub clock: Sysvar<'info, Clock>,
}

pub fn exec(
  ctx: Context<TaskCreateAndIssueCondition>,
  hashed_seed: String,
  id: String,
  name: String,
  amount: u64,
) -> Result<()> {
  let mut task = &mut ctx.accounts.task;
  let mut from_account = &mut ctx.accounts.authority;
  let mut to_account = &mut ctx.accounts.treasurer;
  // let mut treasury = &mut ctx.accounts.treasury;
  task.hashed_seed = hashed_seed;
  task.id = id;
  task.name = name;
  task.amount = amount;
  task.state = String::from(CONDITION_ISSUED);

  // transfer_lamports(from_account, to_account, amount_of_lamports);
  if **from_account.clone().try_borrow_lamports()? < amount {
    return err!(ErrorCode::InsufficientFundsForTransaction);
  }

  let sol_transfer = anchor_lang::solana_program::system_instruction::transfer(
    from_account.key,
    to_account.key,
    amount,
  );

  invoke(&sol_transfer, &[from_account.clone(), to_account.clone()])?;

  msg!("Task Issued!"); //logging
  sol_log_compute_units(); //Logs how many compute units are left, important for budget
  Ok(())
}
