// TypeScript type definitions for CareerFlow
// These mirror the Rust models but are defined independently

// Enums
export enum AustralianState {
  NSW = 'NSW',
  VIC = 'VIC',
  QLD = 'QLD',
  WA = 'WA',
  SA = 'SA',
  TAS = 'TAS',
  ACT = 'ACT',
  NT = 'NT',
}

export enum Qualification {
  HighSchool = 'HighSchool',
  Certificate = 'Certificate',
  Diploma = 'Diploma',
  Bachelor = 'Bachelor',
  GraduateCertificate = 'GraduateCertificate',
  GraduateDiploma = 'GraduateDiploma',
  Masters = 'Masters',
  PhD = 'PhD',
  Other = 'Other',
}

export enum EmploymentType {
  Permanent = 'Permanent',
  Contract = 'Contract',
  Casual = 'Casual',
}

export enum FIFOTolerance {
  None = 'None',
  Limited = 'Limited',
  Regular = 'Regular',
  Extensive = 'Extensive',
}

export enum TravelTolerance {
  None = 'None',
  Local = 'Local',
  Regional = 'Regional',
  National = 'National',
  International = 'International',
}

export enum OvertimeAppetite {
  None = 'None',
  Minimal = 'Minimal',
  Moderate = 'Moderate',
  High = 'High',
  Extreme = 'Extreme',
}

export enum SeniorityLevel {
  Entry = 'Entry',
  Junior = 'Junior',
  Mid = 'Mid',
  Senior = 'Senior',
  Lead = 'Lead',
  Manager = 'Manager',
  Director = 'Director',
  Executive = 'Executive',
}

export enum CompensationEntryType {
  Fuzzy = 'Fuzzy',
  Exact = 'Exact',
  YearlySummary = 'YearlySummary',
}

export enum PayType {
  Salary = 'Salary',
  Hourly = 'Hourly',
  Annual = 'Annual',
}

export enum OvertimeFrequency {
  None = 'None',
  Occasional = 'Occasional',
  Frequent = 'Frequent',
  Extreme = 'Extreme',
}

export enum AllowanceFrequency {
  Weekly = 'Weekly',
  Fortnightly = 'Fortnightly',
  Monthly = 'Monthly',
  Annually = 'Annually',
}

export enum PayslipFrequency {
  Weekly = 'Weekly',
  Fortnightly = 'Fortnightly',
  Monthly = 'Monthly',
}

export enum InsightCategory {
  Underpaid = 'Underpaid',
  FairlyPaid = 'FairlyPaid',
  Overpaid = 'Overpaid',
  OvertimeHeavy = 'OvertimeHeavy',
  LoyaltyTax = 'LoyaltyTax',
  MarketOpportunity = 'MarketOpportunity',
  SkillsGap = 'SkillsGap',
}

// Core Types
export interface UserProfile {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  state: AustralianState;
  industry: string;
  highest_qualification: Qualification;
  career_preferences: CareerPreferences;
  standard_weekly_hours: number; // User-configurable, not hardcoded
  created_at: Date;
  updated_at: Date;
}

export interface CareerPreferences {
  employment_type_preference: EmploymentType;
  fifo_tolerance: FIFOTolerance;
  travel_tolerance: TravelTolerance;
  overtime_appetite: OvertimeAppetite;
  privacy_acknowledged: boolean;
  disclaimer_acknowledged: boolean;
}

export const DEFAULT_CAREER_PREFERENCES: CareerPreferences = {
  employment_type_preference: EmploymentType.Permanent,
  fifo_tolerance: FIFOTolerance.None,
  travel_tolerance: TravelTolerance.None,
  overtime_appetite: OvertimeAppetite.None,
  privacy_acknowledged: false,
  disclaimer_acknowledged: false,
};

export const DEFAULT_PROFILE: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
  first_name: '',
  last_name: '',
  date_of_birth: new Date(),
  state: AustralianState.NSW,
  industry: '',
  highest_qualification: Qualification.HighSchool,
  career_preferences: DEFAULT_CAREER_PREFERENCES,
  standard_weekly_hours: 38, // Australian full-time default
};

export interface Position {
  id?: number;
  employer_name: string;
  job_title: string;
  employment_type: EmploymentType;
  location: string;
  start_date: Date;
  end_date?: Date;
  seniority_level: SeniorityLevel;
  core_responsibilities: string;
  tools_systems_skills: string[];
  achievements: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CompensationRecord {
  id?: number;
  position_id: number;
  entry_type: CompensationEntryType;
  pay_type: PayType;
  base_rate: number;
  standard_weekly_hours: number;
  overtime: OvertimeDetails;
  allowances: Allowance[];
  bonuses: Bonus[];
  super_contributions: SuperDetails;
  tax_withheld?: number; // Annual tax withheld amount
  payslip_frequency?: PayslipFrequency;
  effective_date: Date;
  confidence_score: number;
  notes?: string;
  created_at: Date;
}

export interface OvertimeDetails {
  frequency: OvertimeFrequency;
  rate_multiplier: number;
  average_hours_per_week: number;
  annual_hours?: number;
}

export interface Allowance {
  name: string;
  amount: number;
  frequency: AllowanceFrequency;
  taxable: boolean;
}

export interface Bonus {
  name: string;
  amount: number;
  date_awarded: Date;
  taxable: boolean;
}

export interface SuperDetails {
  contribution_rate: number;
  additional_contributions: number;
  salary_sacrifice: number;
}

// Weekly/Payslip Entry for detailed tracking
export interface WeeklyCompensationEntry {
  id?: number;
  position_id?: number; // Optional - can be inferred from date overlap with positions
  financial_year: string; // e.g., "FY2024-25"
  week_ending: Date;
  gross_pay: number;
  tax_withheld: number;
  net_pay: number; // Calculated: gross - tax
  hours_ordinary: number;
  hours_overtime: number;
  overtime_rate_multiplier: number; // e.g., 1.5 or 2.0
  allowances: Allowance[];
  super_contributed: number;
  notes?: string;
  created_at: Date;
}

// Yearly ATO Summary Entry
export interface YearlyIncomeEntry {
  id?: number;
  position_id?: number;
  financial_year: string; // e.g., "FY2024-25"
  gross_income: number; // From payment summary
  tax_withheld: number;
  reportable_super: number;
  reportable_fringe_benefits?: number;
  allowances: Allowance[];
  source: 'ATO' | 'Manual'; // Where the data came from
  notes?: string;
  created_at: Date;
}

// Union type for income entries in the Career Ledger
export type IncomeEntry =
  | { type: 'weekly'; data: WeeklyCompensationEntry }
  | { type: 'yearly'; data: YearlyIncomeEntry }
  | { type: 'compensation'; data: CompensationRecord }
  | { type: 'position'; data: Position };

// Analysis Types
export interface EarningsAnalysis {
  current_total_compensation: number;
  current_effective_hourly_rate: number;
  current_weekly_hours: number;
  income_percentile: number;
  loyalty_tax_annual: number;
  loyalty_tax_cumulative: number;
  years_since_last_change: number;
  earnings_over_time: EarningsSnapshot[];
  hours_vs_earnings: HoursEarningsPoint[];
  super_trajectory: SuperSnapshot[];
  super_summary: SuperSnapshot;
  insights: EarningsInsight[];
}

export interface EarningsSnapshot {
  date: Date;
  base_annual: number;
  actual_annual: number;
  total_with_super: number;
  effective_hourly_rate: number;
  bonuses_annual: number;
  allowances_annual: number;
}

export interface HoursEarningsPoint {
  year: number;
  total_hours_worked: number;
  total_earnings: number;
  overtime_percentage: number;
}

export interface SuperSnapshot {
  financial_year: string;
  employer_contributions: number;
  personal_contributions: number;
  total_super_balance: number;
}

export interface EarningsInsight {
  category: InsightCategory;
  title: string;
  description: string;
  confidence_level: number;
  data_points: string[];
}

export interface LoyaltyTaxAnalysis {
  tenure_blocks: TenureBlock[];
  market_comparison: MarketComparison;
  annual_loyalty_tax: YearlyLoyaltyTax[];
  cumulative_loyalty_tax: number;
  confidence_level: number;
}

export interface TenureBlock {
  employer_name: string;
  start_date: Date;
  end_date?: Date;
  years_of_service: number;
  actual_progression: number;
  market_expected_progression: number;
  loyalty_tax_impact: number;
}

export interface MarketComparison {
  industry_average_growth: number;
  role_level_growth: number;
  cpi_adjusted_growth: number;
}

export interface YearlyLoyaltyTax {
  year: number;
  loyalty_tax_amount: number;
  missed_opportunities: string[];
}

// Resume Export Types
export interface ResumeExport {
  profile_summary: ProfileSummary;
  career_timeline: ResumePosition[];
  achievements: string[];
  skills_and_tools: string[];
  compensation_summary: CompensationSummary;
  target_preferences: CareerPreferences;
}

export interface ProfileSummary {
  name: string;
  age: number;
  location: string;
  industry: string;
  experience_years: number;
  seniority_level: SeniorityLevel;
}

export interface ResumePosition {
  employer: string;
  title: string;
  duration: string;
  responsibilities: string[];
  achievements: string[];
  skills_used: string[];
}

export interface CompensationSummary {
  current_base: number;
  current_total: number;
  career_earnings_total: number;
  average_annual_increase: number;
}
