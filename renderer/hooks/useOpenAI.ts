import { useAtom } from 'jotai'

import { openAIAtom } from '../atoms/openAI'
import { electronStore } from '../store'

export const useOpenAI = () => useAtom(openAIAtom, { store: electronStore })[0]
