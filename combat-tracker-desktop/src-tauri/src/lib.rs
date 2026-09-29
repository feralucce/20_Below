// No custom commands - the Combat Tracker's import (a plain <input
// type=file> + FileReader) and roster/combat state (kept in memory on the
// page) don't touch the filesystem, unlike the Character Creator desktop
// app's save/load. This is just a plain webview shell around gm-app/.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // Opens the installer in the real browser from the update screen.
    .plugin(tauri_plugin_opener::init())
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
