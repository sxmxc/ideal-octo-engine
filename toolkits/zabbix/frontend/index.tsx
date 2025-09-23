import type { CSSProperties } from 'react'

import { getReactRuntime, getReactRouterRuntime } from './runtime'

import ZabbixBulkHostsPage from './pages/ZabbixBulkHostsPage'
import ZabbixOverviewPage from './pages/ZabbixOverviewPage'
import ZabbixAdministrationPage from './pages/ZabbixSettingsPage'
import ZabbixBulkExportPage from './pages/ZabbixBulkExportPage'
import ZabbixDbScriptsPage from './pages/ZabbixDbScriptsPage'

const React = getReactRuntime()
const ReactRouterDom = getReactRouterRuntime()
const { NavLink, Navigate, Route, Routes } = ReactRouterDom


const toolkitStyles = {
  wrapper: {
    padding: '1.5rem',
    display: 'grid',
    gap: '1.5rem',
    color: 'var(--color-text-primary)',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  navLink: (active: boolean) => ({
    padding: '0.5rem 0.9rem',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: active ? 'var(--color-accent)' : 'transparent',
    color: active ? 'var(--color-sidebar-item-active-text)' : 'var(--color-link)',
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  }),
}

const iconStyle: CSSProperties = {
  fontSize: '1.15rem',
  lineHeight: 1,
  color: 'var(--color-link)',
}


const subNav = [
  { label: 'Overview', to: '', icon: 'dashboard' },
  { label: 'Administration', to: 'administration', icon: 'settings_applications' },
  { label: 'Bulk Host Actions', to: 'actions/bulk-hosts', icon: 'group_add' },
  { label: 'Bulk Exports', to: 'actions/bulk-export', icon: 'dataset' },
  { label: 'Database Scripts', to: 'actions/db-scripts', icon: 'playlist_add_check' },
]


export default function ZabbixToolkitLayout() {
  return (
    <div className="tk-card" style={toolkitStyles.wrapper}>
      <header>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className="material-symbols-outlined" style={iconStyle} aria-hidden>
            hub
          </span>
          Zabbix Toolkit
        </h3>
        <p style={{ margin: '0.3rem 0 0', color: 'var(--color-text-secondary)' }}>
          Manage Zabbix API endpoints, toolkit settings, and automation actions.
        </p>
      </header>

      <nav style={toolkitStyles.nav}>
        {subNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === ''}
            style={({ isActive }) => toolkitStyles.navLink(isActive)}
          >
            <span className="material-symbols-outlined" style={iconStyle} aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <section>
        <Routes>
          <Route index element={<ZabbixOverviewPage />} />
          <Route path="administration" element={<ZabbixAdministrationPage />} />
          <Route path="actions/bulk-hosts" element={<ZabbixBulkHostsPage />} />
          <Route path="actions/bulk-export" element={<ZabbixBulkExportPage />} />
          <Route path="actions/db-scripts" element={<ZabbixDbScriptsPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </section>
    </div>
  )
}
