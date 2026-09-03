// No custom commands. The Brewer opens and saves markdown through the
// page's own <input type=file> and download-link plumbing, and prints
// through the webview's print dialog, so nothing here needs filesystem
// access. This is a plain webview shell around brew/.
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
