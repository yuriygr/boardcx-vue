import 'es6-promise/auto'
import { app, store } from './main'

// actually mount to DOM
app.$mount('#app')

// service worker
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js')
}