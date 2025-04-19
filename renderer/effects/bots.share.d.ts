declare module 'spirit' {
  interface BotOptions {
    tools?: string[]
    enableTools?: boolean
    aiService?: {
      uuid: string
      options?: AIServiceOptions
    }
  }
  interface Bot {
    uuid: string
    name: string
    description?: string
    options?: BotOptions
  }
  interface Store {
    bot: Bot
    bots: {
      [botUUID: string]: Bot
    }
  }
}
