use tauri::Manager;

// Character save/load bypasses the fs plugin's own ACL scope matching
// entirely - the fs:allow-write-text-file/allow-read-text-file glob scopes
// (both "$APPDATA/characters/**" and "$APPDATA/characters/*" were tried)
// never actually matched a resolved absolute path in this Tauri version,
// throwing "forbidden path" on every real save attempt despite following
// the plugin's own documented scope syntax. Custom app commands like these
// aren't subject to the capability/ACL system at all (only plugin-namespaced
// commands are), so doing the file I/O directly here sidesteps the bug
// rather than continuing to chase glob syntax.
fn characters_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
  let dir = app
    .path()
    .app_data_dir()
    .map_err(|e| e.to_string())?
    .join("characters");
  std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir)
}

// Mirrors the client-side sanitizeFilename in desktop-storage.js - re-done
// server-side since this now touches the filesystem directly with no ACL
// scope backstop, so a stray "../" in a character name must never be able
// to write or read outside the characters folder.
fn sanitize_name(name: &str) -> String {
  let cleaned: String = name
    .chars()
    .filter(|c| !matches!(c, '\\' | '/' | ':' | '*' | '?' | '"' | '<' | '>' | '|'))
    .collect();
  let cleaned = cleaned.trim();
  if cleaned.is_empty() {
    "Unnamed Character".to_string()
  } else {
    cleaned.to_string()
  }
}

#[tauri::command]
fn save_character(app: tauri::AppHandle, name: String, contents: String) -> Result<String, String> {
  let filename = format!("{}.json", sanitize_name(&name));
  let path = characters_dir(&app)?.join(&filename);
  std::fs::write(&path, contents).map_err(|e| e.to_string())?;
  Ok(filename)
}

#[tauri::command]
fn list_characters(app: tauri::AppHandle) -> Result<Vec<String>, String> {
  let dir = characters_dir(&app)?;
  let mut names: Vec<String> = std::fs::read_dir(&dir)
    .map_err(|e| e.to_string())?
    .filter_map(|entry| entry.ok())
    .filter_map(|entry| entry.file_name().into_string().ok())
    .filter(|name| name.to_lowercase().ends_with(".json"))
    .map(|name| name[..name.len() - ".json".len()].to_string())
    .collect();
  names.sort();
  Ok(names)
}

#[tauri::command]
fn load_character(app: tauri::AppHandle, name: String) -> Result<String, String> {
  let path = characters_dir(&app)?.join(format!("{}.json", sanitize_name(&name)));
  std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      save_character,
      list_characters,
      load_character
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
