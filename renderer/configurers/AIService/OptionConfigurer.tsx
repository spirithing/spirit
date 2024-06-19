import { useMemo } from 'react'
import type { AIServiceOption } from 'spirit'

import type { ListItemWriterProps } from '../../components/ListWithPreview'
import { aiServiceOptionConfigurerMapping } from './base'

export function AIServiceOptionConfigurer(
  props: ListItemWriterProps<AIServiceOption>
) {
  const Comp = useMemo(() => {
    return aiServiceOptionConfigurerMapping[props.value.type]
  }, [props.value.type])
  // @ts-ignore
  return <Comp {...props} />
}
