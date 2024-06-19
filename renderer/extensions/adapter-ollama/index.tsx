import ollamaIcon from '../../assets/ollama.svg'
import { defineAIServiceAdapter } from '../../extension'
import { OptionConfigurer } from './OptionConfigurer'

export default defineAIServiceAdapter('ollama', {
  type: {
    label: 'Ollama',
    image: ollamaIcon
  },
  Writer: OptionConfigurer
})
