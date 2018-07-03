import { isObject } from 'utilities'

const storage = window.localStorage
const SESSION_KEY = "settings"

export default {

	loaded: false,

	/** Settings array */
	_settings: {
		theme: 'base',
		auto_refresh: false,
		remove_hidden: false,
		hide_files: false,
		open_image_on_window: false,
		fixed_header: true,
		i_hate_rounded_borders: false
	},

	_settingsDefault: {
		theme: 'base',
		auto_refresh: false,
		remove_hidden: false,
		hide_files: false,
		open_image_on_window: false,
		fixed_header: true,
		i_hate_rounded_borders: false
	},

	/**
	 * Return list of settings
	 */
	list() { return this._settings },

	/**
	 * Return нужный property on settings
	 * @param {string} param Name of param on settings
	 * @param {string} defaultValue Default value
	 */
	get(param) {
		return this._settings[param]
	},

	/**
	 * Load settings from store
	 * @param {array} settings User settings
	 * @param {function} callback Callback
	 */
	set(settings, callback) {
		this._settings = settings
		callback()
	},

	/**
	 * Reset user settings
	 * @param {function} callback Callback
	 */
	reset(callback) {
		this.set({ ...this._settingsDefault }, callback)
		this.sync('reset', _ => {
			console.log('[status] Settings removed')
		})
	},

	/**
	 * Saving new user data on settings
	 * @param {array} data  New session data
	 * @param {function} callback Callback
	 */
	update(data, callback) {
		this.set({...this._settings, ...data}, callback)
		this.sync('write', _ => {
			console.log('[status] Settings writed')
		})
	},

	/**
	 * Sync settings with storage
	 * @param {string} method Method of wtfman
	 * @param {function} callback Callback
	 */
	sync(method = 'write', callback) {
		switch (method) {
			case 'write':
				storage.setItem(SESSION_KEY, JSON.stringify(this._settings))
				callback()
			break;
			case 'read':
				if (storage.getItem(SESSION_KEY) !== null) {
					const sessionState = JSON.parse(storage.getItem(SESSION_KEY))
					if (isObject(sessionState)) {
						this.loaded = true
						this.set(sessionState, callback)
					}
				}
			break;
			case 'reset':
				storage.removeItem(SESSION_KEY)
				callback()
			break;
		}
	}
}
