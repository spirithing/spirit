import { classnames } from '@shikitor/core/utils'
import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Avatar, AvatarGroup, Button, Input, Select, Textarea } from 'tdesign-react'

import type { WithPrefixProps } from '../utils/prefixes'
import { omitPrefixProps, trimPrefixProps } from '../utils/prefixes'

export interface ListType {
  label: string
  image: string
}

export interface ListItem {
  uuid: string
  name: string
  description?: string
  avatar?: string
  option?: {
    type: string
  } & Record<string, unknown>
}

export interface ListItemReaderProps<T> {
  value?: T
}

export interface ListItemWriterProps<T> {
  value?: T
}

interface ListItemPreviewProps<T extends ListItem> {
  item: T | undefined
  types: {
    [key: string]: ListType
  }
  Reader?: (props: ListItemReaderProps<T['option']>) => ReactNode
  Writer?: (props: ListItemWriterProps<T['option']>) => ReactNode
  onCreate?: (item: T) => void
  onDelete?: (uuid: T['uuid'], item: T) => void | number
  onUpdate?: (item: T) => void
}

function ListItemPreview<T extends ListItem>(props: ListItemPreviewProps<T>) {
  const { prefix } = ListItemPreview
  const {
    item,
    types
  } = props
  const type = useMemo(() => item?.option?.type, [item])
  const [isEditing, setIsEditing] = useState(false)
  return <div className={prefix}>
    <div className={`${prefix}-header`}>
      <Select
        filterable
        size='large'
        className={`${prefix}-header__type-selector`}
        popupProps={{
          overlayInnerStyle: { width: 200 },
          placement: 'bottom-right'
        }}
        value={type}
        options={[
          ...Object
            .entries(types)
            .map(([key, { label, image }]) => ({
              label,
              content: <div className={`${prefix}-header__type-selector-option`}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <span>{label}</span>
              </div>,
              value: key
            }))
        ]}
        prefixIcon={type
          ? <div
            style={{
              width: 28,
              height: 28,
              backgroundImage: `url(${types[type]?.image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          : undefined}
        suffixIcon={<></>}
      />
      {item?.avatar
        ? <Avatar size='160px' image={item.avatar} />
        : <Avatar
          size='160px'
          icon={
            <>
              <span className='s-icon' style={{ fontSize: 36, userSelect: 'none' }}>upload</span>
            </>
          }
        />}
      <div className={`${prefix}-header__base`}>
        <div className={`${prefix}-header__title`}>
          {isEditing
            ? <Input
              defaultValue={item?.name}
            />
            : item?.name}
          <div className={`${prefix}-header__operations`}>
            {isEditing
              ? <>
                <Button
                  variant='outline'
                  shape='square'
                  theme='success'
                  onClick={() => {
                    setIsEditing(false)
                  }}
                >
                  <span className='s-icon'>check</span>
                </Button>
                <Button
                  variant='outline'
                  shape='square'
                  onClick={() => {
                    setIsEditing(false)
                  }}
                >
                  <span className='s-icon'>close</span>
                </Button>
              </>
              : <>
                <Button variant='outline' shape='square' onClick={() => setIsEditing(true)}>
                  <span className='s-icon'>edit</span>
                </Button>
                <Button variant='outline' shape='square' theme='danger'>
                  <span className='s-icon'>delete</span>
                </Button>
              </>}
          </div>
        </div>
        <div className={`${prefix}-header__description`}>
          {isEditing
            ? <Textarea
              defaultValue={item?.description}
              rows={5}
            />
            : item?.description ?? '--'}
        </div>
      </div>
    </div>
    <div className={`${prefix}-content`}>
    </div>
  </div>
}
ListItemPreview.prefix = `${'spirit'}-list-item-preview`

interface ListProps<T extends ListItem> {
  list: T[] | undefined
  types: {
    [key: string]: ListType
  }
  activeUUID: T['uuid'] | undefined
  onActiveChange: (uuid: T['uuid']) => void
}
function List(props: ListProps<ListItem>) {
  const { prefix } = List
  const { list, types, activeUUID, onActiveChange } = props
  return <div className={prefix}>
    <div className={`${prefix}-header`}>
      <Input />
      <div className={`${prefix}-header__operations`}>
        <Button variant='text' shape='square'>
          <span className='s-icon'>add</span>
        </Button>
        <Button variant='text' shape='square'>
          <span className='s-icon'>filter_alt</span>
        </Button>
      </div>
    </div>
    {list?.map(item =>
      <div
        key={item.uuid}
        className={classnames(`${prefix}-item`, {
          active: item.uuid === activeUUID
        })}
        onClick={() => onActiveChange(item.uuid)}
      >
        <AvatarGroup cascading='left-up'>
          {item.avatar
            ? <Avatar image={item.avatar} />
            : null}
          {item.option?.type && types[item.option.type]?.image
            ? <Avatar
              image={types[item.option.type].image}
              imageProps={{
                fit: 'cover'
              }}
            />
            : <Avatar icon={<span className='s-icon'>null</span>} />}
        </AvatarGroup>
        <div className={`${prefix}-item__content`}>
          <div className={`${prefix}-item__title`}>
            {item.name}
          </div>
          {item.description && <div className={`${prefix}-item__description`}>
            {item.description}
          </div>}
        </div>
        <div className={`${prefix}-item__operations`}>
          <Button variant='text' shape='square'>
            <span className='s-icon'>more_vert</span>
          </Button>
        </div>
      </div>
    )}
  </div>
}

List.prefix = `${'spirit'}-list`

export type ListWithPreviewProps<T extends ListItem> =
  & {
    style?: CSSProperties
    className?: string
    list: T[] | undefined
    types: {
      [key: string]: ListType
    }
  }
  & WithPrefixProps<
    Omit<ListItemPreviewProps<T>, 'item' | 'types'>,
    'itemPreview'
  >

export function ListWithPreview<T extends ListItem>(props: ListWithPreviewProps<T>) {
  const [itemPreviewProps, {
    className,
    style,
    list,
    types
  }] = omitPrefixProps(props, 'itemPreview')
  const [activeUUID, setActiveUUID] = useState<string | undefined>(list?.[0].uuid)
  const item = useMemo(() => {
    if (!list) return
    if (!activeUUID) return list[0]
    return list?.find(item => item.uuid === activeUUID)
  }, [activeUUID, list])
  return <div
    className={classnames('spirit-list-wrap', className)}
    style={style}
  >
    <List
      list={list}
      types={types}
      activeUUID={activeUUID}
      onActiveChange={setActiveUUID}
    />
    {item && <ListItemPreview
      {...{ item, types }}
      {...trimPrefixProps(itemPreviewProps, 'itemPreview')}
    />}
  </div>
}
