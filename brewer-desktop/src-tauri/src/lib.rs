// A webview shell around brew/, plus one command.
//
// The Brewery opens and saves markdown through the page's own file
// plumbing, so nothing here needs filesystem access for that. What it does
// need is a way to produce a PDF.
//
// window.print() hands the job to the webview's print dialog, and on
// Windows that dialog lists printers - including "Microsoft Print to PDF",
// which is a printer and behaves like one. It rasterises: a 53-page
// chapter came out as 25 MB of JPEG with no text layer, nothing
// selectable, nothing searchable, every typeface flattened to pixels.
// There is no "Save as PDF" destination to pick instead, so telling
// somebody to pick one was telling them to do what the app cannot.
//
// WebView2 will write the PDF itself, which is what a browser's own "Save
// as PDF" does: vector text, embedded fonts, a fraction of the size. No
// dialog in the way, so nothing to pick wrongly.

#[cfg(windows)]
#[tauri::command]
async fn save_pdf(
    window: tauri::WebviewWindow,
    path: String,
    width_in: f64,
    height_in: f64,
) -> Result<(), String> {
    use std::sync::mpsc::channel;
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2Environment6, ICoreWebView2_2, ICoreWebView2_7,
    };
    use webview2_com::PrintToPdfCompletedHandler;
    use windows::core::{Interface, HSTRING};

    let (tx, rx) = channel::<Result<(), String>>();

    window
        .with_webview(move |webview| {
            let run = || -> Result<(), String> {
                let controller = webview.controller();
                let core = unsafe { controller.CoreWebView2() }
                    .map_err(|e| format!("no webview: {e}"))?;

                // The page is already laid out at the trim size by @page in
                // brew.css, so the sheet here has to match it exactly and
                // add nothing of its own: no margins, and backgrounds
                // printed rather than dropped. A page of this book is
                // almost entirely background.
                let env: ICoreWebView2Environment6 = unsafe {
                    core.cast::<ICoreWebView2_2>()
                        .map_err(|e| format!("webview too old: {e}"))?
                        .Environment()
                        .map_err(|e| format!("no environment: {e}"))?
                        .cast()
                        .map_err(|e| format!("environment too old: {e}"))?
                };
                let settings = unsafe { env.CreatePrintSettings() }
                    .map_err(|e| format!("no print settings: {e}"))?;
                unsafe {
                    let _ = settings.SetPageWidth(width_in);
                    let _ = settings.SetPageHeight(height_in);
                    let _ = settings.SetMarginTop(0.0);
                    let _ = settings.SetMarginBottom(0.0);
                    let _ = settings.SetMarginLeft(0.0);
                    let _ = settings.SetMarginRight(0.0);
                    let _ = settings.SetShouldPrintBackgrounds(true);
                    let _ = settings.SetShouldPrintHeaderAndFooter(false);
                    let _ = settings.SetScaleFactor(1.0);
                }

                let target: ICoreWebView2_7 = core
                    .cast()
                    .map_err(|e| format!("this WebView2 cannot write PDFs: {e}"))?;

                let out = tx.clone();
                let handler = PrintToPdfCompletedHandler::create(Box::new(move |res, ok| {
                    let _ = out.send(match res {
                        Ok(()) if ok => Ok(()),
                        Ok(()) => Err("the webview declined to write the file".into()),
                        Err(e) => Err(format!("{e}")),
                    });
                    Ok(())
                }));

                unsafe {
                    target
                        .PrintToPdf(&HSTRING::from(path.as_str()), &settings, &handler)
                        .map_err(|e| format!("could not start the export: {e}"))
                }
            };
            if let Err(e) = run() {
                let _ = tx.send(Err(e));
            }
        })
        .map_err(|e| format!("could not reach the webview: {e}"))?;

    // PrintToPdf is asynchronous and a long chapter takes a while to
    // render, so the wait goes on a blocking thread rather than the one
    // drawing the window.
    tauri::async_runtime::spawn_blocking(move || {
        rx.recv()
            .unwrap_or_else(|_| Err("the export ended without saying so".into()))
    })
    .await
    .map_err(|e| format!("{e}"))?
}

#[cfg(not(windows))]
#[tauri::command]
async fn save_pdf(_path: String, _width_in: f64, _height_in: f64) -> Result<(), String> {
    Err("Saving a PDF directly is Windows-only for now - use Print instead.".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_pdf])
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
