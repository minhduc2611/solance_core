use crate::errors::ErrorCode;
use crate::schema::pool::*;
use crate::schema::user::*;
use crate::schema::task::*;
use crate::constants::*;
use anchor_lang::prelude::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::log::sol_log_compute_units;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

#[derive(Accounts)]
#[instruction(hashed_seed: String)]
pub struct TaskCreateAndIssueCondition<'info> {
  #[account(
        init,
        seeds = [b"task_issuing".as_ref(), hashed_seed.as_ref()],
        bump,
        payer = authority,
        space = size_of::<Task>() + Task::LEN,
    )]
  pub task: Account<'info, Task>,

  // Authority (this is signer who paid transaction fee)
  #[account(mut)]
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
  ctx: Context<TaskCreateAndIssueCondition>,
  hashed_seed: String,
  id: String,
  name: String,
) -> Result<()> {
  let task = &mut ctx.accounts.task;
  task.hashed_seed = hashed_seed;
  task.id = id;
  task.name = name;
  task.state = String::from(CONDITION_ISSUED);
 
  msg!("Task Issued!"); //logging
  sol_log_compute_units(); //Logs how many compute units are left, important for budget
  Ok(())
}
