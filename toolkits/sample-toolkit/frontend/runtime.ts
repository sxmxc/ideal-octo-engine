import type * as ReactNamespace from 'react'

export type ToolkitRuntime = {
  react: typeof ReactNamespace
}

declare global {
  interface Window {
    __SRE_TOOLKIT_RUNTIME?: ToolkitRuntime
  }
}

export function getToolkitRuntime(): ToolkitRuntime {
  if (typeof window === 'undefined' || !window.__SRE_TOOLKIT_RUNTIME) {
    throw new Error('SRE Toolkit runtime not injected yet')
  }
  return window.__SRE_TOOLKIT_RUNTIME
}

export function getReactRuntime() {
  return getToolkitRuntime().react
}
