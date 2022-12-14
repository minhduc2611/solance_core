use anchor_lang::prelude::*;

pub mod constants;

pub mod instructions;
pub use instructions::*;

pub mod schema;
pub use schema::*;

pub mod errors;
pub use errors::*;

// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
declare_id!("593Pj7uEyxExsxUiVV55bDScRzyEM9L7d5UUjjSRUbpv");

#[program]
pub mod solance_core {
  use num_traits::Num;

  use crate::instructions::CreatePool;

  use super::*;

  pub fn task_create_and_issue_cond(
    ctx: Context<TaskCreateAndIssueCondition>,
    id: String,
    name: String,
  ) -> Result<()> {
    task_create_and_issue_cond::exec(ctx, id, name)
  }
  pub fn create_pool(ctx: Context<CreatePool>, x: u64, y: u64) -> Result<()> {
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
