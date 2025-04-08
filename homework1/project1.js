// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgData, fgData, fgOpac, fgPos) {
    const bg = bgData.data;
    const fg = fgData.data;
  
    for (let y = 0; y < fgData.height; y++) {
      for (let x = 0; x < fgData.width; x++) {
        const fgX = x;
        const fgY = y;
        const bgX = x + fgPos.x;
        const bgY = y + fgPos.y;
  
        if (bgX < 0 || bgX >= bgData.width || bgY < 0 || bgY >= bgData.height) continue;
  
        const fgIndex = (fgY * fgData.width + fgX) * 4;
        const bgIndex = (bgY * bgData.width + bgX) * 4;
  
        const fgAlpha = (fg[fgIndex + 3] / 255) * fgOpac;
  
        for (let c = 0; c < 3; c++) {
          bg[bgIndex + c] = fgAlpha*fg[fgIndex + c] + (1-fgAlpha)*bg[bgIndex + c] ;
        }
  
        bg[bgIndex + 3] = 255;
      }
    }
}