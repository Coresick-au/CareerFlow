use crate::models::*;
use rusqlite::{params, Connection, Result as SqlResult};
use chrono::{DateTime, Utc, NaiveDate};
use std::path::PathBuf;

/// Safe JSON serialization helper - converts serde_json errors to rusqlite errors
fn to_json<T: serde::Serialize>(value: &T) -> Result<String, rusqlite::Error> {
    serde_json::to_string(value)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: PathBuf) -> SqlResult<Self> {
        let conn = Connection::open(db_path)?;
        
        // Enable foreign key constraints
        conn.pragma_update(None, "foreign_keys", "ON")?;
        
        // Set WAL mode for better performance
        conn.pragma_update(None, "journal_mode", "WAL")?;
        
        let mut db = Self { conn };
        db.migrate()?;
        Ok(db)
    }

    fn migrate(&mut self) -> SqlResult<()> {
        // User Profile table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS user_profile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                date_of_birth TEXT NOT NULL,
                state TEXT NOT NULL,
                industry TEXT NOT NULL,
                highest_qualification TEXT NOT NULL,
                employment_type_preference TEXT NOT NULL,
                fifo_tolerance TEXT NOT NULL,
                travel_tolerance TEXT NOT NULL,
                overtime_appetite TEXT NOT NULL,
                privacy_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
                disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
                standard_weekly_hours REAL NOT NULL DEFAULT 38.0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // Positions table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employer_name TEXT NOT NULL,
                job_title TEXT NOT NULL,
                employment_type TEXT NOT NULL,
                location TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT,
                seniority_level TEXT NOT NULL,
                core_responsibilities TEXT NOT NULL,
                tools_systems_skills TEXT NOT NULL, -- JSON array
                achievements TEXT NOT NULL, -- JSON array
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // Compensation Records table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS compensation_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                position_id INTEGER NOT NULL,
                entry_type TEXT NOT NULL,
                pay_type TEXT NOT NULL,
                base_rate REAL NOT NULL,
                standard_weekly_hours REAL NOT NULL,
                overtime_frequency TEXT NOT NULL,
                overtime_rate_multiplier REAL NOT NULL,
                overtime_average_hours_per_week REAL NOT NULL,
                overtime_annual_hours REAL,
                allowances TEXT NOT NULL, -- JSON array
                bonuses TEXT NOT NULL, -- JSON array
                super_contribution_rate REAL NOT NULL,
                super_additional_contributions REAL NOT NULL,
                super_salary_sacrifice REAL NOT NULL,
                payslip_frequency TEXT,
                tax_withheld REAL,
                effective_date TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // One-off Weekly Entries table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS weekly_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                position_id INTEGER, -- Optional link to a position
                financial_year TEXT NOT NULL,
                week_ending TEXT NOT NULL,
                gross_pay REAL NOT NULL,
                tax_withheld REAL NOT NULL,
                net_pay REAL NOT NULL,
                hours_ordinary REAL NOT NULL,
                hours_overtime REAL NOT NULL,
                overtime_rate_multiplier REAL NOT NULL,
                allowances TEXT NOT NULL, -- JSON array
                super_contributed REAL NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
            )",
            [],
        )?;

        // Yearly Income Entries table (ATO summaries)
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS yearly_income_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                position_id INTEGER,
                financial_year TEXT NOT NULL,
                gross_income REAL NOT NULL,
                tax_withheld REAL NOT NULL,
                reportable_super REAL NOT NULL,
                reportable_fringe_benefits REAL,
                source TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
            )",
            [],
        )?;

        // Create indexes for performance
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_positions_dates ON positions(start_date, end_date)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_compensation_position_date ON compensation_records(position_id, effective_date)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_weekly_date ON weekly_entries(week_ending)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_yearly_fy ON yearly_income_entries(financial_year)",
            [],
        )?;

        // Migration: Add standard_weekly_hours column if it doesn't exist (for existing databases)
        let _ = self.conn.execute(
            "ALTER TABLE user_profile ADD COLUMN standard_weekly_hours REAL NOT NULL DEFAULT 38.0",
            [],
        );

        Ok(())
    }

    // User Profile operations
    pub fn get_user_profile(&self) -> Result<Option<UserProfile>, String> {
        let mut stmt = self.conn
            .prepare(
                "SELECT id, first_name, last_name, date_of_birth, state, industry,
                        highest_qualification, employment_type_preference, fifo_tolerance,
                        travel_tolerance, overtime_appetite, privacy_acknowledged,
                        disclaimer_acknowledged, standard_weekly_hours, created_at, updated_at
                 FROM user_profile
                 LIMIT 1"
            )
            .map_err(|e| e.to_string())?;

        let result = stmt.query_row([], |row| {
            Ok(UserProfile {
                id: Some(row.get(0)?),
                first_name: row.get(1)?,
                last_name: row.get(2)?,
                date_of_birth: NaiveDate::parse_from_str(&row.get::<_, String>(3)?, "%Y-%m-%d")
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
                state: serde_json::from_str(&row.get::<_, String>(4)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(4, rusqlite::types::Type::Text, Box::new(e)))?,
                industry: row.get(5)?,
                highest_qualification: serde_json::from_str(&row.get::<_, String>(6)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(6, rusqlite::types::Type::Text, Box::new(e)))?,
                career_preferences: CareerPreferences {
                    employment_type_preference: serde_json::from_str(&row.get::<_, String>(7)?)
                        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(7, rusqlite::types::Type::Text, Box::new(e)))?,
                    fifo_tolerance: serde_json::from_str(&row.get::<_, String>(8)?)
                        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(8, rusqlite::types::Type::Text, Box::new(e)))?,
                    travel_tolerance: serde_json::from_str(&row.get::<_, String>(9)?)
                        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(9, rusqlite::types::Type::Text, Box::new(e)))?,
                    overtime_appetite: serde_json::from_str(&row.get::<_, String>(10)?)
                        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(10, rusqlite::types::Type::Text, Box::new(e)))?,
                    privacy_acknowledged: row.get(11)?,
                    disclaimer_acknowledged: row.get(12)?,
                },
                standard_weekly_hours: row.get(13)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(14)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(14, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(15)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(15, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
            })
        });

        match result {
            Ok(profile) => Ok(Some(profile)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    pub fn save_user_profile(&self, profile: UserProfile) -> SqlResult<()> {
        let now = Utc::now().to_rfc3339();
        
        if let Some(id) = profile.id {
            // Update existing
            self.conn.execute(
                "UPDATE user_profile SET
                    first_name = ?1, last_name = ?2, date_of_birth = ?3, state = ?4,
                    industry = ?5, highest_qualification = ?6, employment_type_preference = ?7,
                    fifo_tolerance = ?8, travel_tolerance = ?9, overtime_appetite = ?10,
                    privacy_acknowledged = ?11, disclaimer_acknowledged = ?12,
                    standard_weekly_hours = ?13, updated_at = ?14
                 WHERE id = ?15",
                params![
                    profile.first_name,
                    profile.last_name,
                    profile.date_of_birth.to_string(),
                    to_json(&profile.state)?,
                    profile.industry,
                    to_json(&profile.highest_qualification)?,
                    to_json(&profile.career_preferences.employment_type_preference)?,
                    to_json(&profile.career_preferences.fifo_tolerance)?,
                    to_json(&profile.career_preferences.travel_tolerance)?,
                    to_json(&profile.career_preferences.overtime_appetite)?,
                    profile.career_preferences.privacy_acknowledged,
                    profile.career_preferences.disclaimer_acknowledged,
                    profile.standard_weekly_hours,
                    now,
                    id
                ],
            )?;
        } else {
            // Insert new
            self.conn.execute(
                "INSERT INTO user_profile (
                    first_name, last_name, date_of_birth, state, industry,
                    highest_qualification, employment_type_preference, fifo_tolerance,
                    travel_tolerance, overtime_appetite, privacy_acknowledged,
                    disclaimer_acknowledged, standard_weekly_hours, created_at, updated_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
                params![
                    profile.first_name,
                    profile.last_name,
                    profile.date_of_birth.to_string(),
                    to_json(&profile.state)?,
                    profile.industry,
                    to_json(&profile.highest_qualification)?,
                    to_json(&profile.career_preferences.employment_type_preference)?,
                    to_json(&profile.career_preferences.fifo_tolerance)?,
                    to_json(&profile.career_preferences.travel_tolerance)?,
                    to_json(&profile.career_preferences.overtime_appetite)?,
                    profile.career_preferences.privacy_acknowledged,
                    profile.career_preferences.disclaimer_acknowledged,
                    profile.standard_weekly_hours,
                    now,
                    now
                ],
            )?;
        }
        
        Ok(())
    }

    // Position operations
    pub fn get_positions(&self) -> Result<Vec<Position>, String> {
        let mut stmt = self.conn
            .prepare(
                "SELECT id, employer_name, job_title, employment_type, location,
                        start_date, end_date, seniority_level, core_responsibilities,
                        tools_systems_skills, achievements, created_at, updated_at
                 FROM positions
                 ORDER BY start_date DESC"
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map([], |row| {
            let tools_json: String = row.get(9)?;
            let achievements_json: String = row.get(10)?;

            Ok(Position {
                id: Some(row.get(0)?),
                employer_name: row.get(1)?,
                job_title: row.get(2)?,
                employment_type: serde_json::from_str(&row.get::<_, String>(3)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
                location: row.get(4)?,
                start_date: NaiveDate::parse_from_str(&row.get::<_, String>(5)?, "%Y-%m-%d")
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(5, rusqlite::types::Type::Text, Box::new(e)))?,
                end_date: {
                    match row.get::<_, Option<String>>(6)? {
                        Some(s) => Some(NaiveDate::parse_from_str(&s, "%Y-%m-%d")
                            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(6, rusqlite::types::Type::Text, Box::new(e)))?),
                        None => None,
                    }
                },
                seniority_level: serde_json::from_str(&row.get::<_, String>(7)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(7, rusqlite::types::Type::Text, Box::new(e)))?,
                core_responsibilities: row.get(8)?,
                tools_systems_skills: serde_json::from_str(&tools_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(9, rusqlite::types::Type::Text, Box::new(e)))?,
                achievements: serde_json::from_str(&achievements_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(10, rusqlite::types::Type::Text, Box::new(e)))?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(11)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(11, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(12)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(12, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
            })
        }).map_err(|e| e.to_string())?;

        let mut positions = Vec::new();
        for row_result in rows {
            positions.push(row_result.map_err(|e| e.to_string())?);
        }
        Ok(positions)
    }

    pub fn save_position(&self, position: Position) -> SqlResult<i64> {
        let now = Utc::now().to_rfc3339();
        
        let tools_json = to_json(&position.tools_systems_skills)?;
        let achievements_json = to_json(&position.achievements)?;
        
        if let Some(id) = position.id {
            // Update existing
            self.conn.execute(
                "UPDATE positions SET
                    employer_name = ?1, job_title = ?2, employment_type = ?3, location = ?4,
                    start_date = ?5, end_date = ?6, seniority_level = ?7, core_responsibilities = ?8,
                    tools_systems_skills = ?9, achievements = ?10, updated_at = ?11
                 WHERE id = ?12",
                params![
                    position.employer_name,
                    position.job_title,
                    to_json(&position.employment_type)?,
                    position.location,
                    position.start_date.to_string(),
                    position.end_date.map(|d| d.to_string()),
                    to_json(&position.seniority_level)?,
                    position.core_responsibilities,
                    tools_json,
                    achievements_json,
                    now,
                    id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.conn.execute(
                "INSERT INTO positions (
                    employer_name, job_title, employment_type, location, start_date,
                    end_date, seniority_level, core_responsibilities, tools_systems_skills,
                    achievements, created_at, updated_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![
                    position.employer_name,
                    position.job_title,
                    to_json(&position.employment_type)?,
                    position.location,
                    position.start_date.to_string(),
                    position.end_date.map(|d| d.to_string()),
                    to_json(&position.seniority_level)?,
                    position.core_responsibilities,
                    tools_json,
                    achievements_json,
                    now,
                    now
                ],
            )?;
            Ok(self.conn.last_insert_rowid())
        }
    }

    pub fn delete_position(&self, id: i64) -> SqlResult<()> {
        self.conn.execute("DELETE FROM positions WHERE id = ?1", [id])?;
        Ok(())
    }

    // Compensation Record operations
    pub fn get_compensation_records(&self, position_id: i64) -> Result<Vec<CompensationRecord>, String> {
        let mut stmt = self.conn
            .prepare(
                "SELECT id, position_id, entry_type, pay_type, base_rate,
                        standard_weekly_hours, overtime_frequency, overtime_rate_multiplier,
                        overtime_average_hours_per_week, overtime_annual_hours, allowances,
                        bonuses, super_contribution_rate, super_additional_contributions,
                        super_salary_sacrifice, payslip_frequency, tax_withheld, effective_date,
                        confidence_score, notes, created_at
                 FROM compensation_records
                 WHERE position_id = ?1
                 ORDER BY effective_date DESC"
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map([position_id], |row| {
            let allowances_json: String = row.get(10)?;
            let bonuses_json: String = row.get(11)?;

            Ok(CompensationRecord {
                id: Some(row.get(0)?),
                position_id: row.get(1)?,
                entry_type: serde_json::from_str(&row.get::<_, String>(2)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(2, rusqlite::types::Type::Text, Box::new(e)))?,
                pay_type: serde_json::from_str(&row.get::<_, String>(3)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
                base_rate: row.get(4)?,
                standard_weekly_hours: row.get(5)?,
                overtime: OvertimeDetails {
                    frequency: serde_json::from_str(&row.get::<_, String>(6)?)
                        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(6, rusqlite::types::Type::Text, Box::new(e)))?,
                    rate_multiplier: row.get(7)?,
                    average_hours_per_week: row.get(8)?,
                    annual_hours: row.get(9)?,
                },
                allowances: serde_json::from_str(&allowances_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(10, rusqlite::types::Type::Text, Box::new(e)))?,
                bonuses: serde_json::from_str(&bonuses_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(11, rusqlite::types::Type::Text, Box::new(e)))?,
                super_contributions: SuperDetails {
                    contribution_rate: row.get(12)?,
                    additional_contributions: row.get(13)?,
                    salary_sacrifice: row.get(14)?,
                },
                payslip_frequency: {
                    match row.get::<_, Option<String>>(15)? {
                        Some(s) => Some(serde_json::from_str(&s)
                            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(15, rusqlite::types::Type::Text, Box::new(e)))?),
                        None => None,
                    }
                },
                tax_withheld: row.get(16)?,
                effective_date: NaiveDate::parse_from_str(&row.get::<_, String>(17)?, "%Y-%m-%d")
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(17, rusqlite::types::Type::Text, Box::new(e)))?,
                confidence_score: row.get(18)?,
                notes: row.get(19)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(20)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(20, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
            })
        }).map_err(|e| e.to_string())?;

        let mut records = Vec::new();
        for row_result in rows {
            records.push(row_result.map_err(|e| e.to_string())?);
        }
        Ok(records)
    }

    pub fn save_compensation_record(&self, record: CompensationRecord) -> SqlResult<i64> {
        let now = Utc::now().to_rfc3339();
        
        let allowances_json = to_json(&record.allowances)?;
        let bonuses_json = to_json(&record.bonuses)?;
        let payslip_freq_json: Option<String> = match &record.payslip_frequency {
            Some(freq) => Some(to_json(freq)?),
            None => None,
        };
        
        if let Some(id) = record.id {
            // Update existing
            self.conn.execute(
                "UPDATE compensation_records SET
                    entry_type = ?1, pay_type = ?2, base_rate = ?3, standard_weekly_hours = ?4,
                    overtime_frequency = ?5, overtime_rate_multiplier = ?6,
                    overtime_average_hours_per_week = ?7, overtime_annual_hours = ?8,
                    allowances = ?9, bonuses = ?10, super_contribution_rate = ?11,
                    super_additional_contributions = ?12, super_salary_sacrifice = ?13,
                    payslip_frequency = ?14, tax_withheld = ?15, effective_date = ?16, confidence_score = ?17, notes = ?18
                 WHERE id = ?19",
                params![
                    to_json(&record.entry_type)?,
                    to_json(&record.pay_type)?,
                    record.base_rate,
                    record.standard_weekly_hours,
                    to_json(&record.overtime.frequency)?,
                    record.overtime.rate_multiplier,
                    record.overtime.average_hours_per_week,
                    record.overtime.annual_hours,
                    allowances_json,
                    bonuses_json,
                    record.super_contributions.contribution_rate,
                    record.super_contributions.additional_contributions,
                    record.super_contributions.salary_sacrifice,
                    payslip_freq_json,
                    record.tax_withheld,
                    record.effective_date.to_string(),
                    record.confidence_score,
                    record.notes,
                    id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.conn.execute(
                "INSERT INTO compensation_records (
                    position_id, entry_type, pay_type, base_rate, standard_weekly_hours,
                    overtime_frequency, overtime_rate_multiplier, overtime_average_hours_per_week,
                    overtime_annual_hours, allowances, bonuses, super_contribution_rate,
                    super_additional_contributions, super_salary_sacrifice, payslip_frequency,
                    tax_withheld, effective_date, confidence_score, notes, created_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
                params![
                    record.position_id,
                    to_json(&record.entry_type)?,
                    to_json(&record.pay_type)?,
                    record.base_rate,
                    record.standard_weekly_hours,
                    to_json(&record.overtime.frequency)?,
                    record.overtime.rate_multiplier,
                    record.overtime.average_hours_per_week,
                    record.overtime.annual_hours,
                    allowances_json,
                    bonuses_json,
                    record.super_contributions.contribution_rate,
                    record.super_contributions.additional_contributions,
                    record.super_contributions.salary_sacrifice,
                    payslip_freq_json,
                    record.tax_withheld,
                    record.effective_date.to_string(),
                    record.confidence_score,
                    record.notes,
                    now
                ],
            )?;
            Ok(self.conn.last_insert_rowid())
        }
    }

    pub fn delete_compensation_record(&self, id: i64) -> SqlResult<()> {
        self.conn.execute("DELETE FROM compensation_records WHERE id = ?1", [id])?;
        Ok(())
    }

    // Weekly Entry operations
    pub fn get_weekly_entries(&self) -> Result<Vec<WeeklyCompensationEntry>, String> {
        let mut stmt = self.conn
            .prepare(
                "SELECT id, position_id, financial_year, week_ending, gross_pay,
                        tax_withheld, net_pay, hours_ordinary, hours_overtime,
                        overtime_rate_multiplier, allowances, super_contributed,
                        notes, created_at
                 FROM weekly_entries
                 ORDER BY week_ending DESC"
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map([], |row| {
            let allowances_json: String = row.get(10)?;

            Ok(WeeklyCompensationEntry {
                id: Some(row.get(0)?),
                position_id: row.get(1)?,
                financial_year: row.get(2)?,
                week_ending: NaiveDate::parse_from_str(&row.get::<_, String>(3)?, "%Y-%m-%d")
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
                gross_pay: row.get(4)?,
                tax_withheld: row.get(5)?,
                net_pay: row.get(6)?,
                hours_ordinary: row.get(7)?,
                hours_overtime: row.get(8)?,
                overtime_rate_multiplier: row.get(9)?,
                allowances: serde_json::from_str(&allowances_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(10, rusqlite::types::Type::Text, Box::new(e)))?,
                super_contributed: row.get(11)?,
                notes: row.get(12)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(13)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(13, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
            })
        }).map_err(|e| e.to_string())?;

        let mut entries = Vec::new();
        for row_result in rows {
            entries.push(row_result.map_err(|e| e.to_string())?);
        }
        Ok(entries)
    }

    pub fn save_weekly_entry(&self, entry: WeeklyCompensationEntry) -> SqlResult<i64> {
        let now = Utc::now().to_rfc3339();
        
        let allowances_json = to_json(&entry.allowances)?;
        
        if let Some(id) = entry.id {
            // Update existing
            self.conn.execute(
                "UPDATE weekly_entries SET
                    position_id = ?1, financial_year = ?2, week_ending = ?3,
                    gross_pay = ?4, tax_withheld = ?5, net_pay = ?6,
                    hours_ordinary = ?7, hours_overtime = ?8, overtime_rate_multiplier = ?9,
                    allowances = ?10, super_contributed = ?11, notes = ?12
                 WHERE id = ?13",
                params![
                    entry.position_id,
                    entry.financial_year,
                    entry.week_ending.to_string(),
                    entry.gross_pay,
                    entry.tax_withheld,
                    entry.net_pay,
                    entry.hours_ordinary,
                    entry.hours_overtime,
                    entry.overtime_rate_multiplier,
                    allowances_json,
                    entry.super_contributed,
                    entry.notes,
                    id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.conn.execute(
                "INSERT INTO weekly_entries (
                    position_id, financial_year, week_ending, gross_pay, tax_withheld,
                    net_pay, hours_ordinary, hours_overtime, overtime_rate_multiplier,
                    allowances, super_contributed, notes, created_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                params![
                    entry.position_id,
                    entry.financial_year,
                    entry.week_ending.to_string(),
                    entry.gross_pay,
                    entry.tax_withheld,
                    entry.net_pay,
                    entry.hours_ordinary,
                    entry.hours_overtime,
                    entry.overtime_rate_multiplier,
                    allowances_json,
                    entry.super_contributed,
                    entry.notes,
                    now
                ],
            )?;
            Ok(self.conn.last_insert_rowid())
        }
    }

    pub fn delete_weekly_entry(&self, id: i64) -> SqlResult<()> {
        self.conn.execute("DELETE FROM weekly_entries WHERE id = ?1", [id])?;
        Ok(())
    }

    // Get ALL compensation records (across all positions)
    pub fn get_all_compensation_records(&self) -> Result<Vec<CompensationRecord>, String> {
        let mut stmt = self.conn
            .prepare(
                "SELECT id, position_id, entry_type, pay_type, base_rate,
                        standard_weekly_hours, overtime_frequency, overtime_rate_multiplier,
                        overtime_average_hours_per_week, overtime_annual_hours, allowances,
                        bonuses, super_contribution_rate, super_additional_contributions,
                        super_salary_sacrifice, payslip_frequency, tax_withheld, effective_date,
                        confidence_score, notes, created_at
                 FROM compensation_records
                 ORDER BY effective_date DESC"
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map([], |row| {
            let allowances_json: String = row.get(10)?;
            let bonuses_json: String = row.get(11)?;

            Ok(CompensationRecord {
                id: Some(row.get(0)?),
                position_id: row.get(1)?,
                entry_type: serde_json::from_str(&row.get::<_, String>(2)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(2, rusqlite::types::Type::Text, Box::new(e)))?,
                pay_type: serde_json::from_str(&row.get::<_, String>(3)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
                base_rate: row.get(4)?,
                standard_weekly_hours: row.get(5)?,
                overtime: OvertimeDetails {
                    frequency: serde_json::from_str(&row.get::<_, String>(6)?)
                        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(6, rusqlite::types::Type::Text, Box::new(e)))?,
                    rate_multiplier: row.get(7)?,
                    average_hours_per_week: row.get(8)?,
                    annual_hours: row.get(9)?,
                },
                allowances: serde_json::from_str(&allowances_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(10, rusqlite::types::Type::Text, Box::new(e)))?,
                bonuses: serde_json::from_str(&bonuses_json)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(11, rusqlite::types::Type::Text, Box::new(e)))?,
                super_contributions: SuperDetails {
                    contribution_rate: row.get(12)?,
                    additional_contributions: row.get(13)?,
                    salary_sacrifice: row.get(14)?,
                },
                payslip_frequency: {
                    match row.get::<_, Option<String>>(15)? {
                        Some(s) => Some(serde_json::from_str(&s)
                            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(15, rusqlite::types::Type::Text, Box::new(e)))?),
                        None => None,
                    }
                },
                tax_withheld: row.get(16)?,
                effective_date: NaiveDate::parse_from_str(&row.get::<_, String>(17)?, "%Y-%m-%d")
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(17, rusqlite::types::Type::Text, Box::new(e)))?,
                confidence_score: row.get(18)?,
                notes: row.get(19)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(20)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(20, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
            })
        }).map_err(|e| e.to_string())?;

        let mut records = Vec::new();
        for row_result in rows {
            records.push(row_result.map_err(|e| e.to_string())?);
        }
        Ok(records)
    }

    // Yearly Income Entry operations
    pub fn get_yearly_entries(&self) -> Result<Vec<YearlyIncomeEntry>, String> {
        let mut stmt = self.conn
            .prepare(
                "SELECT id, position_id, financial_year, gross_income, tax_withheld,
                        reportable_super, reportable_fringe_benefits, source, notes, created_at
                 FROM yearly_income_entries
                 ORDER BY financial_year DESC"
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map([], |row| {
            Ok(YearlyIncomeEntry {
                id: Some(row.get(0)?),
                position_id: row.get(1)?,
                financial_year: row.get(2)?,
                gross_income: row.get(3)?,
                tax_withheld: row.get(4)?,
                reportable_super: row.get(5)?,
                reportable_fringe_benefits: row.get(6)?,
                source: serde_json::from_str(&row.get::<_, String>(7)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(7, rusqlite::types::Type::Text, Box::new(e)))?,
                notes: row.get(8)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(9)?)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(9, rusqlite::types::Type::Text, Box::new(e)))?
                    .with_timezone(&Utc),
            })
        }).map_err(|e| e.to_string())?;

        let mut entries = Vec::new();
        for row_result in rows {
            entries.push(row_result.map_err(|e| e.to_string())?);
        }
        Ok(entries)
    }

    pub fn save_yearly_entry(&self, entry: YearlyIncomeEntry) -> SqlResult<i64> {
        let now = Utc::now().to_rfc3339();
        
        if let Some(id) = entry.id {
            // Update existing
            self.conn.execute(
                "UPDATE yearly_income_entries SET
                    position_id = ?1, financial_year = ?2, gross_income = ?3,
                    tax_withheld = ?4, reportable_super = ?5, reportable_fringe_benefits = ?6,
                    source = ?7, notes = ?8
                 WHERE id = ?9",
                params![
                    entry.position_id,
                    entry.financial_year,
                    entry.gross_income,
                    entry.tax_withheld,
                    entry.reportable_super,
                    entry.reportable_fringe_benefits,
                    to_json(&entry.source)?,
                    entry.notes,
                    id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.conn.execute(
                "INSERT INTO yearly_income_entries (
                    position_id, financial_year, gross_income, tax_withheld,
                    reportable_super, reportable_fringe_benefits, source, notes, created_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    entry.position_id,
                    entry.financial_year,
                    entry.gross_income,
                    entry.tax_withheld,
                    entry.reportable_super,
                    entry.reportable_fringe_benefits,
                    to_json(&entry.source)?,
                    entry.notes,
                    now
                ],
            )?;
            Ok(self.conn.last_insert_rowid())
        }
    }

    pub fn delete_yearly_entry(&self, id: i64) -> SqlResult<()> {
        self.conn.execute("DELETE FROM yearly_income_entries WHERE id = ?1", [id])?;
        Ok(())
    }

    // Clear all data - for data backup/reset functionality
    pub fn clear_all_data(&mut self) -> SqlResult<()> {
        self.conn.execute("DELETE FROM yearly_income_entries", [])?;
        self.conn.execute("DELETE FROM weekly_entries", [])?;
        self.conn.execute("DELETE FROM compensation_records", [])?;
        self.conn.execute("DELETE FROM positions", [])?;
        self.conn.execute("DELETE FROM user_profile", [])?;
        Ok(())
    }
}

