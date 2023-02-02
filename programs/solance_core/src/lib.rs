use anchor_lang::prelude::*;

pub mod constants;

pub mod instructions;
pub use instructions::*;

pub mod schema;
pub use schema::*;

pub mod errors;
pub use errors::*;

declare_id!("Cwhe8TUEsSucAd4TTCZ3Fej1TDAKpiu5k8C7EuLMXgAn");

#[program]
pub mod solance_core {
  use num_traits::Num;

  use crate::instructions::CreatePool;

  use super::*;

  pub fn transfer_lamports(ctx: Context<Transfer>, amount_of_lamports: u64) -> Result<()> {
    transfer_lamports::exec(ctx, amount_of_lamports)
  }

  pub fn task_create_and_issue_cond(
    ctx: Context<TaskCreateAndIssueCondition>,
    hashed_seed: String,
    id: String,
    name: String,
    amount: u64,
  ) -> Result<()> {
    task_create_and_issue_cond::exec(ctx, hashed_seed, id, name, amount)
  }

  pub fn task_create_request(ctx: Context<TaskCreateRequest>) -> Result<()> {
    task_create_request::exec(ctx)
  }
  pub fn create_pool(ctx: Context<CreatePool>, x: u64, y: u64) -> Result<()> {


    let example: i8 = -129;
    create_pool::exec(ctx, x, y)
  }

  pub fn swap(ctx: Context<Swap>, a: u64) -> Result<()> {
    swap::exec(ctx, a)
  }

  pub fn create_user(
    ctx: Context<CreateUser>,
    name: String,
    profile_url: String,
    user_role: String,
  ) -> Result<()> {
    create_user::exec(ctx, name, profile_url, user_role)
  }
}

#[derive(Accounts)]
pub struct Initialize {}
