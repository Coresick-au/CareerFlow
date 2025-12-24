// Mock Tauri API for web-only testing
// This simulates the Tauri backend responses

export interface UserProfile {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  state: string;
  industry: string;
  highest_qualification: string;
  career_preferences: {
    employment_type_preference: string;
    fifo_tolerance: string;
    travel_tolerance: string;
    overtime_appetite: string;
    privacy_acknowledged: boolean;
    disclaimer_acknowledged: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Position {
  id?: number;
  employer_name: string;
  job_title: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date?: string;
  seniority_level: string;
  core_responsibilities: string;
  tools_systems_skills: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export interface CompensationRecord {
  id?: number;
  position_id: number;
  entry_type: string;
  pay_type: string;
  base_rate: number;
  standard_weekly_hours: number;
  overtime: {
    frequency: string;
    rate_multiplier: number;
    average_hours_per_week: number;
    annual_hours?: number;
  };
  allowances: Array<{
    name: string;
    amount: number;
    frequency: string;
    taxable: boolean;
  }>;
  bonuses: Array<{
    name: string;
    amount: number;
    date_awarded: Date;
    taxable: boolean;
  }>;
  super_contributions: {
    contribution_rate: number;
    additional_contributions: number;
    salary_sacrifice: number;
  };
  payslip_frequency?: string;
  effective_date: Date;
  confidence_score: number;
  notes?: string;
  created_at: Date;
}

export interface EarningsAnalysis {
  current_total_compensation: number;
  current_effective_hourly_rate: number;
  income_percentile: number;
  loyalty_tax_annual: number;
  loyalty_tax_cumulative: number;
  earnings_over_time: Array<{
    date: Date;
    base_annual: number;
    actual_annual: number;
    total_with_super: number;
    effective_hourly_rate: number;
  }>;
  hours_vs_earnings: Array<{
    year: number;
    total_hours_worked: number;
    total_earnings: number;
    overtime_percentage: number;
  }>;
  super_trajectory: Array<{
    financial_year: string;
    employer_contributions: number;
    personal_contributions: number;
    total_super_balance: number;
  }>;
  insights: Array<{
    category: string;
    title: string;
    description: string;
    confidence_level: number;
    data_points: string[];
  }>;
}

// Mock data storage
let mockProfile: UserProfile | null = null;
let mockPositions: Position[] = [];
let mockCompensation: CompensationRecord[] = [];

// Mock Tauri invoke function
export async function invoke<T>(command: string, args?: any): Promise<T> {
  console.log(`Mock Tauri invoke: ${command}`, args);
  
  switch (command) {
    case 'get_user_profile':
      return mockProfile as T;
      
    case 'save_user_profile':
      mockProfile = { 
        ...args, 
        id: 1, 
        created_at: new Date(), 
        updated_at: new Date() 
      };
      return undefined as T;
      
    case 'get_positions':
      return mockPositions as T;
      
    case 'save_position':
      const newPosition = { ...args, id: Date.now(), created_at: new Date(), updated_at: new Date() };
      mockPositions.push(newPosition);
      return newPosition.id as T;
      
    case 'delete_position':
      mockPositions = mockPositions.filter(p => p.id !== args);
      return undefined as T;
      
    case 'get_compensation_records':
      return mockCompensation.filter(c => c.position_id === args) as T;
      
    case 'save_compensation_record':
      const newRecord = { ...args, id: Date.now(), created_at: new Date() };
      mockCompensation.push(newRecord);
      return newRecord.id as T;
      
    case 'calculate_earnings_analysis':
      // Return mock analysis data
      return {
        current_total_compensation: 120000,
        current_effective_hourly_rate: 65.0,
        income_percentile: 75,
        loyalty_tax_annual: 8000,
        loyalty_tax_cumulative: 24000,
        earnings_over_time: [
          {
            date: new Date('2020-01-01'),
            base_annual: 90000,
            actual_annual: 95000,
            total_with_super: 105450,
            effective_hourly_rate: 50.0
          },
          {
            date: new Date('2022-01-01'),
            base_annual: 100000,
            actual_annual: 108000,
            total_with_super: 119880,
            effective_hourly_rate: 56.84
          },
          {
            date: new Date('2024-01-01'),
            base_annual: 120000,
            actual_annual: 130000,
            total_with_super: 144300,
            effective_hourly_rate: 65.0
          }
        ],
        hours_vs_earnings: [
          { year: 2020, total_hours_worked: 1900, total_earnings: 95000, overtime_percentage: 5 },
          { year: 2021, total_hours_worked: 1950, total_earnings: 98000, overtime_percentage: 7 },
          { year: 2022, total_hours_worked: 2000, total_earnings: 108000, overtime_percentage: 10 },
          { year: 2023, total_hours_worked: 2050, total_earnings: 118000, overtime_percentage: 12 },
          { year: 2024, total_hours_worked: 2000, total_earnings: 130000, overtime_percentage: 8 }
        ],
        super_trajectory: [
          { financial_year: '2020-21', employer_contributions: 10260, personal_contributions: 5000, total_super_balance: 85000 },
          { financial_year: '2021-22', employer_contributions: 10710, personal_contributions: 5000, total_super_balance: 100710 },
          { financial_year: '2022-23', employer_contributions: 11880, personal_contributions: 5000, total_super_balance: 117590 },
          { financial_year: '2023-24', employer_contributions: 12980, personal_contributions: 5000, total_super_balance: 135570 }
        ],
        insights: [
          {
            category: 'LoyaltyTax',
            title: 'Potential $24,000 missed over 3 years',
            description: 'Your salary growth has been 3% below market average for your role and experience level.',
            confidence_level: 85,
            data_points: ['Market rate: $125,000', 'Current rate: $120,000', '3-year tenure']
          },
          {
            category: 'OvertimeHeavy',
            title: '10% of income from overtime',
            description: 'You\'re earning $13,000 annually from overtime. Consider negotiating a higher base salary.',
            confidence_level: 95,
            data_points: ['Base: $120,000', 'Overtime: $13,000', '200 hours overtime/year']
          }
        ]
      } as T;
      
    case 'calculate_loyalty_tax':
      return {
        tenure_blocks: [],
        market_comparison: {
          industry_average_growth: 0.06,
          role_level_growth: 0.07,
          cpi_adjusted_growth: 0.03
        },
        annual_loyalty_tax: [],
        cumulative_loyalty_tax: 24000,
        confidence_level: 0.85
      } as T;
      
    case 'generate_resume_export':
      return {
        profile_summary: {
          name: 'Test User',
          age: 35,
          location: 'Sydney, NSW',
          industry: 'Technology',
          experience_years: 5,
          seniority_level: 'Senior'
        },
        career_timeline: mockPositions.map(p => ({
          employer: p.employer_name,
          title: p.job_title,
          duration: '2 years',
          responsibilities: [p.core_responsibilities],
          achievements: p.achievements,
          skills_used: p.tools_systems_skills
        })),
        achievements: mockPositions.flatMap(p => p.achievements),
        skills_and_tools: mockPositions.flatMap(p => p.tools_systems_skills),
        compensation_summary: {
          current_base: 120000,
          current_total: 130000,
          career_earnings_total: 550000,
          average_annual_increase: 0.06
        },
        target_preferences: mockProfile?.career_preferences || {}
      } as T;
      
    case 'export_all_data':
      return {
        user_profile: mockProfile,
        positions: mockPositions,
        compensation_records: mockCompensation,
        export_date: new Date().toISOString(),
        version: '1.0.0'
      } as T;
      
    case 'import_all_data':
      const { user_profile, positions, compensation_records } = args;
      if (user_profile) mockProfile = user_profile;
      if (positions) mockPositions = positions;
      if (compensation_records) mockCompensation = compensation_records;
      return { success: true, imported: { 
        profile: !!user_profile, 
        positions: positions?.length || 0, 
        compensation: compensation_records?.length || 0 
      }} as T;
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
