use crate::models::*;
use chrono::{NaiveDate, Datelike};
use std::collections::HashMap;

// Australian tax brackets for 2024-2025 (financial year) - Stage 3 Tax Cuts
const TAX_BRACKETS_2024: &[(f64, f64)] = &[
    (0.0, 0.0),        // $0 - $18,200: 0%
    (18200.0, 0.16),   // $18,201 - $45,000: 16% (reduced from 19%)
    (45000.0, 0.30),   // $45,001 - $135,000: 30% (reduced from 32.5%, expanded bracket)
    (135000.0, 0.37),  // $135,001 - $190,000: 37% (threshold increased from $120k)
    (190000.0, 0.45),  // $190,001+: 45% (threshold increased from $180k)
];

// Superannuation guarantee rates by year
const SUPER_RATES: &[(i32, f64)] = &[
    (2020, 9.5),
    (2021, 10.0),
    (2022, 10.5),
    (2023, 11.0),
    (2024, 11.0),
    (2025, 11.5),
    (2026, 12.0),
];

// Australian market growth assumptions by industry and role level
const MARKET_GROWTH_RATES: &[(SeniorityLevel, f64)] = &[
    (SeniorityLevel::Entry, 0.04),    // 4% annual growth
    (SeniorityLevel::Junior, 0.05),   // 5% annual growth
    (SeniorityLevel::Mid, 0.06),      // 6% annual growth
    (SeniorityLevel::Senior, 0.07),   // 7% annual growth
    (SeniorityLevel::Lead, 0.08),     // 8% annual growth
    (SeniorityLevel::Manager, 0.08),  // 8% annual growth
    (SeniorityLevel::Director, 0.09), // 9% annual growth
    (SeniorityLevel::Executive, 0.10),// 10% annual growth
];

pub fn calculate_earnings_analysis(
    positions: &[Position],
    profile: &Option<UserProfile>,
) -> EarningsAnalysis {
    let mut earnings_over_time = Vec::new();
    let hours_vs_earnings = Vec::new();
    let super_trajectory = Vec::new();
    let mut insights = Vec::new();

    // Calculate current compensation
    let current_position = positions.first();
    let (current_total, current_hourly) = if let Some(pos) = current_position {
        // Get latest compensation for current position
        calculate_position_earnings(pos, profile)
    } else {
        (0.0, 0.0)
    };

    // Calculate earnings history
    let mut _total_career_earnings = 0.0;
    let mut _years_experience = 0.0;

    for position in positions {
        let (annual_earnings, hourly_rate) = calculate_position_earnings(position, profile);
        _total_career_earnings += annual_earnings;
        
        // Calculate tenure
        let end_date = position.end_date.unwrap_or_else(|| NaiveDate::from_ymd_opt(2024, 12, 31).unwrap());
        let tenure_days = (end_date - position.start_date).num_days();
        let tenure_years = tenure_days as f64 / 365.25;
        _years_experience += tenure_years;

        // Add to earnings timeline
        earnings_over_time.push(EarningsSnapshot {
            date: position.start_date,
            base_annual: position.base_salary_estimate(),
            actual_annual: annual_earnings,
            total_with_super: annual_earnings * 1.11, // Approximate with super
            effective_hourly_rate: hourly_rate,
        });
    }

    // Generate insights
    if let Some(profile) = profile {
        // Overtime analysis
        if has_overtime_heavy_earnings(positions) {
            insights.push(EarningsInsight {
                category: InsightCategory::OvertimeHeavy,
                title: "Overtime-Heavy Compensation Detected".to_string(),
                description: "Your earnings are significantly boosted by overtime. Your base rate may appear below market, but actual earnings place you higher.".to_string(),
                confidence_level: 0.85,
                data_points: vec![
                    format!("Effective hourly rate: ${:.2}/hr", current_hourly),
                    "Consider roles with better base rates if overtime burnout is a concern".to_string(),
                ],
            });
        }

        // Market comparison
        let percentile = calculate_income_percentile(current_total, &profile.industry, &profile.state);
        if percentile < 25.0 {
            insights.push(EarningsInsight {
                category: InsightCategory::Underpaid,
                title: "Earnings Below Market Median".to_string(),
                description: format!("You're in the {:.0}th percentile for your industry and location. Consider negotiating or exploring market opportunities.", percentile),
                confidence_level: 0.75,
                data_points: vec![
                    format!("Current total: ${:.0}", current_total),
                    format!("Industry median: ${:.0}", calculate_industry_median(&profile.industry)),
                ],
            });
        } else if percentile > 75.0 {
            insights.push(EarningsInsight {
                category: InsightCategory::Overpaid,
                title: "Earnings Above Market".to_string(),
                description: format!("You're in the {:.0}th percentile for your industry and location.", percentile),
                confidence_level: 0.75,
                data_points: vec![
                    format!("Current total: ${:.0}", current_total),
                    "You're well compensated compared to peers".to_string(),
                ],
            });
        }
    }

    EarningsAnalysis {
        current_total_compensation: current_total,
        current_effective_hourly_rate: current_hourly,
        income_percentile: calculate_income_percentile(current_total, 
            &profile.as_ref().map(|p| &p.industry).unwrap_or(&"Unknown".to_string()),
            &profile.as_ref().map(|p| &p.state).unwrap_or(&AustralianState::NSW)),
        loyalty_tax_annual: 0.0, // Calculated separately
        loyalty_tax_cumulative: 0.0, // Calculated separately
        earnings_over_time,
        hours_vs_earnings,
        super_trajectory,
        insights,
    }
}

pub fn calculate_loyalty_tax(positions: &[Position]) -> LoyaltyTaxAnalysis {
    let mut tenure_blocks = Vec::new();
    let annual_loyalty_tax = Vec::new();
    let mut cumulative_tax = 0.0;

    // Group positions by employer
    let mut employer_groups: HashMap<String, Vec<&Position>> = HashMap::new();
    for position in positions {
        employer_groups.entry(position.employer_name.clone())
            .or_insert_with(Vec::new)
            .push(position);
    }

    for (employer, pos_list) in employer_groups {
        // Sort by date
        let mut sorted_positions = pos_list.clone();
        sorted_positions.sort_by_key(|p| p.start_date);

        let start_date = sorted_positions.first().unwrap().start_date;
        let end_date = sorted_positions.last().unwrap().end_date
            .unwrap_or_else(|| NaiveDate::from_ymd_opt(2024, 12, 31).unwrap());
        
        let tenure_years = (end_date - start_date).num_days() as f64 / 365.25;

        if tenure_years > 2.0 { // Only calculate for tenures > 2 years
            // Calculate actual progression
            let first_salary = sorted_positions.first().unwrap().base_salary_estimate();
            let last_salary = sorted_positions.last().unwrap().base_salary_estimate();
            let actual_progression = if first_salary > 0.0 {
                ((last_salary - first_salary) / first_salary) / tenure_years
            } else {
                0.0
            };

            // Expected market progression
            let seniority = sorted_positions.last().unwrap().seniority_level.clone();
            let market_expected = MARKET_GROWTH_RATES
                .iter()
                .find(|(level, _)| std::mem::discriminant(level) == std::mem::discriminant(&seniority))
                .map(|(_, rate)| *rate)
                .unwrap_or(0.05);

            // Calculate loyalty tax impact
            let loyalty_tax_rate = market_expected - actual_progression;
            let loyalty_tax_impact = if loyalty_tax_rate > 0.0 {
                last_salary * loyalty_tax_rate * tenure_years
            } else {
                0.0
            };

            tenure_blocks.push(TenureBlock {
                employer_name: employer.clone(),
                start_date,
                end_date: Some(end_date),
                years_of_service: tenure_years,
                actual_progression: actual_progression * 100.0,
                market_expected_progression: market_expected * 100.0,
                loyalty_tax_impact,
            });

            cumulative_tax += loyalty_tax_impact;
        }
    }

    let confidence_level = if tenure_blocks.is_empty() { 0.0 } else { 0.75 };

    LoyaltyTaxAnalysis {
        tenure_blocks,
        market_comparison: MarketComparison {
            industry_average_growth: 0.06,
            role_level_growth: 0.07,
            cpi_adjusted_growth: 0.03,
        },
        annual_loyalty_tax,
        cumulative_loyalty_tax: cumulative_tax,
        confidence_level,
    }
}

pub fn generate_resume_export(
    positions: &[Position],
    profile: &Option<UserProfile>,
) -> ResumeExport {
    let profile_summary = if let Some(p) = profile {
        let age = NaiveDate::from_ymd_opt(2024, 12, 31).unwrap()
            .year() - p.date_of_birth.year();
        
        let experience_years = calculate_total_experience(positions);
        let current_seniority = positions.first()
            .map(|p| p.seniority_level.clone())
            .unwrap_or(SeniorityLevel::Entry);

        ProfileSummary {
            name: format!("{} {}", p.first_name, p.last_name),
            age,
            location: format!("{:?}", p.state),
            industry: p.industry.clone(),
            experience_years,
            seniority_level: current_seniority,
        }
    } else {
        ProfileSummary {
            name: "Unknown".to_string(),
            age: 0,
            location: "Unknown".to_string(),
            industry: "Unknown".to_string(),
            experience_years: 0.0,
            seniority_level: SeniorityLevel::Entry,
        }
    };

    let career_timeline: Vec<ResumePosition> = positions.iter().map(|pos| {
        let duration = if let Some(end) = pos.end_date {
            format_duration(pos.start_date, end)
        } else {
            format!("{} - Present", pos.start_date.format("%b %Y"))
        };

        ResumePosition {
            employer: pos.employer_name.clone(),
            title: pos.job_title.clone(),
            duration,
            responsibilities: pos.core_responsibilities.lines()
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            achievements: pos.achievements.clone(),
            skills_used: pos.tools_systems_skills.clone(),
        }
    }).collect();

    let all_achievements: Vec<String> = positions.iter()
        .flat_map(|p| p.achievements.clone())
        .collect();

    let all_skills: Vec<String> = positions.iter()
        .flat_map(|p| p.tools_systems_skills.clone())
        .collect();

    let compensation_summary = calculate_compensation_summary(positions);

    ResumeExport {
        profile_summary,
        career_timeline,
        achievements: all_achievements,
        skills_and_tools: all_skills,
        compensation_summary,
        target_preferences: profile.as_ref()
            .map(|p| p.career_preferences.clone())
            .unwrap_or_else(|| CareerPreferences {
                employment_type_preference: EmploymentType::Permanent,
                fifo_tolerance: FIFOTolerance::None,
                travel_tolerance: TravelTolerance::None,
                overtime_appetite: OvertimeAppetite::Moderate,
                privacy_acknowledged: false,
                disclaimer_acknowledged: false,
            }),
    }
}

// Helper functions
fn calculate_position_earnings(
    position: &Position,
    profile: &Option<UserProfile>,
) -> (f64, f64) {
    // This would normally fetch actual compensation records
    // For now, estimate based on position data
    let base_annual = position.base_salary_estimate();
    
    // Estimate overtime impact based on role and industry
    let overtime_multiplier = estimate_overtime_multiplier(position, profile);
    let actual_annual = base_annual * overtime_multiplier;
    
    // Calculate effective hourly rate (assuming 2080 hours/year for full-time)
    let annual_hours = estimate_annual_hours(position);
    let effective_hourly = if annual_hours > 0.0 {
        actual_annual / annual_hours
    } else {
        0.0
    };

    (actual_annual, effective_hourly)
}

fn estimate_overtime_multiplier(
    position: &Position,
    profile: &Option<UserProfile>,
) -> f64 {
    // Base multiplier varies by role and industry
    let base_multiplier = match position.seniority_level {
        SeniorityLevel::Entry => 1.05,
        SeniorityLevel::Junior => 1.10,
        SeniorityLevel::Mid => 1.15,
        SeniorityLevel::Senior => 1.20,
        SeniorityLevel::Lead => 1.25,
        SeniorityLevel::Manager => 1.10,
        SeniorityLevel::Director => 1.05,
        SeniorityLevel::Executive => 1.05,
    };

    // Adjust for industry (overtime-heavy industries)
    let industry_adjustment = if let Some(profile) = profile {
        match profile.industry.to_lowercase().as_str() {
            s if s.contains("mining") => 1.30,
            s if s.contains("construction") => 1.25,
            s if s.contains("engineering") => 1.20,
            s if s.contains("it") || s.contains("technology") => 1.15,
            _ => 1.0,
        }
    } else {
        1.0
    };

    // Adjust for personal overtime appetite
    let personal_adjustment = if let Some(profile) = profile {
        match profile.career_preferences.overtime_appetite {
            OvertimeAppetite::None => 0.95,
            OvertimeAppetite::Minimal => 1.0,
            OvertimeAppetite::Moderate => 1.1,
            OvertimeAppetite::High => 1.25,
            OvertimeAppetite::Extreme => 1.4,
        }
    } else {
        1.0
    };

    base_multiplier * industry_adjustment * personal_adjustment
}

fn estimate_annual_hours(position: &Position) -> f64 {
    // Standard full-time hours in Australia: 38 hours/week
    let standard_weekly = 38.0;
    let weeks_per_year = 52.0;
    
    // Adjust for employment type
    let hours_multiplier = match position.employment_type {
        EmploymentType::Permanent => 1.0,
        EmploymentType::Contract => 1.1, // Often work more hours
        EmploymentType::Casual => 0.8,   // Variable hours
    };

    standard_weekly * weeks_per_year * hours_multiplier
}

fn has_overtime_heavy_earnings(positions: &[Position]) -> bool {
    // Check if actual earnings significantly exceed base estimates
    for position in positions {
        let _base = position.base_salary_estimate();
        let overtime_mult = estimate_overtime_multiplier(position, &None);
        if overtime_mult > 1.2 {
            return true;
        }
    }
    false
}

fn calculate_income_percentile(
    income: f64,
    industry: &str,
    _state: &AustralianState,
) -> f64 {
    // Simplified percentile calculation
    // In production, this would use actual ABS data
    let industry_median = calculate_industry_median(industry);
    
    if income <= industry_median * 0.75 {
        25.0
    } else if income <= industry_median {
        50.0
    } else if income <= industry_median * 1.25 {
        75.0
    } else {
        90.0
    }
}

fn calculate_industry_median(industry: &str) -> f64 {
    // Simplified industry median salaries (Australia, 2024)
    match industry.to_lowercase().as_str() {
        s if s.contains("mining") => 125000.0,
        s if s.contains("it") || s.contains("technology") => 110000.0,
        s if s.contains("engineering") => 105000.0,
        s if s.contains("construction") => 95000.0,
        s if s.contains("healthcare") => 85000.0,
        s if s.contains("education") => 80000.0,
        s if s.contains("finance") => 100000.0,
        _ => 90000.0,
    }
}

fn calculate_total_experience(positions: &[Position]) -> f64 {
    let mut total_days = 0;
    for position in positions {
        let end_date = position.end_date.unwrap_or_else(|| NaiveDate::from_ymd_opt(2024, 12, 31).unwrap());
        total_days += (end_date - position.start_date).num_days();
    }
    total_days as f64 / 365.25
}

fn calculate_compensation_summary(positions: &[Position]) -> CompensationSummary {
    if positions.is_empty() {
        return CompensationSummary {
            current_base: 0.0,
            current_total: 0.0,
            career_earnings_total: 0.0,
            average_annual_increase: 0.0,
        };
    }

    let current_base = positions.first().map(|p| p.base_salary_estimate()).unwrap_or(0.0);
    let current_total = current_base * estimate_overtime_multiplier(positions.first().unwrap(), &None);
    
    let career_total: f64 = positions.iter()
        .map(|p| p.base_salary_estimate() * estimate_overtime_multiplier(p, &None))
        .sum();

    // Calculate average annual increase
    let avg_increase = if positions.len() > 1 {
        let first_salary = positions.last().unwrap().base_salary_estimate();
        let last_salary = positions.first().unwrap().base_salary_estimate();
        let years = calculate_total_experience(positions);
        if years > 0.0 && first_salary > 0.0 {
            ((last_salary - first_salary) / first_salary) / years * 100.0
        } else {
            0.0
        }
    } else {
        0.0
    };

    CompensationSummary {
        current_base,
        current_total,
        career_earnings_total: career_total,
        average_annual_increase: avg_increase,
    }
}

fn format_duration(start: NaiveDate, end: NaiveDate) -> String {
    let months = (end.year() - start.year()) * 12 + (end.month0() as i32 - start.month0() as i32);
    let years = months / 12;
    let remaining_months = months % 12;
    
    if years > 0 {
        if remaining_months > 0 {
            format!("{}y {}m", years, remaining_months)
        } else {
            format!("{}y", years)
        }
    } else {
        format!("{}m", remaining_months)
    }
}

// Extension trait for Position
trait PositionExt {
    fn base_salary_estimate(&self) -> f64;
}

impl PositionExt for Position {
    fn base_salary_estimate(&self) -> f64 {
        // Estimate base salary based on role, industry, and seniority
        let base = match self.seniority_level {
            SeniorityLevel::Entry => 60000.0,
            SeniorityLevel::Junior => 75000.0,
            SeniorityLevel::Mid => 95000.0,
            SeniorityLevel::Senior => 120000.0,
            SeniorityLevel::Lead => 140000.0,
            SeniorityLevel::Manager => 130000.0,
            SeniorityLevel::Director => 180000.0,
            SeniorityLevel::Executive => 250000.0,
        };

        // Adjust for employment type
        let employment_adjustment = match self.employment_type {
            EmploymentType::Permanent => 1.0,
            EmploymentType::Contract => 1.2, // 20% premium for contract
            EmploymentType::Casual => 1.25, // 25% loading for casual
        };

        base * employment_adjustment
    }
}
