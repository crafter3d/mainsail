import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const isWindows = process.platform === 'win32'

if (!existsSync('dist')) {
    console.error('dist folder not found. Run `npm run build` first.')
    process.exit(1)
}

if (isWindows) {
    const command = [
        "if (Test-Path 'dist/mainsail.zip') { Remove-Item 'dist/mainsail.zip' -Force }",
        "Compress-Archive -Path 'dist/*' -DestinationPath 'dist/mainsail.zip' -Force",
    ].join('; ')

    const result = spawnSync('powershell', ['-NoProfile', '-Command', command], { stdio: 'inherit' })
    process.exit(result.status ?? 1)
}

const result = spawnSync('sh', ['-c', "cd ./dist && rm -f mainsail.zip && zip -r mainsail.zip ./ -x '**.DS_Store' ./"], {
    stdio: 'inherit',
})

process.exit(result.status ?? 1)
