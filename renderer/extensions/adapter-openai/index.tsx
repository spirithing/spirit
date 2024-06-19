import chatgptIcon from '../../assets/chatgpt.svg'
import { defineAIServiceAdapter } from '../../extension'
import { OptionConfigurer } from './OptionConfigurer'

export default defineAIServiceAdapter('openai', {
  type: {
    label: 'OpenAI',
    image: chatgptIcon
  },
  Writer: OptionConfigurer
})
