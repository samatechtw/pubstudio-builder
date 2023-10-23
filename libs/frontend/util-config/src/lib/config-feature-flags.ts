import { ExecEnv } from '@pubstudio/shared/util-core'
import { EXEC_ENV } from './config-env'

export const isDev = EXEC_ENV === ExecEnv.Development
export const isStg = EXEC_ENV === ExecEnv.Staging
export const isProd = EXEC_ENV === ExecEnv.Production
export const isTest = EXEC_ENV === ExecEnv.Test
export const isCI = EXEC_ENV === ExecEnv.CI
