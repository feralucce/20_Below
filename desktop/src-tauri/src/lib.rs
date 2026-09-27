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
  std::fs::write(&path, &contents).map_err(|e| e.to_string())?;
  // A copy goes where the browser saves, so the Owlbear Character Sheet's
  // Load opens straight onto it. Best effort: a missing or read-only
  // folder never stops the save itself.
  if let Ok(folder) = transfer_folder(&app) {
    let _ = std::fs::write(folder.join(&filename), &contents);
  }
  Ok(filename)
}

// ---- Moving characters between the Creator and the Owlbear sheet ----
//
// A web page cannot choose where its downloads land, so the Owlbear
// Character Sheet's Save always goes to the browser's download folder.
// The Creator looks there too: any 20 Below character in that folder that
// is newer than the Creator's own copy is offered in its Load list. The
// folder is Downloads unless the player has picked another one (their
// browser may save somewhere else); the choice is kept in transfer.json
// in the app's data folder.

#[derive(serde::Serialize, serde::Deserialize, Default)]
struct TransferSettings {
  folder: Option<String>,
}

fn transfer_settings_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
  let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
  std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir.join("transfer.json"))
}

fn transfer_settings(app: &tauri::AppHandle) -> TransferSettings {
  transfer_settings_path(app)
    .ok()
    .and_then(|p| std::fs::read_to_string(p).ok())
    .and_then(|t| serde_json::from_str(&t).ok())
    .unwrap_or_default()
}

fn transfer_folder(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
  let chosen = transfer_settings(app).folder.map(std::path::PathBuf::from);
  let folder = match chosen {
    Some(f) => f,
    None => app.path().download_dir().map_err(|e| e.to_string())?,
  };
  if folder.is_dir() { Ok(folder) } else { Err(format!("{} is not a folder", folder.display())) }
}

#[tauri::command]
fn get_transfer_folder(app: tauri::AppHandle) -> Result<String, String> {
  Ok(transfer_folder(&app)?.display().to_string())
}

// None puts it back to Downloads.
#[tauri::command]
fn set_transfer_folder(app: tauri::AppHandle, folder: Option<String>) -> Result<String, String> {
  if let Some(f) = &folder {
    if !std::path::Path::new(f).is_dir() {
      return Err(format!("{} is not a folder", f));
    }
  }
  let text = serde_json::to_string(&TransferSettings { folder }).map_err(|e| e.to_string())?;
  std::fs::write(transfer_settings_path(&app)?, text).map_err(|e| e.to_string())?;
  get_transfer_folder(app)
}

#[derive(serde::Serialize)]
struct TransferEntry {
  file: String,
  name: String,
  modified: u64,
  replaces: bool,
}

fn modified_ms(meta: &std::fs::Metadata) -> u64 {
  meta
    .modified()
    .ok()
    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
    .map(|d| d.as_millis() as u64)
    .unwrap_or(0)
}

// A character file, as the Creator and the Owlbear sheet both write it:
// a name, Elements and sub-stats.
fn character_name(value: &serde_json::Value) -> Option<String> {
  if !value.get("attributes").map_or(false, |a| a.is_object()) { return None; }
  if !value.get("subStats").map_or(false, |a| a.is_object()) { return None; }
  Some(value.get("name").and_then(|n| n.as_str()).unwrap_or("").to_string())
}

// The newest copy of each character in the transfer folder that the
// Creator does not already have: a new character, or a newer and
// different version of one it has. Browsers number repeat downloads
// ("Rowen Storm (1).json"), so the character's own name decides which
// files are the same character, not the file name.
#[tauri::command]
fn list_transfer_characters(app: tauri::AppHandle) -> Result<Vec<TransferEntry>, String> {
  let folder = transfer_folder(&app)?;
  let saved_dir = characters_dir(&app)?;
  let mut newest: std::collections::HashMap<String, (String, u64, serde_json::Value, String)> =
    std::collections::HashMap::new();
  for entry in std::fs::read_dir(&folder).map_err(|e| e.to_string())?.filter_map(|e| e.ok()) {
    let file = match entry.file_name().into_string() { Ok(f) => f, Err(_) => continue };
    if !file.to_lowercase().ends_with(".json") { continue; }
    let meta = match entry.metadata() { Ok(m) => m, Err(_) => continue };
    if !meta.is_file() || meta.len() > 5_000_000 { continue; }
    let text = match std::fs::read_to_string(entry.path()) { Ok(t) => t, Err(_) => continue };
    let value: serde_json::Value = match serde_json::from_str(&text) { Ok(v) => v, Err(_) => continue };
    let name = match character_name(&value) { Some(n) => n, None => continue };
    let key = sanitize_name(&name);
    let when = modified_ms(&meta);
    if newest.get(&key).map_or(true, |(_, t, _, _)| when > *t) {
      newest.insert(key, (file, when, value, name));
    }
  }
  let mut out = Vec::new();
  for (key, (file, when, value, name)) in newest {
    let saved_path = saved_dir.join(format!("{}.json", key));
    let saved = std::fs::metadata(&saved_path).ok().map(|m| modified_ms(&m));
    let replaces = saved.is_some();
    if let Some(saved_when) = saved {
      // Older than the Creator's copy, or the same character, is not new.
      if when <= saved_when + 2_000 { continue; }
      let same = std::fs::read_to_string(&saved_path)
        .ok()
        .and_then(|t| serde_json::from_str::<serde_json::Value>(&t).ok())
        .map_or(false, |v| v == value);
      if same { continue; }
    }
    out.push(TransferEntry { file, name, modified: when, replaces });
  }
  out.sort_by(|a, b| b.modified.cmp(&a.modified));
  Ok(out)
}

#[tauri::command]
fn load_transfer_character(app: tauri::AppHandle, file: String) -> Result<String, String> {
  // A bare file name only: nothing outside the transfer folder.
  if file.contains('/') || file.contains('\\') || file.contains("..") {
    return Err("not a file in the transfer folder".to_string());
  }
  std::fs::read_to_string(transfer_folder(&app)?.join(&file)).map_err(|e| e.to_string())
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

// Import reads a file the user picked via the dialog plugin, which can be
// anywhere on disk - not just the app's own characters folder, so this
// can't reuse characters_dir's scoping. It hits the exact same fs-plugin
// ACL bug documented above (the JS-side window.__TAURI__.fs.readTextFile
// call has no fs:allow-* permission granted, since the 2026-08-20 cleanup
// removed them all as "dead" without checking Import still used one) -
// same fix, a custom command doing the read directly with no ACL involved.
#[tauri::command]
fn read_character_file(path: String) -> Result<String, String> {
  std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      save_character,
      list_characters,
      load_character,
      read_character_file,
      get_transfer_folder,
      set_transfer_folder,
      list_transfer_characters,
      load_transfer_character
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
