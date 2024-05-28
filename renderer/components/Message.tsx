import './Message.scss'

import React from 'react'

type NestedPropsGenerator<Prefix extends string, T> = {
  [K in keyof T as `${Prefix}:${K & string}`]?: T[K]
}

export interface IUser {
  name: string
  avatar?: string
}
export type IMessage = {
  text: string
  user?: IUser
  ctime: Date | number | string
  mtime?: Date | number | string
}

interface OnClicks {
  avatar(value: IUser): void
  name(value: IUser): void
}

export type MessageProps = NestedPropsGenerator<'onClick', OnClicks> & {
  value: IMessage
  onChange?(value: IMessage): void
  onDelete?(): void
  textRender?(text: string): React.ReactNode
}

export function Message(props: MessageProps) {
  const { value, onChange, onDelete, textRender } = props
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
    <div className='message'>
      {user
        ? (
          <>
            <div className='message-content'>
              <div className='message-header'>
                <div className='message-name' onClick={() => callFunc('onClick:name', user)}>
                  {user.name}
                </div>
              </div>
              {textRender?.(value.text) ?? value.text}
            </div>
            <div className='message-actions'>
              <span className='shikitor-icon'>edit</span>
              <span className='shikitor-icon'>delete</span>
            </div>
            <div className='message-time'>{new Date(value.ctime).toLocaleString()}</div>
          </>
        )
        : (
          <>
            Not supported message type
          </>
        )}
    </div>
  )
}
