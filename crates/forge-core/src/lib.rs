pub mod binary;
pub mod color;
pub mod convert;
pub mod crypto;
pub mod files;
pub mod json;
pub mod net;
pub mod numbers;
pub mod text;
pub mod time_tools;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests;

#[cfg(test)]
mod lib_tests {
    use super::*;
    #[test]
    fn it_works() {
        assert_eq!(add(2, 2), 4);
    }
}
