import './Bot.scss'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ITool } from 'spirit'
import { Checkbox, Col, Input, Row, Textarea } from 'tdesign-react'

import { useBot } from '#renderer/hooks/useBot.ts'
import { classnames } from '#renderer/utils/classnames.ts'

interface ToolCollection {
  id: string
  title: string
  description: string
  tools: ITool[]
}

interface ToolCollectionProps {
  value: ToolCollection
}

ToolCollection.prefix = 'spirit-tool-collection'

function ToolCollection({ value: collection }: ToolCollectionProps) {
  const { prefix } = ToolCollection
  const [isCollapsed, setIsCollapsed] = useState(true)
  return <Checkbox value={collection.id} className={prefix}>
    <div className={`${prefix}__header`}>
      <div className={`${prefix}__title`}>
        {collection.title}
      </div>
      <div className={`${prefix}__description`}>
        <span
          className={`${prefix}__description-text`}
          title={collection.description}
        >
          {collection.description}
        </span>
        <span
          className='s-icon'
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          settings
        </span>
        <span
          className={classnames(
            's-icon',
            isCollapsed ? 's-icon--collapsed' : 's-icon--expanded'
          )}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setIsCollapsed(!isCollapsed)
          }}
        >
          expand_more
        </span>
      </div>
    </div>
    <div
      className={classnames(
        `${prefix}__tools`,
        isCollapsed ? `${prefix}__tools--collapsed` : ''
      )}
    >
      {collection.tools.map(tool => (
        <Checkbox
          key={tool.function.name}
          value={tool.function.name}
          className={`${prefix}__tool`}
        >
          <span className={`${prefix}__tool-title`}>
            {tool.function?.name}
          </span>
          <span className={`${prefix}__tool-description`}>
            {tool.function?.description}
          </span>
        </Checkbox>
      ))}
    </div>
  </Checkbox>
}

const defaultMCPToolCollections: ToolCollection[] = [
  {
    id: 'mcp.github',
    title: 'GitHub',
    description: 'Interacts with GitHub repositories and issues',
    tools: [
      {
        type: 'function',
        function: {
          name: 'createIssue',
          description: 'Creates a new issue in a GitHub repository',
          parameters: {
            type: 'object',
            required: ['repo', 'title', 'body'],
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'listIssues',
          description: 'Lists issues in a GitHub repository',
          parameters: {
            type: 'object',
            required: ['repo'],
            properties: {}
          }
        }
      }
    ]
  }
]

const builtinToolCollections: ToolCollection[] = [
  {
    id: 'builtin.fileSystem',
    title: 'File System',
    description: 'Operates your local file system, such as reading and writing files',
    tools: [
      {
        type: 'function',
        function: {
          name: 'readFile',
          description: 'Reads a file from the local file system',
          parameters: {
            type: 'object',
            required: ['path'],
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'writeFile',
          description: 'Writes a file to the local file system',
          parameters: {
            type: 'object',
            required: ['path', 'content'],
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'listFiles',
          description: 'Lists files in a directory',
          parameters: {
            type: 'object',
            required: ['path'],
            properties: {}
          }
        }
      }
    ]
  },
  {
    id: 'builtin.webSearch',
    title: 'Web Search',
    description: 'Searches the web for information',
    tools: []
  },
  {
    id: 'builtin.terminal',
    title: 'Terminal',
    description: 'Executes shell commands on your local machine',
    tools: []
  },
  {
    id: 'builtin.ide',
    title: 'IDE',
    description: 'Operate your active code editor',
    tools: []
  }
]

export function Bot() {
  const { t } = useTranslation()
  const [bot, setBot] = useBot()
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('name')}</label>
          <Input
            value={bot?.name}
            onChange={v => setBot({ ...bot!, name: v })}
            maxcharacter={36}
          />
        </div>
        <div className='spirit-field'>
          <label>{t('desc')}</label>
          <Textarea
            value={bot?.description}
            onChange={v => setBot({ ...bot!, description: v })}
            autosize={{
              maxRows: 6,
              minRows: 2
            }}
            maxcharacter={1000}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('tools')}</label>
          <Checkbox.Group className='spirit-tools'>
            <Checkbox value='enableMCPTools'>
              Tools - MCP
            </Checkbox>
            {defaultMCPToolCollections.map(collection =>
              <ToolCollection
                key={collection.id}
                value={collection}
              />
            )}
            <Checkbox value='enableBuiltInTools'>
              Tools - Built-In
            </Checkbox>
            {builtinToolCollections.map(collection =>
              <ToolCollection
                key={collection.id}
                value={collection}
              />
            )}
          </Checkbox.Group>
        </div>
      </Col>
    </Row>
  </>
}
