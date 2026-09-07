// No custom commands. Encounter Prep reads character files through the
// page's own <input type=file> and keeps its table in localStorage, and it
// fetches weapons.md straight from the repo the way the character creator
// does - so nothing here needs filesystem access. A plain webview shell
// around prep/.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
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
