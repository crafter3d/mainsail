import fs from 'fs'
import path from 'path'
import { version } from '../../package.json'
import { PluginOption } from 'vite'

/**
 * Custom build plugin to write the version in a dedicated release_info.json file after bundling
 */

export default function buildReleaseInfo(): PluginOption {
    return {
        name: 'build-release_info',
        writeBundle: () => {
            setImmediate(async () => {
                const versionIdentifier = version.toString()
                const [repositoryOwner, repositoryName] =
                    process.env.GITHUB_REPOSITORY?.split('/') ?? ['crafter3d', 'mainsail']
                const releaseInfoFile = await fs.promises.open(
                    path.resolve(__dirname, '../../dist/release_info.json'),
                    'w'
                )
                await releaseInfoFile.writeFile(
                    JSON.stringify({
                        project_name: repositoryName,
                        project_owner: repositoryOwner,
                        version: `v${versionIdentifier}`,
                    })
                )
                await releaseInfoFile.close()
            })
        },
    }
}
