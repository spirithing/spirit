import { classnames } from '@shikitor/core/utils'
import { pick } from 'lodash-es'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarGroup, Button, DialogPlugin, Input, MessagePlugin, Select, Textarea } from 'tdesign-react'

import { useEventCallback } from '../hooks/useEventCallback'
import type { WithPrefixProps } from '../utils/prefixes'
import { omitPrefixProps, trimPrefixProps } from '../utils/prefixes'
import { uuid } from '../utils/uuid'

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
  next: () => void
  Reader?: (props: ListItemReaderProps<T['option']>) => ReactNode
  Writer?: (props: ListItemWriterProps<T['option']>) => ReactNode
  onCreate?: (item: T) => void
  onDelete?: (uuid: T['uuid'], item: T) => void
  onUpdate?: (item: T) => void
}

function ListItemPreview<T extends ListItem>(props: ListItemPreviewProps<T>) {
  const { prefix } = ListItemPreview
  const { t } = useTranslation()
  const {
    item,
    types,
    next,
    onCreate,
    onDelete,
    onUpdate
  } = props
  const [option, setOption] = useState(() => item?.option)
  const type = useMemo(() => option?.type, [option])
  const changeType = useEventCallback((newType: string) => {
    if (newType === type) return
    const ins = DialogPlugin.confirm({
      body: t('aiService.confirmChangeType'),
      onConfirm: () => {
        setOption({
          type: newType
        })
        ins.destroy()
      },
      onClose: () => ins.destroy()
    })
  })
  const [isEditing, setIsEditing] = useState(false)
  const pickBase = useCallback(() =>
    pick(item, [
      'uuid',
      'name',
      'avatar',
      'description'
    ]), [item])
  const [base, setBase] = useState<
    Partial<Pick<T, 'uuid' | 'name' | 'avatar' | 'description'>>
  >(pickBase)
  useEffect(() => {
    if (!base.uuid) return
    if (base.uuid !== item?.uuid) {
      setOption(item?.option)
      setBase(pickBase())
    }
  }, [base.uuid, item, pickBase])
  return <div className={prefix}>
    <div className={`${prefix}-header`}>
      <Select
        filterable
        readonly={!isEditing}
        size='large'
        className={`${prefix}-header__type-selector`}
        popupProps={{
          overlayInnerStyle: { width: 200 },
          placement: 'bottom-right'
        }}
        value={type}
        onChange={v => changeType(v as string)}
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
            <span
              className='s-icon'
              style={{
                fontSize: 36,
                userSelect: 'none',
                cursor: isEditing ? 'pointer' : 'default'
              }}
              onClick={e => {
                if (!isEditing) return

                e.stopPropagation()
                console.log('upload')
              }}
            >
              {isEditing ? 'upload' : 'image'}
            </span>
          }
        />}
      <div className={`${prefix}-header__base`}>
        <div className={`${prefix}-header__title`}>
          {isEditing
            ? <Input
              defaultValue={item?.name}
              value={base.name}
              onChange={v => setBase({ ...base, name: v })}
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
                    const result = {
                      ...item,
                      ...base,
                      option: { ...item?.option, ...option }
                    }
                    const type = !result.uuid ? 'create' : 'update'
                    if (result.uuid === undefined) {
                      result.uuid = uuid()
                    }
                    if (result.name === undefined || result.name === '') {
                      MessagePlugin.error(t('required', { name: t('name') }))
                      return
                    }
                    setIsEditing(false)
                    switch (type) {
                      case 'create':
                        onCreate?.(result as T)
                        break
                      case 'update':
                        onUpdate?.(result as T)
                        break
                    }
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
                <Button
                  variant='outline'
                  shape='square'
                  onClick={() => setIsEditing(true)}
                >
                  <span className='s-icon'>edit</span>
                </Button>
                {item && <Button
                  variant='outline'
                  shape='square'
                  theme='danger'
                  onClick={() => {
                    onDelete?.(item.uuid, item)
                    next()
                  }}
                >
                  <span className='s-icon'>delete</span>
                </Button>}
              </>}
          </div>
        </div>
        <div className={`${prefix}-header__description`}>
          {isEditing
            ? <Textarea
              rows={5}
              placeholder={t('placeholder.description')}
              defaultValue={item?.description}
              value={base.description}
              onChange={v => setBase({ ...base, description: v })}
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
  onAdd: () => void
  activeUUID: T['uuid'] | undefined
  onActiveChange: (uuid: T['uuid'] | undefined) => void
}
function List(props: ListProps<ListItem>) {
  const { prefix } = List
  const { t } = useTranslation()
  const { list, types, activeUUID, onActiveChange, onAdd } = props
  const [keywords, setKeywords] = useState('')
  const filteredList = useMemo(() => {
    if (!keywords) return list
    const keywordArr = keywords.toLowerCase().split(' ').filter(Boolean)
    return list?.filter(item =>
      keywordArr.every(keyword =>
        item.name.toLowerCase().includes(keyword)
        || (item.description && item.description.toLowerCase().includes(keyword))
      )
    )
  }, [keywords, list])
  return <div className={prefix}>
    <div className={`${prefix}-header`}>
      <Input
        placeholder={t('search')}
        value={keywords}
        onChange={v => setKeywords(v)}
      />
      <div className={`${prefix}-header__operations`}>
        <Button
          variant='text'
          shape='square'
          onClick={onAdd}
        >
          <span className='s-icon'>add</span>
        </Button>
        <Button variant='text' shape='square'>
          <span className='s-icon'>filter_alt</span>
        </Button>
      </div>
    </div>
    {filteredList?.map(item =>
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
    Omit<ListItemPreviewProps<T>, 'item' | 'types' | 'next'>,
    'itemPreview'
  >

export function ListWithPreview<T extends ListItem>(props: ListWithPreviewProps<T>) {
  const { t } = useTranslation()
  const [itemPreviewProps, {
    className,
    style,
    list,
    types
  }] = omitPrefixProps(props, 'itemPreview')
  const [activeUUID, setActiveUUID] = useState<string | undefined>(list?.[0].uuid)
  const activeIndex = useMemo(() => list?.findIndex(item => item.uuid === activeUUID), [activeUUID, list])
  const item = useMemo<T | undefined>(() => {
    if (activeIndex === undefined) return
    if (activeIndex === -1) return list![0]
    return list![activeIndex]
  }, [activeIndex, list])
  return <div
    className={classnames('spirit-list-wrap', className)}
    style={style}
  >
    <List
      list={list}
      types={types}
      activeUUID={activeUUID}
      onActiveChange={setActiveUUID}
      onAdd={() => {
        const newItem = {
          uuid: uuid(),
          name: t('untitled'),
          option: {
            type: Object.keys(types)[0]
          }
        } as T
        itemPreviewProps['itemPreview:onCreate']?.(newItem)
        setActiveUUID(newItem.uuid)
      }}
    />
    {item && <ListItemPreview
      next={() => {
        let nextItem: T | undefined
        if (activeIndex === -1 || activeIndex === undefined) {
          nextItem = list?.[0]
        } else {
          nextItem = list?.[activeIndex + 1] ?? list?.[activeIndex - 1] ?? list?.[0]
        }
        setActiveUUID(nextItem?.uuid)
      }}
      {...{ item, types }}
      {...trimPrefixProps(itemPreviewProps, 'itemPreview')}
    />}
  </div>
}
