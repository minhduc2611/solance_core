pub const DISCRIMINATOR_SIZE: usize = 8;
pub const PUBKEY_SIZE: usize = 32;
pub const U8_SIZE: usize = 1;
pub const U32_SIZE: usize = 4;
pub const U64_SIZE: usize = 8;
pub const U128_SIZE: usize = 16;
pub const I64_SIZE: usize = 8;
pub const BOOL_SIZE: usize = 1;
pub const VECTOR_OVERHEAD_SIZE: usize = 4;
// pub enum TaskState {
//   ConditionIssed(String),
//   ConditionRequested(String),
//   ConditionAgreed(String),
//   ConditionNotMeet(String),
//   ConditionAllMeet(String),
// }
pub const CONDITION_ISSUED: &str = "CONDITION_ISSUED";
pub const CONDITION_REQUESTED: &str = "CONDITION_REQUESTED";
pub const CONDITION_AGREED: &str = "CONDITION_AGREED";
pub const CONDITION_NOT_MEET: &str = "CONDITION_NOT_MEET";
pub const CONDITION_ALL_MEET: &str = "CONDITION_ALL_MEET";

