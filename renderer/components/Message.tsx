import './Message.scss'

import React from 'react'
import type { IMessage, IUser } from 'spirit'
import { Button } from 'tdesign-react'

import { classnames } from '../utils/classnames'

type NestedPropsGenerator<Prefix extends string, T> = {
  [K in keyof T as `${Prefix}:${K & string}`]?: T[K]
}

interface OnClicks {
  avatar(value: IUser): void
  name(value: IUser): void
}

export type MessageProps = NestedPropsGenerator<'onClick', OnClicks> & {
  className?: string
  value: IMessage
  onChange?(value: IMessage): void
  onDelete?(): void
  textRender?(text: string): React.ReactNode
}

export function Message(props: MessageProps) {
  const { className, value, textRender } = props
  const callFunc = <P extends keyof MessageProps & (`onClick:${string}`)>(
    key: P,
    ...args: Parameters<NonNullable<MessageProps[P]>>
  ) => {
    const fn = props[key]
    // @ts-ignore
    if (typeof fn === 'function') fn(...args)
  }
  const { user } = value
  return (
    <>
      <div className={classnames('message-header', className)}>
        {user && <div className='message-name' onClick={() => callFunc('onClick:name', user)}>
          {user.name}
        </div>}
        <div className='message-actions'>
          <Button
            variant='text'
            shape='square'
            size='small'
          >
            <span className='s-icon'>fork_right</span>
          </Button>
          <Button
            variant='text'
            shape='square'
            size='small'
          >
            <span className='s-icon'>edit</span>
          </Button>
          <Button
            variant='text'
            shape='square'
            size='small'
            theme='danger'
          >
            <span className='s-icon'>delete</span>
          </Button>
        </div>
      </div>
      <div className={classnames('message-content', className)}>
        {textRender?.(value.text) ?? value.text}
        <div className='message-time'>{new Date(value.ctime).toLocaleString()}</div>
      </div>
    </>
  )
}
