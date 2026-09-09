import { mock } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

mock.module('server-only', () => ({}))

GlobalRegistrator.register({ settings: { navigation: { disableChildFrameNavigation: true } } })
