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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the app data directory for reliable database storage
            let app_data_dir = app.path_resolver()
                .app_data_dir()
                .expect("Failed to get app data directory");
            
            // Create the directory if it doesn't exist
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");
            
            let db_path = app_data_dir.join("careerflow.db");
            
            let db = Database::new(db_path)
                .expect("Failed to initialize database");
            
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
            save_compensation_record,
            delete_compensation_record,
            calculate_earnings_analysis,
            calculate_loyalty_tax,
            generate_resume_export,
            get_weekly_entries,
            save_weekly_entry,
            delete_weekly_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
