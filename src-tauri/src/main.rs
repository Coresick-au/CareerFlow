// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{Manager, State};

mod database;
mod models;
mod calculations;

use database::Database;
use models::*;

struct AppState {
    db: Mutex<Database>,
}

#[tauri::command]
async fn get_user_profile(state: State<'_, AppState>) -> Result<Option<UserProfile>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_user_profile()
}

#[tauri::command]
async fn save_user_profile(profile: UserProfile, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_user_profile(profile).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_positions(state: State<'_, AppState>) -> Result<Vec<Position>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_positions()
}

#[tauri::command]
async fn save_position(position: Position, state: State<'_, AppState>) -> Result<i64, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_position(position).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_position(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_position(id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_compensation_records(position_id: i64, state: State<'_, AppState>) -> Result<Vec<CompensationRecord>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_compensation_records(position_id)
}

#[tauri::command]
async fn save_compensation_record(record: CompensationRecord, state: State<'_, AppState>) -> Result<i64, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_compensation_record(record).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_compensation_record(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_compensation_record(id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_weekly_entries(state: State<'_, AppState>) -> Result<Vec<WeeklyCompensationEntry>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_weekly_entries()
}

#[tauri::command]
async fn save_weekly_entry(entry: WeeklyCompensationEntry, state: State<'_, AppState>) -> Result<i64, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_weekly_entry(entry).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_weekly_entry(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_weekly_entry(id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn calculate_earnings_analysis(state: State<'_, AppState>) -> Result<EarningsAnalysis, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let positions = db.get_positions()?;
    let profile = db.get_user_profile()?;
    
    Ok(calculations::calculate_earnings_analysis(&positions, &profile))
}

#[tauri::command]
async fn calculate_loyalty_tax(state: State<'_, AppState>) -> Result<LoyaltyTaxAnalysis, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let positions = db.get_positions()?;
    
    Ok(calculations::calculate_loyalty_tax(&positions))
}

#[tauri::command]
async fn generate_resume_export(state: State<'_, AppState>) -> Result<ResumeExport, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let positions = db.get_positions()?;
    let profile = db.get_user_profile()?;
    
    Ok(calculations::generate_resume_export(&positions, &profile))
}

#[tauri::command]
async fn get_all_compensation_records(state: State<'_, AppState>) -> Result<Vec<CompensationRecord>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_compensation_records()
}

// Yearly Income Entry commands
#[tauri::command]
async fn get_yearly_entries(state: State<'_, AppState>) -> Result<Vec<YearlyIncomeEntry>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_yearly_entries()
}

#[tauri::command]
async fn save_yearly_entry(entry: YearlyIncomeEntry, state: State<'_, AppState>) -> Result<i64, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_yearly_entry(entry).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_yearly_entry(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_yearly_entry(id).map_err(|e| e.to_string())?;
    Ok(())
}

// Data export/import commands
#[tauri::command]
async fn export_all_data(state: State<'_, AppState>) -> Result<DataExport, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let user_profile = db.get_user_profile()?;
    let positions = db.get_positions()?;
    let compensation_records = db.get_all_compensation_records()?;
    let weekly_entries = db.get_weekly_entries()?;
    let yearly_entries = db.get_yearly_entries()?;
    
    Ok(DataExport {
        user_profile,
        positions,
        compensation_records,
        weekly_entries,
        yearly_entries,
        export_date: chrono::Utc::now(),
        version: "1.0.0".to_string(),
    })
}

#[tauri::command]
async fn import_all_data(data: DataExport, state: State<'_, AppState>) -> Result<ImportResult, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let mut profile_imported = false;
    let mut positions_count = 0;
    let mut compensation_count = 0;
    let mut weekly_count = 0;
    let mut yearly_count = 0;
    
    // Import profile
    if let Some(profile) = data.user_profile {
        db.save_user_profile(profile).map_err(|e| e.to_string())?;
        profile_imported = true;
    }
    
    // Import positions
    for position in data.positions {
        db.save_position(position).map_err(|e| e.to_string())?;
        positions_count += 1;
    }
    
    // Import compensation records
    for record in data.compensation_records {
        db.save_compensation_record(record).map_err(|e| e.to_string())?;
        compensation_count += 1;
    }
    
    // Import weekly entries
    for entry in data.weekly_entries {
        db.save_weekly_entry(entry).map_err(|e| e.to_string())?;
        weekly_count += 1;
    }
    
    // Import yearly entries
    for entry in data.yearly_entries {
        db.save_yearly_entry(entry).map_err(|e| e.to_string())?;
        yearly_count += 1;
    }
    
    Ok(ImportResult {
        success: true,
        profile_imported,
        positions_count,
        compensation_count,
        weekly_count,
        yearly_count,
    })
}

#[tauri::command]
async fn clear_all_data(state: State<'_, AppState>) -> Result<(), String> {
    let mut db = state.db.lock().map_err(|e| e.to_string())?;
    db.clear_all_data().map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the app data directory for reliable database storage
            let app_data_dir = match app.path_resolver().app_data_dir() {
                Some(dir) => dir,
                None => {
                    eprintln!("FATAL: Failed to resolve app data directory");
                    return Err("Failed to resolve app data directory".into());
                }
            };
            
            // Create the directory if it doesn't exist
            if let Err(e) = std::fs::create_dir_all(&app_data_dir) {
                eprintln!("FATAL: Failed to create app data directory: {}", e);
                return Err(format!("Failed to create app data directory: {}", e).into());
            }
            
            let db_path = app_data_dir.join("careerflow.db");
            
            let db = match Database::new(db_path) {
                Ok(database) => database,
                Err(e) => {
                    eprintln!("FATAL: Failed to initialize database: {}", e);
                    return Err(format!("Failed to initialize database: {}", e).into());
                }
            };
            
            app.manage(AppState { db: Mutex::new(db) });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_user_profile,
            save_user_profile,
            get_positions,
            save_position,
            delete_position,
            get_compensation_records,
            get_all_compensation_records,
            save_compensation_record,
            delete_compensation_record,
            calculate_earnings_analysis,
            calculate_loyalty_tax,
            generate_resume_export,
            get_weekly_entries,
            save_weekly_entry,
            delete_weekly_entry,
            get_yearly_entries,
            save_yearly_entry,
            delete_yearly_entry,
            export_all_data,
            import_all_data,
            clear_all_data
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            eprintln!("FATAL: Error while running Tauri application: {}", e);
            std::process::exit(1);
        });
}

