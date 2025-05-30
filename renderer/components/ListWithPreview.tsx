import './ListWithPreview.scss'

import { classnames } from '@shikitor/core/utils'
import { pick } from 'lodash-es'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchIcon } from 'tdesign-icons-react'
import {
  Avatar,
  AvatarGroup,
  Button,
  DialogPlugin,
  Input,
  Link,
  MessagePlugin,
  Popconfirm,
  Select,
  Textarea,
  Tooltip,
  Upload
} from 'tdesign-react'
import type { UploadFile } from 'tdesign-react/es/upload/type'

import notFound from '../assets/not_found.svg'
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
  options: {
    type: string
  } & Record<string, unknown>
}

export interface ListItemReaderProps<T extends ListItem['options']> {
  value?: T
}

export interface ListItemWriterProps<T extends ListItem['options']> {
  isEditing: boolean
  value: T
  onChange: (value: T) => void
  onOnConfirm: (onConfirm: (value: T) => void) => () => void
}

interface ListItemPreviewProps<T extends ListItem> {
  item: T
  types: {
    [key: string]: ListType
  }
  next: () => void
  Reader?: (props: ListItemReaderProps<T['options']>) => ReactNode
  Writer?: (props: ListItemWriterProps<T['options']>) => ReactNode
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
    onDelete,
    onUpdate,
    Reader,
    Writer
  } = props
  const [options, setOptions] = useState(() => item.options)
  const type = useMemo(() => options?.type, [options])
  const changeType = useEventCallback((newType: string) => {
    if (newType === type) return
    const ins = DialogPlugin.confirm({
      body: t('aiService.confirmChangeType'),
      onConfirm: () => {
        setOptions({
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
      setOptions(item?.options)
      setBase(pickBase())
    }
  }, [base.uuid, item, pickBase])
  const onConfirmRef = useRef<((value: T['options']) => void) | undefined>()
  const onOnConfirm = useCallback((
    onConfirm: (value: T['options']) => void
  ) => {
    onConfirmRef.current = onConfirm
    return () => onConfirmRef.current = undefined
  }, [])
  const confirm = useEventCallback(() => {
    const result = {
      ...item,
      ...base,
      options: { ...item?.options, ...options }
    }
    if (result.uuid === undefined) {
      result.uuid = uuid()
    }
    if (result.name === undefined || result.name === '') {
      MessagePlugin.error(t('required', { name: t('name') }))
      return
    }
    try {
      onConfirmRef?.current?.(result.options as T['options'])
    } catch (e) {
      // @ts-expect-error
      MessagePlugin.error(e.message ?? String(e))
      console.error(e)
      return
    }
    setIsEditing(false)
    onUpdate?.(result as T)
  })
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
      {isEditing
        ? <Upload
          draggable
          theme='custom'
          accept='image/*'
          files={base.avatar
            ? [
              { url: base.avatar }
            ]
            : []}
          onChange={(_, { file }) => {
            if (file) {
              setBase({ ...base, avatar: file.response?.url })
            }
          }}
          requestMethod={async (file: UploadFile) => {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file.raw!)
            })
            return {
              status: 'success',
              response: { url: base64 }
            }
          }}
          dragContent={
            <div className={`${prefix}-header__avatar-upload`}>
              <Avatar
                size='164px'
                image={base.avatar}
                icon={
                  <span
                    className='s-icon'
                    style={{
                      fontSize: 36,
                      userSelect: 'none'
                    }}
                  >
                    upload
                  </span>
                }
              />
              <div className={`${prefix}-header__avatar-upload-cover`}>
                {t('dragUploadTooltip')}
              </div>
            </div>
          }
        />
        : item?.avatar
        ? <Avatar size='164px' image={item.avatar} />
        : <Avatar
          size='164px'
          icon={
            <span
              className='s-icon'
              style={{
                fontSize: 36,
                userSelect: 'none'
              }}
            >
              image
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
                  onClick={confirm}
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
                {item && <Popconfirm
                  theme='danger'
                  placement='bottom-right'
                  content={t('confirmDelete', { name: item.name })}
                  onConfirm={() => {
                    onDelete?.(item.uuid, item)
                    next()
                  }}
                >
                  <Button
                    variant='outline'
                    shape='square'
                    theme='danger'
                  >
                    <span className='s-icon'>delete</span>
                  </Button>
                </Popconfirm>}
              </>}
          </div>
        </div>
        <pre className={`${prefix}-header__description`}>
          {isEditing
            ? <Textarea
              rows={5}
              placeholder={t('placeholder.description')}
              defaultValue={item?.description}
              value={base.description}
              onChange={v => setBase({ ...base, description: v })}
            />
            : item?.description ?? '--'}
        </pre>
      </div>
    </div>
    <div className={`${prefix}-content`}>
      {isEditing || Reader === undefined
        ? Writer && <Writer
          isEditing={isEditing}
          value={options}
          onChange={setOptions}
          onOnConfirm={onOnConfirm}
        />
        : Reader && <Reader value={options} />}
    </div>
  </div>
}
ListItemPreview.prefix = `${'spirit'}-list-item-preview`

interface ListProps<T extends ListItem> {
  list: T[] | undefined
  types: {
    [key: string]: ListType
  }
  taggedItemUUID?: T['uuid']
  onTaggedItemUUIDChange?: (uuid: T['uuid']) => void
  onAdd: () => void
  activeUUID: T['uuid'] | undefined
  onActiveChange: (uuid: T['uuid'] | undefined) => void
}
function List(props: ListProps<ListItem>) {
  const { prefix } = List
  const { t } = useTranslation()
  const {
    list,
    types,
    taggedItemUUID,
    activeUUID,
    onActiveChange,
    onAdd,
    onTaggedItemUUIDChange
  } = props
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
        clearable
        prefixIcon={<SearchIcon />}
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
          {item.options?.type && types[item.options.type]?.image
            ? <Avatar
              image={types[item.options.type].image}
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
        <div
          className={classnames(
            `${prefix}-item__tagged`,
            { active: item.uuid === taggedItemUUID }
          )}
          onClick={e => {
            e.stopPropagation()
            onTaggedItemUUIDChange?.(item.uuid)
          }}
        >
          <Tooltip content={t('default')}>
            <span className='s-icon'>sell</span>
          </Tooltip>
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
    taggedItemUUID?: T['uuid']
    onTaggedItemUUIDChange?: (uuid: T['uuid']) => void
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
    taggedItemUUID,
    onTaggedItemUUIDChange,
    types
  }] = omitPrefixProps(props, 'itemPreview')
  const [activeUUID, setActiveUUID] = useState<string | undefined>(list?.[0]?.uuid)
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
      taggedItemUUID={taggedItemUUID}
      onTaggedItemUUIDChange={onTaggedItemUUIDChange}
      activeUUID={activeUUID}
      onActiveChange={setActiveUUID}
      onAdd={() => {
        const newItem = {
          uuid: uuid(),
          name: t('untitled'),
          options: {
            type: Object.keys(types)[0]
          }
        } as T
        itemPreviewProps['itemPreview:onCreate']?.(newItem)
        setActiveUUID(newItem.uuid)
      }}
    />
    {item
      ? <ListItemPreview
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
      />
      : <div className='spirit-list-wrap__empty'>
        <img src={notFound} />
        <span>
          暂无可用 AI 服务，<Link
            theme='primary'
            onClick={() => {
              const newItem = {
                uuid: uuid(),
                name: t('untitled'),
                options: {
                  type: Object.keys(types)[0]
                }
              } as T
              itemPreviewProps['itemPreview:onCreate']?.(newItem)
              setActiveUUID(newItem.uuid)
            }}
          >
            点击
          </Link>创建服务商。
        </span>
      </div>}
  </div>
}
