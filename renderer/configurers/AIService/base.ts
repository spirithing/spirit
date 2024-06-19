import AdapterOllama from '../../extensions/adapter-ollama'
import AdapterOpenAI from '../../extensions/adapter-openai'

export const apis = {
  openai: AdapterOpenAI.api,
  ollama: AdapterOllama.api
}

export const creators = {
  openai: AdapterOpenAI.creator,
  ollama: AdapterOllama.creator
}

export const types = {
  openai: AdapterOpenAI.type,
  ollama: AdapterOllama.type
}

export const aiServiceOptionConfigurerMapping = {
  openai: AdapterOpenAI.Writer,
  ollama: AdapterOllama.Writer
}
