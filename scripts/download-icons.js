import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICONS = {
  COMPUTER: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/computer.png',
  RECYCLE_BIN: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/recycle-bin.png',
  DOCUMENTS: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/documents.png',
  SETTINGS: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/settings.png',
  TRASH: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/trash.png',
  FOLDER: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/folder.png',
  FILE: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/file.png',
  IMAGE: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/image.png',
  MUSIC: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/music.png',
  VIDEO: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/video.png',
  PDF: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/pdf.png',
  WORD: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/word.png',
  EXCEL: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/excel.png',
  POWERPOINT: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/powerpoint.png',
  CALENDAR: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/calendar.png',
  CALCULATOR: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/calculator.png',
  NOTEPAD: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/notepad.png',
  PAINT: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/paint.png',
  TERMINAL: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/terminal.png',
  BROWSER: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/browser.png',
  MAIL: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/mail.png',
  CHAT: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/chat.png',
  GAMES: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/games.png',
  STORE: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/store.png',
  HELP: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/help.png',
  SHUTDOWN: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/shutdown.png',
  RESTART: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/restart.png',
  SLEEP: 'https://raw.githubusercontent.com/stephanos/stephanos-os/main/public/icons/sleep.png',
}

const ICONS_DIR = path.join(path.dirname(__dirname), 'public', 'icons')

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
}

// Download each icon
Object.entries(ICONS).forEach(([name, url]) => {
  const fileName = `${name.toLowerCase().replace(/_/g, '-')}.png`
  const filePath = path.join(ICONS_DIR, fileName)

  https.get(url, (response) => {
    if (response.statusCode === 200) {
      response.pipe(fs.createWriteStream(filePath))
      console.log(`Downloaded: ${fileName}`)
    } else {
      console.error(`Failed to download ${fileName}: ${response.statusCode}`)
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${fileName}:`, err)
  })
}) 