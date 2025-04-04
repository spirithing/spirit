import { bridge } from '../bridge'
import { electronStore, getFromStore, keyAtom } from '../store'
import { defineTool, t } from './core/defineTool'

export const openApplication = defineTool(
  t.object({
    appName: t.string()
  }, {
    title: 'openApplication',
    description: 'Open an application'
  }),
  async ({ appName }) => {
    const applications = getFromStore('applications')
    const app = applications?.find(({ name }) => name.includes(appName))
    if (!app) {
      return `Application "${appName}" not found`
    }
    await bridge.openApplication(app.path)
    electronStore.set(keyAtom('display')!, false)
    return 'Application opened'
  }
)

export const listApplication = defineTool(
  t.object({}, {
    title: 'listApplication',
    description: 'List all applications'
  }),
  () => {
    const applications = getFromStore('applications')
    if (!applications) {
      return 'No applications found'
    }
    return applications.map(({ name }) => `- ${name}`).join('\n')
  }
)
