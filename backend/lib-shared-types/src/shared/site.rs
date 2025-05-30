use chrono::{DateTime, Days, Months, Utc};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter, EnumString};

use crate::constants::{GB, KB, MB, TB};

use super::core::ExecEnv;

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
pub enum SitePaymentPeriod {
    Daily,
    Monthly,
    Yearly,
}

impl SitePaymentPeriod {
    pub fn next_date(&self, date: DateTime<Utc>) -> DateTime<Utc> {
        match self {
            SitePaymentPeriod::Daily => date + Days::new(1),
            SitePaymentPeriod::Monthly => date + Months::new(1),
            SitePaymentPeriod::Yearly => date + Months::new(12),
        }
    }
    pub fn days_from_due(&self) -> i32 {
        match self {
            SitePaymentPeriod::Daily => 1,
            SitePaymentPeriod::Monthly => 2,
            SitePaymentPeriod::Yearly => 2,
        }
    }
}

#[derive(
    Debug,
    Serialize,
    Deserialize,
    Clone,
    Copy,
    PartialEq,
    Eq,
    EnumString,
    Display,
    sqlx::Type,
    EnumIter,
)]
pub enum SiteType {
    Free,
    Paid1,
    Paid2,
    Paid3,
}

impl SiteType {
    pub fn get_max_context_length(&self) -> u64 {
        match self {
            SiteType::Free => 100 * KB,
            SiteType::Paid1 => 200 * KB,
            SiteType::Paid2 => 500 * KB,
            SiteType::Paid3 => 1 * MB,
        }
    }
    pub fn get_max_history_length(&self) -> u64 {
        match self {
            SiteType::Free => 100 * KB,
            SiteType::Paid1 => 200 * KB,
            SiteType::Paid2 => 500 * KB,
            SiteType::Paid3 => 1 * MB,
        }
    }
    pub fn get_max_pages_length(&self) -> u64 {
        match self {
            SiteType::Free => 500 * KB,
            SiteType::Paid1 => 1 * MB,
            SiteType::Paid2 => 10 * MB,
            SiteType::Paid3 => 50 * MB,
        }
    }
    pub fn get_bandwidth_allowance(&self, exec_env: ExecEnv) -> u64 {
        if exec_env == ExecEnv::Dev || exec_env == ExecEnv::Ci {
            match self {
                // Reduced bandwidth for testing
                SiteType::Free => 7500,
                SiteType::Paid1 => 100 * GB,
                SiteType::Paid2 => 1 * TB,
                SiteType::Paid3 => 3 * TB,
            }
        } else {
            match self {
                SiteType::Free => 10 * GB,
                SiteType::Paid1 => 100 * GB,
                SiteType::Paid2 => 1 * TB,
                SiteType::Paid3 => 3 * TB,
            }
        }
    }
    pub fn get_custom_data_allowance(&self, exec_env: ExecEnv) -> i64 {
        let allowance = if exec_env == ExecEnv::Dev || exec_env == ExecEnv::Ci {
            match self {
                // Reduced allowance for testing
                SiteType::Free => 0,
                SiteType::Paid1 => 40000,
                SiteType::Paid2 => 20 * MB,
                SiteType::Paid3 => 100 * MB,
            }
        } else {
            match self {
                SiteType::Free => 0,
                SiteType::Paid1 => 5 * MB,
                SiteType::Paid2 => 20 * MB,
                SiteType::Paid3 => 100 * MB,
            }
        };
        allowance as i64
    }
    pub fn get_capacity(&self) -> i32 {
        match self {
            SiteType::Free => 1,
            SiteType::Paid1 => 5,
            SiteType::Paid2 => 20,
            SiteType::Paid3 => 50,
        }
    }
    // Description for ECPay Checkout
    pub fn get_description(&self) -> String {
        match self {
            SiteType::Free => "Site Type Free",
            SiteType::Paid1 => "Site Type 1",
            SiteType::Paid2 => "Site Type 2",
            SiteType::Paid3 => "Site Type 3",
        }
        .to_string()
    }
    pub fn get_price_ntd_cents(&self, payment_period: &SitePaymentPeriod) -> i32 {
        let price = self.get_price_ntd(payment_period);
        price * 100
    }
    pub fn get_price_ntd(&self, payment_period: &SitePaymentPeriod) -> i32 {
        match self {
            SiteType::Free => 0,
            SiteType::Paid1 => {
                if *payment_period == SitePaymentPeriod::Monthly {
                    90
                } else {
                    900
                }
            }
            SiteType::Paid2 => {
                if *payment_period == SitePaymentPeriod::Monthly {
                    180
                } else {
                    1800
                }
            }
            SiteType::Paid3 => {
                if *payment_period == SitePaymentPeriod::Monthly {
                    450
                } else {
                    4500
                }
            }
        }
    }
    pub fn get_asset_allowance(&self) -> u64 {
        match self {
            SiteType::Free => 10 * MB,
            SiteType::Paid1 => 100 * MB,
            SiteType::Paid2 => 1 * GB,
            SiteType::Paid3 => 5 * GB,
        }
    }
}

#[cfg(test)]
mod tests {
    use chrono::{NaiveDate, NaiveDateTime, NaiveTime, TimeZone};

    use super::*;

    fn date_at(year: i32, month: u32, day: u32) -> DateTime<Utc> {
        let date = NaiveDate::from_ymd_opt(year, month, day).unwrap();
        let date_time = NaiveDateTime::new(date, NaiveTime::from_hms_opt(0, 0, 0).unwrap());
        return Utc.from_local_datetime(&date_time).unwrap();
    }

    #[test]
    fn test_period_days() {
        let date = date_at(2023, 2, 28);
        let next_date = SitePaymentPeriod::Daily.next_date(date);
        assert_eq!(next_date, date_at(2023, 3, 1));

        let next_date = SitePaymentPeriod::Daily.next_date(next_date);
        assert_eq!(next_date, date_at(2023, 3, 2));
    }

    #[test]
    fn test_period_months() {
        // Non-leap year
        let date = date_at(2023, 1, 30);
        let next_date = SitePaymentPeriod::Monthly.next_date(date);
        assert_eq!(next_date, date_at(2023, 2, 28));

        // Leap year
        let date = date_at(2024, 1, 31);
        let next_date = SitePaymentPeriod::Monthly.next_date(date);
        assert_eq!(next_date, date_at(2024, 2, 29));

        // Year boundary
        let date = date_at(2023, 12, 15);
        let next_date = SitePaymentPeriod::Monthly.next_date(date);
        assert_eq!(next_date, date_at(2024, 1, 15));
    }

    #[test]
    fn test_period_years() {
        let date = date_at(2023, 10, 31);
        let next_date = SitePaymentPeriod::Yearly.next_date(date);
        assert_eq!(next_date, date_at(2024, 10, 31));

        // Leap year
        let date = date_at(2024, 2, 29);
        let next_date = SitePaymentPeriod::Yearly.next_date(date);
        assert_eq!(next_date, date_at(2025, 2, 28));
    }
}
