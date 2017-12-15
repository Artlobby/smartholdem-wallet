const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'SmartHoldemClient-win32-ia32/'),
    authors: 'TechnoL0g',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'SmartHoldemWallet-Win32-0.1.0.exe',
    setupExe: 'SmartHoldemWinInstaller32.exe',
    setupIcon: path.join(rootPath, 'build', 'icons', 'win', 'icon.ico')
  })
}