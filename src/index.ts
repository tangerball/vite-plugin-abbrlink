import fastGlob from 'fast-glob'
import AbbrLink from './abbrLink'
import { writeFile } from 'fs/promises'
import chokidar from 'chokidar'
import { ResolvedConfig } from 'vite'

// Ensure the value is an array
function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

// Normalize the path
function normalizePath(p: string): string {
  return p.startsWith('/') ? p.slice(1) : p
}

interface Options {
  paths: string | string[]
  [key: string]: any
}

export default function vitePluginAbbrLink({ paths, ...data }: Options) {
  const abbrLink = new AbbrLink(data)

  let watcher: chokidar.FSWatcher | null = null

  // Convert the input paths to an array and remove the leading slash from each path
  const configPaths = ensureArray(paths).map(normalizePath)

  /**
   * Get Markdown files under the specified paths
   */
  const getFileMds = async (_paths: string[]): Promise<string[]> => {
    return await fastGlob(_paths, {
      cwd: process.cwd(),
      absolute: true,
      onlyFiles: true,
      ignore: ['node_modules', '**/__tests__'],
    })
  }

  /**
   * Update the content of a Markdown file
   */
  const updateFileContent = async (filePath: string, newMarkdown: any) => {
    try {
      await writeFile(filePath, newMarkdown.value, 'utf-8')
      console.log(`🚀 ~ Generate abbrlink for ${filePath} file: ${newMarkdown.header?.abbrlink}`)
    } catch (error) {
      console.error(`Error writing to file ${filePath}`, error)
    }
  }

  /**
   * Set abbreviation links
   */
  const setAbbrLink = async (files: string | string[]) => {
    await Promise.all(
      ensureArray(files).map(async (filePath) => {
        try {
          const _data = await abbrLink.getMdData(filePath)
          const { data: frontMatter } = _data
          if (!abbrLink.hasAbbrLink(frontMatter)) {
            // Rebuild the Markdown file
            const newMarkdown = await abbrLink.generateAbbrLink(_data)
            // Write the modified content back to the Markdown file
            await updateFileContent(filePath, newMarkdown)
          }
        } catch (error) {
          console.log(`🚀 ~ Error processing file ${filePath}`, error)
        }
      }),
    )
  }

  return {
    name: 'vite-plugin-abbrLink',
    async buildStart() {
      const _paths = await getFileMds(configPaths)
      // Set all abbreviation links
      await setAbbrLink(_paths)
    },
    configResolved(config: ResolvedConfig) {
      // Set up a file system watcher after the configuration is resolved
      watcher = chokidar.watch(
        configPaths.map((path) => config.root + '/' + path),
        {
          persistent: true,
          ignoreInitial: false,
        },
      )

      watcher.on('change', async (path) => {
        // When a file changes, update its abbreviation link
        await setAbbrLink(path)
      })
    },
    // Clean up resources when the server is closed
    closeBundle() {
      if (watcher) {
        watcher.close()
      }
    },
  }
}
