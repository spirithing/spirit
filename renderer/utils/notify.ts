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
    /**
     * @default false
     */
    autoClose?: boolean | number

    onClick?: (e: Event) => void
    onClose?: (e: Event) => void
  }
) => {
  const {
    type = 'info',
    autoClose = false,
    onClick,
    onClose
  } = options || {}
  const notification = new Notification(options?.title || 'Spirit', {
    body: text,
    icon: type === 'info' ? undefined : {
      error: errorIcon,
      success: successIcon,
      warn: warnIcon
    }[type]
  })
  notification.onclick = onClick ?? null
  notification.onclose = onClose ?? null
  if (autoClose) {
    setTimeout(() => {
      notification.close()
    }, typeof autoClose === 'number' ? autoClose : 5000)
  }
}
