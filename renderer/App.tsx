import './App.scss'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import favicon from '../resources/icon.png'
import { Configurer } from './components/Configurer'
import { Kbd } from './components/Kbd'
import { Sender } from './components/Sender'
import { Chatrooms } from './extensions/chatroom/Chatrooms'
import { Messages } from './extensions/chatroom/Messages'
import { useEventListener } from './hooks/useEventListener'
import { useElectronStore } from './hooks/useStore'
import { isShortcut } from './utils/isShortcut'

function useDisplay() {
  const [display] = useElectronStore('display')
  useEffect(() => {
    document.body.classList.toggle('displaying', !!display)
    return () => {
      document.body.classList.remove('displaying')
    }
  }, [display])
}

export function App() {
  const { t } = useTranslation()
  useDisplay()
  useEventListener('keydown', e => {
    if (isShortcut(e, ['meta', ','])) {
      e.preventDefault()
      // TODO
    }
  })
  return <>
    <div className='spirit-main'>
      <Sender
        icon={
          <img
            alt='icon'
            src={favicon}
            width={28}
          />
        }
        iconTooltip={
          <>
            {t('Display configure panel')}
            <br />
            <Kbd keys={['meta', ',']} />
          </>
        }
        onIconClick={ctx => ctx.toggleFooter()}
        message={
          <>
            This is a status bar...
          </>
        }
        header={<Chatrooms />}
        footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
