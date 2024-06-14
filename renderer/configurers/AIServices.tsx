import './AIServices.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties, ReactNode } from 'react'
import { Avatar, AvatarGroup, Button, Input, Select } from 'tdesign-react'

function ListItemPreview() {
  const { prefix } = ListItemPreview
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
        options={[
          {
            label: 'Option 1',
            content: <div className={`${prefix}-header__type-selector-option`}>
              <img src='https://avatars.githubusercontent.com/u/10251060?v=4' width={28} />
              <span>Option 1</span>
            </div>,
            value: 'option1'
          },
          {
            label: 'Option 2',
            value: 'option2'
          }
        ]}
        prefixIcon={
          <>
            <img src='https://avatars.githubusercontent.com/u/10251060?v=4' width={28} />
          </>
        }
        suffixIcon={<></>}
      />
      <Avatar
        size='160px'
        icon={
          <>
            <span className='s-icon' style={{ fontSize: 36, userSelect: 'none' }}>upload</span>
          </>
        }
      />
      <div className={`${prefix}-header__base`}>
        <div className={`${prefix}-header__title`}>
          AI服务1
          <div className={`${prefix}-header__operations`}>
            <Button variant='outline' shape='square'>
              <span className='s-icon'>edit</span>
            </Button>
            <Button variant='outline' shape='square' theme='danger'>
              <span className='s-icon'>delete</span>
            </Button>
          </div>
        </div>
        <div className={`${prefix}-header__description`}>
          AI服务1描述
        </div>
      </div>
    </div>
    <div className={`${prefix}-content`}>
    </div>
  </div>
}
ListItemPreview.prefix = `${'spirit'}-list-item-preview`

function List() {
  const { prefix } = List
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
    <div
      className={classnames(`${prefix}-item`, {
        active: true
      })}
    >
      <AvatarGroup cascading='left-up'>
        <Avatar image='https://avatars.githubusercontent.com/u/10251060?v=4' />
        <Avatar image='https://avatars.githubusercontent.com/u/10251060?v=4' />
      </AvatarGroup>
      <div className={`${prefix}-item__content`}>
        <div className={`${prefix}-item__title`}>
          AI服务1
        </div>
        <div className={`${prefix}-item__description`}>
          AI服务1描述
        </div>
      </div>
      <div className={`${prefix}-item__operations`}>
        <Button variant='text' shape='square'>
          <span className='s-icon'>more_vert</span>
        </Button>
      </div>
    </div>
    <div className={`${prefix}-item`}>
      <AvatarGroup cascading='left-up'>
        <Avatar image='https://avatars.githubusercontent.com/u/10251060?v=4' />
        <Avatar image='https://avatars.githubusercontent.com/u/10251060?v=4' />
      </AvatarGroup>
      <div className={`${prefix}-item__content`}>
        <div className={`${prefix}-item__title`}>
          AI服务1
        </div>
        <div className={`${prefix}-item__description`}>
          AI服务1描述
        </div>
      </div>
      <div className={`${prefix}-item__operations`}>
        <Button variant='text' shape='square'>
          <span className='s-icon'>more_vert</span>
        </Button>
      </div>
    </div>
  </div>
}

List.prefix = `${'spirit'}-list`

export interface ListWithPreviewProps {
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

function ListWithPreview(props: ListWithPreviewProps) {
  const { style, className } = props
  return <div
    className={classnames('spirit-list-wrap', className)}
    style={style}
  >
    <List />
    <ListItemPreview />
  </div>
}

export interface AIServicesProps {
  style?: CSSProperties
  className?: string
}

export function AIServices(props: AIServicesProps) {
  const { prefix } = AIServices
  const { className, style } = props
  return <ListWithPreview
    style={style}
    className={classnames(prefix, className)}
  />
}

AIServices.prefix = `${'spirit'}-ai-services`
