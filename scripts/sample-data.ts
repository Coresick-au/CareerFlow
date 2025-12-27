// Realistic sample data for Australian IT career progression
// Shows typical career path from graduate to senior developer over 8 years

import type { UserProfile, Position, CompensationRecord } from '../src/types';
import { 
  AustralianState, 
  Qualification, 
  EmploymentType, 
  SeniorityLevel,
  PayType,
  CompensationEntryType,
  OvertimeFrequency,
  AllowanceFrequency,
  PayslipFrequency,
  FIFOTolerance,
  TravelTolerance,
  OvertimeAppetite
} from '../src/types';

// Sample user profile
export const sampleUserProfile: UserProfile = {
  id: 1,
  first_name: 'Alex',
  last_name: 'Chen',
  date_of_birth: new Date('1995-06-15'),
  state: AustralianState.NSW,
  industry: 'Information Technology',
  highest_qualification: Qualification.Bachelor,
  career_preferences: {
    employment_type_preference: EmploymentType.Permanent,
    fifo_tolerance: FIFOTolerance.None,
    travel_tolerance: TravelTolerance.National,
    overtime_appetite: OvertimeAppetite.Moderate,
    privacy_acknowledged: true,
    disclaimer_acknowledged: true,
  },
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-12-01'),
};

// Career progression: Graduate Developer → Mid-level Developer → Senior Developer
export const samplePositions: Position[] = [
  {
    id: 1,
    employer_name: 'TechStart Solutions',
    job_title: 'Graduate Software Developer',
    employment_type: EmploymentType.Permanent,
    location: 'Sydney, NSW',
    start_date: new Date('2017-02-01'),
    end_date: new Date('2019-02-28'),
    seniority_level: SeniorityLevel.Entry,
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
    employment_type: EmploymentType.Permanent,
    location: 'Melbourne, VIC',
    start_date: new Date('2019-03-15'),
    end_date: new Date('2021-06-30'),
    seniority_level: SeniorityLevel.Mid,
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
    employment_type: EmploymentType.Permanent,
    location: 'Sydney, NSW',
    start_date: new Date('2021-07-01'),
    end_date: new Date('2023-12-31'),
    seniority_level: SeniorityLevel.Senior,
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
    employment_type: EmploymentType.Permanent,
    location: 'Sydney, NSW',
    start_date: new Date('2024-01-15'),
    end_date: undefined,
    seniority_level: SeniorityLevel.Senior,
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

// Compensation records matching Australian market rates
export const sampleCompensation: CompensationRecord[] = [
  // Graduate Developer salary (2017-2019)
  {
    id: 1,
    position_id: 1,
    entry_type: CompensationEntryType.Exact,
    pay_type: PayType.Salary,
    base_rate: 65000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: OvertimeFrequency.None,
      rate_multiplier: 1.5,
      average_hours_per_week: 0,
      annual_hours: 0,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 50, frequency: AllowanceFrequency.Monthly, taxable: false },
      { name: 'Professional Development', amount: 1000, frequency: AllowanceFrequency.Annually, taxable: false },
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
    payslip_frequency: PayslipFrequency.Monthly,
    effective_date: new Date('2017-02-01'),
    confidence_score: 0.95,
    notes: 'Base graduate salary in Sydney market',
    created_at: new Date('2017-02-01'),
  },
  
  // Mid-level Developer salary (2019-2021)
  {
    id: 2,
    position_id: 2,
    entry_type: CompensationEntryType.Exact,
    pay_type: PayType.Salary,
    base_rate: 85000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: OvertimeFrequency.Occasional,
      rate_multiplier: 1.5,
      average_hours_per_week: 2,
      annual_hours: 104,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 75, frequency: AllowanceFrequency.Monthly, taxable: false },
      { name: 'Home Office', amount: 1500, frequency: AllowanceFrequency.Annually, taxable: false },
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
    payslip_frequency: PayslipFrequency.Monthly,
    effective_date: new Date('2019-03-15'),
    confidence_score: 0.95,
    notes: 'Promotion to mid-level with market adjustment',
    created_at: new Date('2019-03-15'),
  },
  
  // Senior Developer salary (2021-2023)
  {
    id: 3,
    position_id: 3,
    entry_type: CompensationEntryType.Exact,
    pay_type: PayType.Salary,
    base_rate: 120000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: OvertimeFrequency.Frequent,
      rate_multiplier: 1.5,
      average_hours_per_week: 4,
      annual_hours: 208,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 100, frequency: AllowanceFrequency.Monthly, taxable: false },
      { name: 'Vehicle Allowance', amount: 300, frequency: AllowanceFrequency.Monthly, taxable: true },
      { name: 'Professional Development', amount: 3000, frequency: AllowanceFrequency.Annually, taxable: false },
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
    payslip_frequency: PayslipFrequency.Monthly,
    effective_date: new Date('2021-07-01'),
    confidence_score: 0.95,
    notes: 'Senior role with leadership responsibilities',
    created_at: new Date('2021-07-01'),
  },
  
  // Current Senior Full Stack salary (2024)
  {
    id: 4,
    position_id: 4,
    entry_type: CompensationEntryType.Exact,
    pay_type: PayType.Salary,
    base_rate: 140000,
    standard_weekly_hours: 38,
    overtime: {
      frequency: OvertimeFrequency.Frequent,
      rate_multiplier: 1.5,
      average_hours_per_week: 3,
      annual_hours: 156,
    },
    allowances: [
      { name: 'Mobile Phone', amount: 150, frequency: AllowanceFrequency.Monthly, taxable: false },
      { name: 'Home Office Stipend', amount: 200, frequency: AllowanceFrequency.Monthly, taxable: false },
      { name: 'Professional Development', amount: 5000, frequency: AllowanceFrequency.Annually, taxable: false },
      { name: 'Health & Wellness', amount: 1000, frequency: AllowanceFrequency.Annually, taxable: false },
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
    payslip_frequency: PayslipFrequency.Monthly,
    effective_date: new Date('2024-01-15'),
    confidence_score: 1.0,
    notes: 'Current role with comprehensive benefits package',
    created_at: new Date('2024-01-15'),
  },
];

// Function to load all sample data
export function loadSampleData() {
  return {
    profile: sampleUserProfile,
    positions: samplePositions,
    compensation: sampleCompensation,
  };
}

// Function to clear all data
export function clearAllData() {
  return {
    profile: null,
    positions: [],
    compensation: [],
  };
}
