import { mock } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

const TEST_URL = 'http://localhost:3000/'

mock.module('server-only', () => ({}))

GlobalRegistrator.register({ url: TEST_URL, settings: { navigation: { disableChildFrameNavigation: true } } })
