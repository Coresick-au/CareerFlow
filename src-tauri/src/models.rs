use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, NaiveDate};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: Option<i64>,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: NaiveDate,
    pub state: AustralianState,
    pub industry: String,
    pub highest_qualification: Qualification,
    pub career_preferences: CareerPreferences,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CareerPreferences {
    pub employment_type_preference: EmploymentType,
    pub fifo_tolerance: FIFOTolerance,
    pub travel_tolerance: TravelTolerance,
    pub overtime_appetite: OvertimeAppetite,
    pub privacy_acknowledged: bool,
    pub disclaimer_acknowledged: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub id: Option<i64>,
    pub employer_name: String,
    pub job_title: String,
    pub employment_type: EmploymentType,
    pub location: String,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub seniority_level: SeniorityLevel,
    pub core_responsibilities: String,
    pub tools_systems_skills: Vec<String>,
    pub achievements: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompensationRecord {
    pub id: Option<i64>,
    pub position_id: i64,
    pub entry_type: CompensationEntryType,
    pub pay_type: PayType,
    pub base_rate: f64, // Annual salary OR hourly rate
    pub standard_weekly_hours: f64,
    pub overtime: OvertimeDetails,
    pub allowances: Vec<Allowance>,
    pub bonuses: Vec<Bonus>,
    pub super_contributions: SuperDetails,
    pub payslip_frequency: Option<PayslipFrequency>,
    pub effective_date: NaiveDate,
    pub confidence_score: f64, // 0-100 for fuzzy entries
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OvertimeDetails {
    pub frequency: OvertimeFrequency,
    pub rate_multiplier: f64, // 1.5x, 2.0x, or mixed
    pub average_hours_per_week: f64,
    pub annual_hours: Option<f64>, // For precise annual calculation
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Allowance {
    pub name: String,
    pub amount: f64,
    pub frequency: AllowanceFrequency,
    pub taxable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bonus {
    pub name: String,
    pub amount: f64,
    pub date_awarded: NaiveDate,
    pub taxable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuperDetails {
    pub contribution_rate: f64, // Percentage
    pub additional_contributions: f64, // Dollar amount
    pub salary_sacrifice: f64, // Dollar amount
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarningsAnalysis {
    pub current_total_compensation: f64,
    pub current_effective_hourly_rate: f64,
    pub income_percentile: f64,
    pub loyalty_tax_annual: f64,
    pub loyalty_tax_cumulative: f64,
    pub earnings_over_time: Vec<EarningsSnapshot>,
    pub hours_vs_earnings: Vec<HoursEarningsPoint>,
    pub super_trajectory: Vec<SuperSnapshot>,
    pub insights: Vec<EarningsInsight>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarningsSnapshot {
    pub date: NaiveDate,
    pub base_annual: f64,
    pub actual_annual: f64,
    pub total_with_super: f64,
    pub effective_hourly_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoursEarningsPoint {
    pub year: i32,
    pub total_hours_worked: f64,
    pub total_earnings: f64,
    pub overtime_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuperSnapshot {
    pub financial_year: String,
    pub employer_contributions: f64,
    pub personal_contributions: f64,
    pub total_super_balance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EarningsInsight {
    pub category: InsightCategory,
    pub title: String,
    pub description: String,
    pub confidence_level: f64,
    pub data_points: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoyaltyTaxAnalysis {
    pub tenure_blocks: Vec<TenureBlock>,
    pub market_comparison: MarketComparison,
    pub annual_loyalty_tax: Vec<YearlyLoyaltyTax>,
    pub cumulative_loyalty_tax: f64,
    pub confidence_level: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenureBlock {
    pub employer_name: String,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub years_of_service: f64,
    pub actual_progression: f64, // Percentage increase
    pub market_expected_progression: f64,
    pub loyalty_tax_impact: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketComparison {
    pub industry_average_growth: f64,
    pub role_level_growth: f64,
    pub cpi_adjusted_growth: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YearlyLoyaltyTax {
    pub year: i32,
    pub loyalty_tax_amount: f64,
    pub missed_opportunities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResumeExport {
    pub profile_summary: ProfileSummary,
    pub career_timeline: Vec<ResumePosition>,
    pub achievements: Vec<String>,
    pub skills_and_tools: Vec<String>,
    pub compensation_summary: CompensationSummary,
    pub target_preferences: CareerPreferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileSummary {
    pub name: String,
    pub age: i32,
    pub location: String,
    pub industry: String,
    pub experience_years: f64,
    pub seniority_level: SeniorityLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResumePosition {
    pub employer: String,
    pub title: String,
    pub duration: String,
    pub responsibilities: Vec<String>,
    pub achievements: Vec<String>,
    pub skills_used: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompensationSummary {
    pub current_base: f64,
    pub current_total: f64,
    pub career_earnings_total: f64,
    pub average_annual_increase: f64,
}

// Enums
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AustralianState {
    NSW, VIC, QLD, WA, SA, TAS, ACT, NT,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Qualification {
    HighSchool,
    Certificate,
    Diploma,
    Bachelor,
    GraduateCertificate,
    GraduateDiploma,
    Masters,
    PhD,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmploymentType {
    Permanent,
    Contract,
    Casual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FIFOTolerance {
    None,
    Limited,
    Regular,
    Extensive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TravelTolerance {
    None,
    Local,
    Regional,
    National,
    International,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OvertimeAppetite {
    None,
    Minimal,
    Moderate,
    High,
    Extreme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SeniorityLevel {
    Entry,
    Junior,
    Mid,
    Senior,
    Lead,
    Manager,
    Director,
    Executive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompensationEntryType {
    Fuzzy,
    Exact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PayType {
    Salary,
    Hourly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OvertimeFrequency {
    None,
    Occasional,
    Frequent,
    Extreme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AllowanceFrequency {
    Weekly,
    Fortnightly,
    Monthly,
    Annually,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PayslipFrequency {
    Weekly,
    Fortnightly,
    Monthly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InsightCategory {
    Underpaid,
    FairlyPaid,
    Overpaid,
    OvertimeHeavy,
    LoyaltyTax,
    MarketOpportunity,
    SkillsGap,
}
