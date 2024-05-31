import { useElectronStore } from '../store'

export const useUser = () => {
  const [system] = useElectronStore('system')
  return useElectronStore('user', {
    name: system?.username || 'Guest'
  })
}
