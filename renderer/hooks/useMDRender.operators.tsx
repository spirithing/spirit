/** @jsxImportSource hastscript */
import type { Result } from 'hastscript'

export const Operators = ({ code }: { code: string }): Result =>
  <div className='s-md-code-operators'>
    <div
      className='s-icon copy'
      title='Copy code'
      data-code={code}
    >
      content_copy
    </div>
  </div>
