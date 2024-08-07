import fs from 'node:fs'

const tag = process.env.GITHUB_TAG
const matrixOSName = process.env.GITHUB_MATRIX_OS_NAME

const suffixes = {
  'macOS-latest': '.apple.dmg'
}
const suffix = suffixes[matrixOSName]

const installers = {
  'macOS-latest': /spirit-.*.dmg/
}
const installer = installers[matrixOSName]

const distFiles = fs.readdirSync('dist')
const installerFile = distFiles.find(file => file.match(installer))
if (!installerFile) {
  throw new Error(`Installer file not found`)
}
const installerPath = `dist/${installerFile}`
const newInstallerPath = `spirit-${tag}${suffix}`

fs.cpSync(installerPath, newInstallerPath)
console.log(newInstallerPath)
