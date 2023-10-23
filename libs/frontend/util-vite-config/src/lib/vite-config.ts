import { BuildOptions } from 'vite'

export const appConfigServer = {
  fs: {
    strict: true,
    allow: ['../../'],
  },
}

export const assetsInclude = /\.(pdf|jpg|png|webm|mp4|svg)$/

export const appConfigBuild: BuildOptions = { emptyOutDir: true }
