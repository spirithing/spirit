import { useElectronStore } from '../hooks/useStore'

export const useUser = () => {
  const [system] = useElectronStore('system')
  const [user, setUser] = useElectronStore('user', {
    name: system?.username || 'Guest'
  })
  return [user!, setUser] as const
}
