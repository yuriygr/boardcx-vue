const storage = window.localStorage


export default class {

	constructor() {}

	settingsId = "settings"

	_settings = {
		'theme': 'base',
		'auto_refresh': false,
		'hide_sticky': false,
		'hide_files': false,
		'open_image_on_window': false,
		'fixed_header': true,
		'i_hate_rounded_borders': false
	}

	/**
	 * Return list of settings
	 */
	list() { return this._settings }

	/**
	 * Return нужный property on settings
	 * @param {string} param Name of param on settings
	 * @param {string} defaultValue Default value
	 */
	get(param) {
		return this._settings[param]
	}

	/**
	 * 
	 * @param {array} settings User settings
	 * @param {function} callback Callback
	 */
	set(settings, callback) {
		this._settings = settings
		this.sync('write', _ => {
			console.log('Settings writed')
		})
		callback()
	}

	/**
	 * Reset user settings
	 * @param {function} callback Callback
	 */
	reset(callback) {
		this._settings = {}
		this.sync('reset', _ => {
			console.log('Settings removed')
		})
		callback()
	}

	/**
	 * Saving new user data on settings
	 * @param {array} data  New session data
	 * @param {function} callback Callback
	 */
	update(data, callback) {
		this.set({...this._settings, ...data}, callback)
		this.sync('write', _ => {
			console.log('Settings writed')
		})
	}

	/**
	 * Sync settings with storage
	 * @param {string} method Method of wtfman
	 * @param {function} callback Callback
	 */
	sync(method = 'write', callback) {
		switch (method) {
			case 'write':
				storage.setItem(this.settingsId, JSON.stringify(this._settings))
			break;
			case 'read':
				if (storage.getItem(this.settingsId) !== null)
					this.set(JSON.parse(storage.getItem(this.settingsId)), callback)
			break;
			case 'reset':
				storage.removeItem(this.settingsId)
			break;
		}
	}
}
