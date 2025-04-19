export const MD_CODE_BLOCK = (lang: string, str: string) => `\`\`\`${lang}\n${str}\n\`\`\``

export const JSON_MD_WRAPPER = (str: string) => MD_CODE_BLOCK('json', str)
