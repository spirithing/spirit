import errorIcon from '#renderer/assets/state/error.png'
import successIcon from '#renderer/assets/state/success.png'
import warnIcon from '#renderer/assets/state/warn.png'

export const notify = (
  text: string,
  options?: {
    /**
     * @default 'info'
     */
    type?: 'info' | 'success' | 'warn' | 'error'
    title?: string
  }
) => {
  const type = options?.type || 'info'
  const notification = new Notification(options?.title || 'Spirit', {
    body: text,
    icon: type === 'info' ? undefined : {
      error: errorIcon,
      success: successIcon,
      warn: warnIcon
    }[type],
    ...options
  })
  notification.onclick = (e) => {
    console.log('Notification clicked:', e)
  }
  notification.onclose = (e) => {
    console.log('Notification closed:', e)
  }
  setTimeout(() => {
    notification.close()
  }, 5000)
}
