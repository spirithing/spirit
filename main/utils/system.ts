import os from 'node:os'

import { app } from 'electron'

const userinfo = os.userInfo()

export const userDataPath = app.getPath('userData')
export const username = userinfo.username

const osType = os.type()
export { osType as os }
