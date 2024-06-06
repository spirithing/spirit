import './Message.scss'

import type { Shikitor } from '@shikitor/core'
import type { EditorProps } from '@shikitor/react'
import { Editor } from '@shikitor/react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useRef, useState } from 'react'
import type { IMessage, IUser } from 'spirit'
import { Avatar, Button } from 'tdesign-react'

import { useHighlightTheme } from '../providers/theme'
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
  onTextChange?(text: string): void
  onDelete?(): void
  textRender?(text: string): ReactNode
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
  const shikitorRef = useRef<Shikitor>(null)
  const [isEditing, setIsEditing] = useState(false)
  const highlightTheme = useHighlightTheme()
  const editorOptions = useMemo<EditorProps['options']>(() => ({
    language: 'markdown',
    theme: highlightTheme,
    autoSize: { minRows: 3, maxRows: 20 }
  }), [highlightTheme])
  return (
    <motion.div
      className={classnames('message', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring' }}
    >
      <div className={classnames('message-header')}>
        <Avatar
          size='small'
          content={user?.name.slice(0, 1)}
        />
        {user && <div className='message-name' onClick={() => callFunc('onClick:name', user)}>
          {user.name}
        </div>}
        <div className='message-time'>{new Date(value.ctime).toLocaleString()}</div>
      </div>
      <div className={classnames('message-content')}>
        {isEditing
          ? <Editor
            ref={shikitorRef}
            value={value.text}
            options={editorOptions}
          />
          : <>
            {textRender?.(value.text) ?? value.text}
          </>}
      </div>
      <div className='message-actions'>
        {!isEditing && <Button
          variant='outline'
          shape='square'
          size='small'
        >
          <span className='s-icon'>fork_right</span>
        </Button>}
        {!isEditing && <Button
          variant='outline'
          shape='square'
          size='small'
          onClick={() => setIsEditing(true)}
        >
          <span className='s-icon'>edit</span>
        </Button>}
        {isEditing && <Button
          variant='outline'
          shape='square'
          size='small'
          theme='success'
          onClick={() => {
            setIsEditing(false)
            props.onTextChange?.(shikitorRef.current?.value ?? '')
          }}
        >
          <span className='s-icon'>check</span>
        </Button>}
        {isEditing && <Button
          variant='outline'
          shape='square'
          size='small'
          onClick={() => setIsEditing(false)}
        >
          <span className='s-icon'>close</span>
        </Button>}
        {!isEditing && <Button
          variant='outline'
          shape='square'
          size='small'
          theme='danger'
          onClick={props.onDelete}
        >
          <span className='s-icon'>delete</span>
        </Button>}
      </div>
    </motion.div>
  )
}
