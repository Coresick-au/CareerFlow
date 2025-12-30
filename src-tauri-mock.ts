// Mock Tauri API for web-only testing
// This simulates the Tauri backend responses

export interface UserProfile {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface Position {
  id?: number;
  employer_name: string;
  job_title: string;
  employment_type: string;
  location: string;
  start_date: Date;
  end_date?: Date;
  seniority_level: string;
  core_responsibilities: string;
  tools_systems_skills: string[];
  achievements: string[];
  created_at: Date;
  updated_at: Date;
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
  tax_withheld?: number; // Annual tax withheld amount
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

// Mock data storage - now supports multiple users
// Helper to get current user ID from window context
function getCurrentUserId(): string {
  return (typeof window !== 'undefined' && (window as any).__currentUserId) || 'default';
}

// Persist data helper
function saveToStorage() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('careerflow_profiles', JSON.stringify(mockProfiles));
  localStorage.setItem('careerflow_positions', JSON.stringify(mockPositions));
  localStorage.setItem('careerflow_compensation', JSON.stringify(mockCompensation));
  localStorage.setItem('careerflow_weekly', JSON.stringify(mockWeeklyEntries));
  localStorage.setItem('careerflow_yearly', JSON.stringify(mockYearlyEntries));
}

// Load data helper
function loadFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const profiles = localStorage.getItem('careerflow_profiles');
    const positions = localStorage.getItem('careerflow_positions');
    const compensation = localStorage.getItem('careerflow_compensation');
    const weekly = localStorage.getItem('careerflow_weekly');
    const yearly = localStorage.getItem('careerflow_yearly');

    if (profiles) mockProfiles = JSON.parse(profiles);
    if (positions) mockPositions = JSON.parse(positions);
    if (compensation) mockCompensation = JSON.parse(compensation);
    if (weekly) mockWeeklyEntries = JSON.parse(weekly);
    if (yearly) mockYearlyEntries = JSON.parse(yearly);
  } catch (e) {
    console.error('Failed to load mock data from storage', e);
  }
}

// Mock data storage - now supports multiple users
let mockProfiles: Record<string, any> = {};
let mockPositions: Record<string, any[]> = {};
let mockCompensation: Record<string, any[]> = {};
let mockWeeklyEntries: Record<string, any[]> = {};
let mockYearlyEntries: Record<string, any[]> = {};

// Load immediately if in browser
loadFromStorage();

// Helper to get user-specific data
function getUserData() {
  const userId = getCurrentUserId();
  return {
    profile: mockProfiles[userId] || null,
    positions: mockPositions[userId] || [],
    compensation: mockCompensation[userId] || [],
    weeklyEntries: mockWeeklyEntries[userId] || [],
    yearlyEntries: mockYearlyEntries[userId] || [],
  };
}

// Helper to set user-specific data
function setUserData(data: { profile?: any; positions?: any[]; compensation?: any[]; weeklyEntries?: any[]; yearlyEntries?: any[] }) {
  const userId = getCurrentUserId();
  if (data.profile !== undefined) mockProfiles[userId] = data.profile;
  if (data.positions !== undefined) mockPositions[userId] = data.positions;
  if (data.compensation !== undefined) mockCompensation[userId] = data.compensation;
  if (data.weeklyEntries !== undefined) mockWeeklyEntries[userId] = data.weeklyEntries;
  if (data.yearlyEntries !== undefined) mockYearlyEntries[userId] = data.yearlyEntries;
  saveToStorage();
}

// Sample data for testing
const sampleUserProfile: UserProfile = {
  id: 1,
  first_name: 'Alex',
  last_name: 'Chen',
  date_of_birth: new Date('1995-06-15'),
  state: 'NSW',
  industry: 'Information Technology',
  highest_qualification: 'Bachelor',
  career_preferences: {
    employment_type_preference: 'Permanent',
    fifo_tolerance: 'None',
    travel_tolerance: 'National',
    overtime_appetite: 'Moderate',
    privacy_acknowledged: true,
    disclaimer_acknowledged: true,
  },
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-12-01'),
};

const samplePositions: Position[] = [
  {
    id: 1,
    employer_name: 'TechStart Solutions',
    job_title: 'Graduate Software Developer',
    employment_type: 'Permanent',
    location: 'Sydney, NSW',
    start_date: new Date('2017-02-01'),
    end_date: new Date('2019-02-28'),
    seniority_level: 'Entry',
    core_responsibilities: 'Develop and maintain web applications using React and Node.js, participate in code reviews, write unit tests, and collaborate with senior developers on feature implementation.',
    tools_systems_skills: ['JavaScript', 'React', 'Node.js', 'Git', 'Jira', 'AWS'],
    achievements: [
      'Reduced application load time by 30% through optimization',
      'Implemented automated testing suite reducing bugs by 40%',
      'Completed company\'s graduate development program with distinction'
    ],
    created_at: new Date('2017-02-01'),
    updated_at: new Date('2019-02-28'),
  },
  {
    id: 2,
    employer_name: 'Digital Innovations Pty Ltd',
    job_title: 'Software Developer',
    employment_type: 'Permanent',
    location: 'Melbourne, VIC',
    start_date: new Date('2019-03-15'),
    end_date: new Date('2021-06-30'),
    seniority_level: 'Mid',
    core_responsibilities: 'Lead development of microservices, mentor junior developers, design system architecture, and work closely with product managers to deliver features.',
    tools_systems_skills: ['Python', 'Django', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
    achievements: [
      'Led migration from monolith to microservices architecture',
      'Improved system scalability to handle 10x traffic',
      'Mentored 3 junior developers who all received promotions'
    ],
    created_at: new Date('2019-03-15'),
    updated_at: new Date('2021-06-30'),
  },
  {
    id: 3,
    employer_name: 'Enterprise Systems Corp',
    job_title: 'Senior Software Engineer',
    employment_type: 'Permanent',
    location: 'Sydney, NSW',
    start_date: new Date('2021-07-01'),
    end_date: new Date('2023-12-31'),
    seniority_level: 'Senior',
    core_responsibilities: 'Architect and implement complex systems, lead technical decisions, conduct performance reviews, and represent the team in cross-functional meetings.',
    tools_systems_skills: ['Java', 'Spring Boot', 'Microservices', 'GraphQL', 'MongoDB', 'Elasticsearch'],
    achievements: [
      'Designed and implemented real-time data processing system handling 1M+ events/day',
      'Reduced infrastructure costs by 25% through optimization',
      'Promoted to tech lead role within 18 months'
    ],
    created_at: new Date('2021-07-01'),
    updated_at: new Date('2023-12-31'),
  },
  {
    id: 4,
    employer_name: 'CloudTech Australia',
    job_title: 'Senior Full Stack Developer',
    employment_type: 'Permanent',
    location: 'Sydney, NSW',
    start_date: new Date('2024-01-15'),
    end_date: undefined,
    seniority_level: 'Senior',
    core_responsibilities: 'Lead full-stack development initiatives, architect cloud-native solutions, and drive technical excellence across the engineering team.',
    tools_systems_skills: ['TypeScript', 'Next.js', 'AWS', 'Terraform', 'Serverless', 'DynamoDB'],
    achievements: [
      'Successfully launched new SaaS product serving 5000+ users',
      'Implemented CI/CD pipeline reducing deployment time by 60%',
      'Established coding standards and best practices adopted company-wide'
    ],
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-12-01'),
  },
];

const sampleCompensation: CompensationRecord[] = [
  {
    id: 1,
    position_id: 1,
    entry_type: 'Exact',
    pay_type: 'Salary',
    base_rate: 65000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: 'None',
      rate_multiplier: 1.5,
      average_hours_per_week: 0,
      annual_hours: 0,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 50, frequency: 'Monthly', taxable: false },
      { name: 'Professional Development', amount: 1000, frequency: 'Annually', taxable: false },
    ],
    bonuses: [
      { name: 'Performance Bonus', amount: 2000, date_awarded: new Date('2018-06-30'), taxable: true },
    ],
    super_contributions: {
      contribution_rate: 9.5,
      additional_contributions: 0,
      salary_sacrifice: 0,
    },
    tax_withheld: 12000,
    payslip_frequency: 'Monthly',
    effective_date: new Date('2017-02-01'),
    confidence_score: 0.95,
    notes: 'Base graduate salary in Sydney market',
    created_at: new Date('2017-02-01'),
  },
  {
    id: 2,
    position_id: 2,
    entry_type: 'Exact',
    pay_type: 'Salary',
    base_rate: 85000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: 'Occasional',
      rate_multiplier: 1.5,
      average_hours_per_week: 2,
      annual_hours: 104,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 75, frequency: 'Monthly', taxable: false },
      { name: 'Home Office', amount: 1500, frequency: 'Annually', taxable: false },
    ],
    bonuses: [
      { name: 'Performance Bonus', amount: 4000, date_awarded: new Date('2020-06-30'), taxable: true },
      { name: 'Project Completion', amount: 2500, date_awarded: new Date('2021-01-15'), taxable: true },
    ],
    super_contributions: {
      contribution_rate: 9.5,
      additional_contributions: 5000,
      salary_sacrifice: 0,
    },
    tax_withheld: 16000,
    payslip_frequency: 'Monthly',
    effective_date: new Date('2019-03-15'),
    confidence_score: 0.95,
    notes: 'Promotion to mid-level with market adjustment',
    created_at: new Date('2019-03-15'),
  },
  {
    id: 3,
    position_id: 3,
    entry_type: 'Exact',
    pay_type: 'Salary',
    base_rate: 120000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: 'Frequent',
      rate_multiplier: 1.5,
      average_hours_per_week: 4,
      annual_hours: 208,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 100, frequency: 'Monthly', taxable: false },
      { name: 'Vehicle Allowance', amount: 300, frequency: 'Monthly', taxable: true },
      { name: 'Professional Development', amount: 3000, frequency: 'Annually', taxable: false },
    ],
    bonuses: [
      { name: 'Performance Bonus', amount: 10000, date_awarded: new Date('2022-06-30'), taxable: true },
      { name: 'Team Leadership Bonus', amount: 5000, date_awarded: new Date('2023-01-15'), taxable: true },
    ],
    super_contributions: {
      contribution_rate: 10.5,
      additional_contributions: 10000,
      salary_sacrifice: 5000,
    },
    tax_withheld: 28000,
    payslip_frequency: 'Monthly',
    effective_date: new Date('2021-07-01'),
    confidence_score: 0.95,
    notes: 'Senior role with leadership responsibilities',
    created_at: new Date('2021-07-01'),
  },
  {
    id: 4,
    position_id: 4,
    entry_type: 'Exact',
    pay_type: 'Salary',
    base_rate: 140000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: 'Frequent',
      rate_multiplier: 1.5,
      average_hours_per_week: 3,
      annual_hours: 156,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 150, frequency: 'Monthly', taxable: false },
      { name: 'Home Office Stipend', amount: 200, frequency: 'Monthly', taxable: false },
      { name: 'Professional Development', amount: 5000, frequency: 'Annually', taxable: false },
      { name: 'Health & Wellness', amount: 1000, frequency: 'Annually', taxable: false },
    ],
    bonuses: [
      { name: 'Sign-on Bonus', amount: 10000, date_awarded: new Date('2024-01-15'), taxable: true },
    ],
    super_contributions: {
      contribution_rate: 11,
      additional_contributions: 15000,
      salary_sacrifice: 10000,
    },
    tax_withheld: 34000,
    payslip_frequency: 'Monthly',
    effective_date: new Date('2024-01-15'),
    confidence_score: 1.0,
    notes: 'Current role with comprehensive benefits package',
    created_at: new Date('2024-01-15'),
  },
];

// Mock Tauri invoke function
export async function invoke<T>(command: string, args?: any): Promise<T> {
  console.log(`Mock Tauri invoke: ${command}`, args);

  switch (command) {
    case 'get_user_profile':
      return getUserData().profile as T;

    case 'save_user_profile':
      const profileData = args?.profile || args;
      setUserData({
        profile: {
          ...profileData,
          id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      return undefined as T;

    case 'get_positions':
      return getUserData().positions as T;

    case 'save_position':
      const currentData = getUserData();
      const posArgs = args as Position;
      if (posArgs.id) {
        // Update
        setUserData({
          positions: currentData.positions.map(p => p.id === posArgs.id ? { ...p, ...posArgs, updated_at: new Date() } : p)
        });
        return posArgs.id as T;
      } else {
        // Create
        const newPosition = { ...posArgs, id: Date.now(), created_at: new Date(), updated_at: new Date() };
        setUserData({ positions: [...currentData.positions, newPosition] });
        return newPosition.id as T;
      }

    case 'delete_position':
      const posData = getUserData();
      setUserData({
        positions: posData.positions.filter(p => p.id !== args)
      });
      return undefined as T;

    case 'get_compensation_records':
      const compData = getUserData();
      return compData.compensation.filter(c => c.position_id === args) as T;

    case 'get_all_compensation_records':
      return getUserData().compensation as T;

    case 'save_compensation_record':
      const compCurrent = getUserData();
      const compArgs = args as CompensationRecord;
      if (compArgs.id) {
        // Update
        setUserData({
          compensation: compCurrent.compensation.map(c => c.id === compArgs.id ? { ...c, ...compArgs } : c)
        });
        return compArgs.id as T;
      } else {
        // Create
        const newRecord = { ...compArgs, id: Date.now(), created_at: new Date() };
        setUserData({
          compensation: [...compCurrent.compensation, newRecord]
        });
        return newRecord.id as T;
      }

    case 'delete_compensation_record':
      const compDataDel = getUserData();
      setUserData({
        compensation: compDataDel.compensation.filter(c => c.id !== args)
      });
      return undefined as T;

    // Weekly Entry operations
    case 'get_weekly_entries':
      return getUserData().weeklyEntries as T;

    case 'save_weekly_entry':
      const weeklyData = getUserData();
      const weeklyArgs = args?.entry || args;
      if (weeklyArgs.id) {
        // Update
        setUserData({
          weeklyEntries: weeklyData.weeklyEntries.map((w: any) => w.id === weeklyArgs.id ? { ...w, ...weeklyArgs } : w)
        });
        return weeklyArgs.id as T;
      } else {
        // Create
        const newWeekly = { ...weeklyArgs, id: Date.now(), created_at: new Date() };
        setUserData({
          weeklyEntries: [...weeklyData.weeklyEntries, newWeekly]
        });
        return newWeekly.id as T;
      }

    case 'delete_weekly_entry':
      const weeklyDataDel = getUserData();
      setUserData({
        weeklyEntries: weeklyDataDel.weeklyEntries.filter((w: any) => w.id !== args)
      });
      return undefined as T;

    // Yearly Entry operations
    case 'get_yearly_entries':
      return getUserData().yearlyEntries as T;

    case 'save_yearly_entry':
      const yearlyData = getUserData();
      const yearlyArgs = args?.entry || args;
      if (yearlyArgs.id) {
        // Update
        setUserData({
          yearlyEntries: yearlyData.yearlyEntries.map((y: any) => y.id === yearlyArgs.id ? { ...y, ...yearlyArgs } : y)
        });
        return yearlyArgs.id as T;
      } else {
        // Create
        const newYearly = { ...yearlyArgs, id: Date.now(), created_at: new Date() };
        setUserData({
          yearlyEntries: [...yearlyData.yearlyEntries, newYearly]
        });
        return newYearly.id as T;
      }

    case 'delete_yearly_entry':
      const yearlyDataDel = getUserData();
      setUserData({
        yearlyEntries: yearlyDataDel.yearlyEntries.filter((y: any) => y.id !== args)
      });
      return undefined as T;

    case 'calculate_earnings_analysis':
      // Calculate earnings from actual data
      const userCompData = getUserData();

      // Return null if no data exists
      if (!userCompData.compensation || userCompData.compensation.length === 0) {
        return null as T;
      }

      const currentCompensation = userCompData.compensation[userCompData.compensation.length - 1]; // Latest position
      const totalCompensation = currentCompensation ?
        currentCompensation.base_rate +
        (currentCompensation.allowances.reduce((sum: number, a: any) => sum + (a.frequency === 'Monthly' ? a.amount * 12 : a.frequency === 'Annually' ? a.amount : 0), 0)) +
        (currentCompensation.bonuses.reduce((sum: number, b: any) => sum + b.amount, 0) / 2) : // Average annual bonus
        0;

      const standardHours = currentCompensation ? currentCompensation.standard_weekly_hours * 52 : 1976;
      const overtimeHours = currentCompensation ? currentCompensation.overtime.annual_hours || 0 : 0;
      const totalHours = standardHours + overtimeHours;
      const effectiveHourlyRate = totalHours > 0 ? totalCompensation / totalHours : 0;

      // Calculate earnings progression from compensation records
      // Calculate earnings progression from compensation records
      const earningsOverTime = userCompData.compensation.map((c: any) => {
        const annualAllowances = c.allowances.reduce((sum: number, a: any) => sum + (a.frequency === 'Monthly' ? a.amount * 12 : a.frequency === 'Annually' ? a.amount : a.amount * 52), 0);
        const annualBonus = c.bonuses.reduce((sum: number, b: any) => sum + b.amount, 0);

        return {
          date: new Date(c.effective_date),
          base_annual: (c.pay_type === 'Hourly' || c.pay_type === 'Weekly') ? c.base_rate * 52 : c.base_rate,
          actual_annual: ((c.pay_type === 'Hourly' || c.pay_type === 'Weekly') ? c.base_rate * 52 : c.base_rate) + annualAllowances + annualBonus,
          total_with_super: ((c.pay_type === 'Hourly' || c.pay_type === 'Weekly') ? c.base_rate * 52 : c.base_rate) * (1 + c.super_contributions.contribution_rate / 100) +
            c.super_contributions.additional_contributions + c.super_contributions.salary_sacrifice,
          effective_hourly_rate: c.base_rate / (c.standard_weekly_hours * 52 + (c.overtime.annual_hours || 0)),
          bonuses_annual: annualBonus,
          allowances_annual: annualAllowances
        };
      });

      // Calculate dynamic hours vs earnings
      const hoursVsEarningsMap = new Map<number, { total_hours: number, total_earnings: number, overtime_hours: number }>();

      userCompData.compensation.forEach((c: any) => {
        const year = new Date(c.effective_date).getFullYear();
        const existing = hoursVsEarningsMap.get(year) || { total_hours: 0, total_earnings: 0, overtime_hours: 0 };

        const weeksActive = 52;
        const weeklyHours = c.standard_weekly_hours + (c.overtime?.average_hours_per_week || 0);
        const annualHours = weeklyHours * weeksActive + (c.overtime?.annual_hours || 0);

        // Correct annual calculation
        const annualBase = (c.pay_type === 'Hourly' || c.pay_type === 'Weekly') ? c.base_rate * 52 : c.base_rate;

        const annualAllowances = c.allowances.reduce((sum: number, a: any) => sum + (a.frequency === 'Monthly' ? a.amount * 12 : a.frequency === 'Annually' ? a.amount : a.amount * 52), 0);
        const annualBonus = c.bonuses.reduce((sum: number, b: any) => sum + b.amount, 0);

        existing.total_hours += annualHours;
        existing.total_earnings += annualBase + annualAllowances + annualBonus;
        existing.overtime_hours += (c.overtime?.average_hours_per_week || 0) * 52 + (c.overtime?.annual_hours || 0);

        hoursVsEarningsMap.set(year, existing);
      });

      const hoursVsEarnings = Array.from(hoursVsEarningsMap.entries()).map(([year, data]) => ({
        year,
        total_hours_worked: Math.round(data.total_hours),
        total_earnings: Math.round(data.total_earnings),
        overtime_percentage: data.total_hours > 0 ? Math.round((data.overtime_hours / data.total_hours) * 100) : 0
      })).sort((a, b) => a.year - b.year);

      // Calculate super trajectory
      const superMap = new Map<string, { employer: number, personal: number, balance: number }>();
      let runningBalance = 0;

      const sortedComp = [...userCompData.compensation].sort((a: any, b: any) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime());

      sortedComp.forEach((c: any) => {
        const startYear = new Date(c.effective_date).getFullYear();
        const month = new Date(c.effective_date).getMonth(); // 0-11
        const fyStartYear = month >= 6 ? startYear : startYear - 1;
        const fy = `FY${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;

        const existing = superMap.get(fy) || { employer: 0, personal: 0, balance: 0 };

        const annualBase = (c.pay_type === 'Hourly' || c.pay_type === 'Weekly') ? c.base_rate * 52 : c.base_rate;
        const employerCont = annualBase * (c.super_contributions.contribution_rate / 100) + c.super_contributions.additional_contributions;
        const personalCont = c.super_contributions.salary_sacrifice;

        existing.employer += employerCont;
        existing.personal += personalCont;
        runningBalance += employerCont + personalCont;
        existing.balance = runningBalance;

        superMap.set(fy, existing);
      });

      const superTrajectory = Array.from(superMap.entries()).map(([financial_year, data]) => ({
        financial_year,
        employer_contributions: Math.round(data.employer),
        personal_contributions: Math.round(data.personal),
        total_super_balance: Math.round(data.balance)
      })).sort((a, b) => parseInt(a.financial_year.substring(2, 6)) - parseInt(b.financial_year.substring(2, 6)));

      // Generate dynamic insights
      const insightsArray: any[] = [];
      if (hoursVsEarnings.length > 1) {
        const first = hoursVsEarnings[0];
        const last = hoursVsEarnings[hoursVsEarnings.length - 1];
        const growth = first.total_earnings > 0 ? ((last.total_earnings - first.total_earnings) / first.total_earnings) * 100 : 0;

        insightsArray.push({
          category: 'CareerProgression',
          title: `Career Growth: ${Math.round(growth)}% increase`,
          description: `You have grown your earnings from $${(first.total_earnings / 1000).toFixed(1)}k to $${(last.total_earnings / 1000).toFixed(1)}k over ${hoursVsEarnings.length} years.`,
          confidence_level: 90,
          data_points: [`Started: $${(first.total_earnings / 1000).toFixed(0)}k`, `Current: $${(last.total_earnings / 1000).toFixed(0)}k`]
        });
      }

      return {
        current_total_compensation: totalCompensation,
        current_effective_hourly_rate: effectiveHourlyRate,
        current_weekly_hours: currentCompensation ? currentCompensation.standard_weekly_hours + (currentCompensation.overtime?.average_hours_per_week || 0) : 38,
        income_percentile: 78,
        loyalty_tax_annual: 0,
        loyalty_tax_cumulative: 0,
        years_since_last_change: 2, // simplified
        earnings_over_time: earningsOverTime,
        hours_vs_earnings: hoursVsEarnings,
        super_trajectory: superTrajectory,
        super_summary: superTrajectory[superTrajectory.length - 1] || { financial_year: 'N/A', employer_contributions: 0, personal_contributions: 0, total_super_balance: 0 },
        insights: insightsArray
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
      const resumeData = getUserData();
      return {
        profile_summary: {
          name: 'Test User',
          age: 35,
          location: 'Sydney, NSW',
          industry: 'Technology',
          experience_years: 5,
          seniority_level: 'Senior'
        },
        career_timeline: resumeData.positions.map((p: any) => ({
          employer: p.employer_name,
          title: p.job_title,
          duration: '2 years',
          responsibilities: [p.core_responsibilities],
          achievements: p.achievements,
          skills_used: p.tools_systems_skills
        })),
        achievements: resumeData.positions.flatMap((p: any) => p.achievements),
        skills_and_tools: resumeData.positions.flatMap((p: any) => p.tools_systems_skills),
        compensation_summary: {
          current_base: 120000,
          current_total: 130000,
          career_earnings_total: 550000,
          average_annual_increase: 0.06
        },
        target_preferences: resumeData.profile?.career_preferences || {}
      } as T;

    case 'export_all_data':
      const exportDataAll = getUserData();
      return {
        user_profile: exportDataAll.profile,
        positions: exportDataAll.positions,
        compensation_records: exportDataAll.compensation,
        weekly_entries: exportDataAll.weeklyEntries,
        yearly_entries: exportDataAll.yearlyEntries,
        export_date: new Date().toISOString(),
        version: '1.0.0'
      } as T;

    case 'import_all_data':
      const importArgs = args || {};
      const currentDataForImport = getUserData();
      if (importArgs.user_profile) currentDataForImport.profile = importArgs.user_profile;
      if (importArgs.positions) currentDataForImport.positions = importArgs.positions;
      if (importArgs.compensation_records) currentDataForImport.compensation = importArgs.compensation_records;
      if (importArgs.weekly_entries) currentDataForImport.weeklyEntries = importArgs.weekly_entries;
      if (importArgs.yearly_entries) currentDataForImport.yearlyEntries = importArgs.yearly_entries;
      setUserData(currentDataForImport);
      return {
        success: true,
        profile_imported: !!importArgs.user_profile,
        positions_count: importArgs.positions?.length || 0,
        compensation_count: importArgs.compensation_records?.length || 0,
        weekly_count: importArgs.weekly_entries?.length || 0,
        yearly_count: importArgs.yearly_entries?.length || 0
      } as T;

    case 'load_sample_data':
      setUserData({
        profile: sampleUserProfile,
        positions: samplePositions,
        compensation: sampleCompensation,
        weeklyEntries: [],
        yearlyEntries: [],
      });
      // setUserData already saves to storage
      return {
        success: true, loaded: {
          profile: !!sampleUserProfile,
          positions: samplePositions.length,
          compensation: sampleCompensation.length
        }
      } as T;

    case 'clear_all_data':
      const userIdToClear = getCurrentUserId();
      setUserData({
        profile: null,
        positions: [],
        compensation: [],
        weeklyEntries: [],
        yearlyEntries: [],
      });
      // setUserData saves to storage, so we don't strictly need to manually clear tokens unless we want to be cleaner
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('careerflow_data_' + userIdToClear) ||
            key.startsWith('careerflow_')) {
            localStorage.removeItem(key);
          }
        });
        // Re-save empty state to ensure it persists as empty rather than missing
        saveToStorage();
      }
      return { success: true } as T;

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
