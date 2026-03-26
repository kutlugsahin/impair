import { config } from '../utils/config'
import { installHook } from './hook'

if (typeof window !== 'undefined' && (config as any).devtools !== false) {
  installHook()
}
