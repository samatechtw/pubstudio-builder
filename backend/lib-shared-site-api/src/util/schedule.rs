use std::{fmt::Display, future::Future, time::Duration};

use chrono::{DateTime, NaiveDate, Timelike, Utc};
use tokio::time::{interval_at, Instant, Interval, MissedTickBehavior};
use tracing::error;

const DAILY_CHECK_PERIOD: Duration = Duration::from_secs(30);

fn skipping_interval(period: Duration) -> Interval {
    let mut interval = interval_at(Instant::now() + period, period);
    interval.set_missed_tick_behavior(MissedTickBehavior::Skip);
    interval
}

async fn run_isolated<N, F, Fut>(name: &N, job: &F)
where
    N: Display,
    F: Fn() -> Fut,
    Fut: Future<Output = ()> + Send + 'static,
{
    if let Err(e) = tokio::spawn(job()).await {
        error!(err = e.to_string(), "Job {} panicked", name);
    }
}

pub fn spawn_periodic<N, F, Fut>(name: N, period: Duration, job: F)
where
    N: Display + Send + Sync + 'static,
    F: Fn() -> Fut + Send + Sync + 'static,
    Fut: Future<Output = ()> + Send + 'static,
{
    let mut interval = skipping_interval(period);
    tokio::spawn(async move {
        loop {
            interval.tick().await;
            run_isolated(&name, &job).await;
        }
    });
}

fn is_due(now: DateTime<Utc>, hour: u32, last_run: Option<NaiveDate>) -> bool {
    now.hour() == hour && now.minute() == 0 && last_run != Some(now.date_naive())
}

// A process starting inside the target minute leaves that run to the process it replaced, so a
// restart can't repeat a job like ECPayReAuth that consumes a retry on each run.
fn last_run_at_startup(now: DateTime<Utc>, hour: u32) -> Option<NaiveDate> {
    is_due(now, hour, None).then(|| now.date_naive())
}

/// Runs `job` once per UTC day, during the first minute of `hour`.
pub fn spawn_daily<N, F, Fut>(name: N, hour: u32, job: F)
where
    N: Display + Send + Sync + 'static,
    F: Fn() -> Fut + Send + Sync + 'static,
    Fut: Future<Output = ()> + Send + 'static,
{
    let mut interval = skipping_interval(DAILY_CHECK_PERIOD);
    let mut last_run = last_run_at_startup(Utc::now(), hour);
    tokio::spawn(async move {
        loop {
            interval.tick().await;
            let now = Utc::now();
            if is_due(now, hour, last_run) {
                last_run = Some(now.date_naive());
                run_isolated(&name, &job).await;
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    };
    use tokio::time::sleep;

    const NAME: &str = "TestJob";
    const PERIOD: Duration = Duration::from_secs(10);

    fn at(timestamp: &str) -> DateTime<Utc> {
        timestamp.parse().unwrap()
    }

    fn date(value: &str) -> Option<NaiveDate> {
        Some(value.parse().unwrap())
    }

    #[tokio::test(start_paused = true)]
    async fn a_periodic_job_runs_once_per_period_starting_after_one_period() {
        let runs = Arc::new(AtomicUsize::new(0));
        let job_runs = runs.clone();
        spawn_periodic(NAME, PERIOD, move || {
            let job_runs = job_runs.clone();
            async move {
                job_runs.fetch_add(1, Ordering::SeqCst);
            }
        });

        sleep(Duration::from_secs(5)).await;
        assert_eq!(runs.load(Ordering::SeqCst), 0);
        sleep(Duration::from_secs(30)).await;
        assert_eq!(runs.load(Ordering::SeqCst), 3);
    }

    #[tokio::test(start_paused = true)]
    async fn a_slow_job_does_not_overlap_and_its_missed_ticks_are_skipped() {
        let starts = Arc::new(AtomicUsize::new(0));
        let active = Arc::new(AtomicUsize::new(0));
        let peak_active = Arc::new(AtomicUsize::new(0));
        let (job_starts, job_active, job_peak) =
            (starts.clone(), active.clone(), peak_active.clone());
        spawn_periodic(NAME, PERIOD, move || {
            let (starts, active, peak) = (job_starts.clone(), job_active.clone(), job_peak.clone());
            async move {
                starts.fetch_add(1, Ordering::SeqCst);
                let now_active = active.fetch_add(1, Ordering::SeqCst) + 1;
                peak.fetch_max(now_active, Ordering::SeqCst);
                sleep(Duration::from_secs(25)).await;
                active.fetch_sub(1, Ordering::SeqCst);
            }
        });

        // Starts at 10s, 40s and 70s. Without skipping, the ticks missed during each run would
        // start it again immediately.
        sleep(Duration::from_secs(75)).await;
        assert_eq!(starts.load(Ordering::SeqCst), 3);
        assert_eq!(peak_active.load(Ordering::SeqCst), 1);
    }

    #[tokio::test(start_paused = true)]
    async fn a_job_that_panics_still_runs_on_the_next_tick() {
        let runs = Arc::new(AtomicUsize::new(0));
        let job_runs = runs.clone();
        spawn_periodic(NAME, PERIOD, move || {
            let job_runs = job_runs.clone();
            async move {
                if job_runs.fetch_add(1, Ordering::SeqCst) == 0 {
                    panic!("expected test panic");
                }
            }
        });

        sleep(Duration::from_secs(25)).await;
        assert_eq!(runs.load(Ordering::SeqCst), 2);
    }

    #[test]
    fn is_due_only_inside_the_target_minute() {
        assert!(is_due(at("2026-11-09T01:00:00Z"), 1, None));
        assert!(is_due(at("2026-11-09T01:00:59Z"), 1, None));
        assert!(!is_due(at("2026-11-09T00:59:59Z"), 1, None));
        assert!(!is_due(at("2026-11-09T01:01:00Z"), 1, None));
        assert!(!is_due(at("2026-11-09T02:00:00Z"), 1, None));
    }

    #[test]
    fn is_due_once_per_utc_date() {
        let ran_today = date("2026-11-09");
        assert!(!is_due(at("2026-11-09T01:00:30Z"), 1, ran_today));
        assert!(is_due(at("2026-11-10T01:00:00Z"), 1, ran_today));
    }

    #[test]
    fn a_backward_step_across_midnight_does_not_rerun() {
        let hour = 0;
        let first_tick = at("2026-11-09T00:00:01Z");
        assert!(is_due(first_tick, hour, None));
        let last_run = Some(first_tick.date_naive());

        assert!(!is_due(at("2026-11-08T23:59:58Z"), hour, last_run));
        assert!(!is_due(at("2026-11-09T00:00:00Z"), hour, last_run));
    }

    #[test]
    fn a_process_started_inside_the_target_minute_skips_that_run() {
        let started = at("2026-11-09T01:00:10Z");
        let last_run = last_run_at_startup(started, 1);
        assert!(!is_due(at("2026-11-09T01:00:40Z"), 1, last_run));
        assert!(is_due(at("2026-11-10T01:00:00Z"), 1, last_run));
    }

    #[test]
    fn a_process_started_before_the_target_minute_still_runs() {
        let last_run = last_run_at_startup(at("2026-11-09T00:59:50Z"), 1);
        assert!(is_due(at("2026-11-09T01:00:10Z"), 1, last_run));
    }
}
