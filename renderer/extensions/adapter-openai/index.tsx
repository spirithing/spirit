import chatgptIcon from '../../assets/chatgpt.svg'
import { defineAIServiceAdapter } from '../../extension'
import { AIServiceOptionConfigurerForOpenAI } from './AIServiceOptionConfigurer'

export default defineAIServiceAdapter('openai', {
  type: {
    label: 'OpenAI',
    image: chatgptIcon
  },
  Writer: AIServiceOptionConfigurerForOpenAI
})
