import type { ErrorInfo } from 'react'
import { useTranslation } from 'react-i18next'

export function ErrorFallback({ error, errorInfo }: { error: Error; errorInfo: ErrorInfo }) {
  const { t } = useTranslation()
  return <>
    <h1>{t('errorFallback.title')}</h1>
    <details style={{ whiteSpace: 'pre-wrap' }} open={import.meta.env.DEV}>
      <pre>{error?.toString()}{errorInfo?.componentStack}</pre>
    </details>
    {t('errorFallback.tooltip')}
    <ul>
      <li>
        <a href='spirit-oe://github.com/NWYLZW/spirit/issues/new'>
          GitHub
        </a>
      </li>
    </ul>
    {t('errorFallback.quickFix')}
    <a href='' onClick={() => location.reload()}>{t('errorFallback.refresh')}</a>,&nbsp;
    <a href='' onClick={() => /* TODO */ void 0}>{t('errorFallback.reload')}</a>
  </>
}
