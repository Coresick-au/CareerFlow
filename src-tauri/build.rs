use std::fs;
use std::path::Path;

fn main() {
  let icon_path = Path::new("icons").join("icon.ico");
  if !icon_path.exists() {
    if let Some(parent) = icon_path.parent() {
      let _ = fs::create_dir_all(parent);
    }

    // Minimal 1x1, 32-bit BGRA ICO (single white pixel). This is only to unblock
    // Windows dev builds when no icon assets have been generated yet.
    //
    // ICONDIR (6) + ICONDIRENTRY (16) + BITMAPINFOHEADER (40) + pixel (4) + AND mask (4)
    let ico_bytes: [u8; 70] = [
      // ICONDIR
      0x00, 0x00, // reserved
      0x01, 0x00, // type: icon
      0x01, 0x00, // count
      // ICONDIRENTRY
      0x01, // width
      0x01, // height
      0x00, // color count
      0x00, // reserved
      0x01, 0x00, // planes
      0x20, 0x00, // bit count (32)
      0x30, 0x00, 0x00, 0x00, // bytes in res (48)
      0x16, 0x00, 0x00, 0x00, // image offset (22)
      // BITMAPINFOHEADER (40)
      0x28, 0x00, 0x00, 0x00, // header size
      0x01, 0x00, 0x00, 0x00, // width
      0x02, 0x00, 0x00, 0x00, // height (includes AND mask)
      0x01, 0x00, // planes
      0x20, 0x00, // bit count (32)
      0x00, 0x00, 0x00, 0x00, // compression
      0x04, 0x00, 0x00, 0x00, // image size (XOR bitmap)
      0x00, 0x00, 0x00, 0x00, // x pixels per meter
      0x00, 0x00, 0x00, 0x00, // y pixels per meter
      0x00, 0x00, 0x00, 0x00, // colors used
      0x00, 0x00, 0x00, 0x00, // important colors
      // Pixel BGRA (white)
      0xFF, 0xFF, 0xFF, 0xFF,
      // AND mask (4 bytes, 0 = opaque)
      0x00, 0x00, 0x00, 0x00,
    ];

    let _ = fs::write(&icon_path, ico_bytes);
  }

  tauri_build::build();
}
