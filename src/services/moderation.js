import { isObject, getKeyByValue } from 'utilities'

const storage = window.localStorage
const SESSION_KEY = "moderation"

export default {

	loaded: false,

	/** Permissions array */
	_threads: [],

	/**
	 * Return count of threads
	 */
	stats() { return this._threads.length },

	/**
	 * Get field on permissions
	 * @param  {array} params Parameters for verification
	 * @return {object}        Thread params
	 */
	get(params) {
		return this._threads.find(e => e.topic_id === params.topic_id)
	},

	/**
	 * Checks if the user can manage... something?
	 * @param  {array} params Parameters for verification
	 * @return {bool}        Можно или нет
	 */
	can(params) {
		return this.get(params) ? true : false
	},

	/**
	 * Load thread to moderate from store
	 * @param  {array} threads Threads for moderation
	 * @param {function} callback Callback
	 */
	set(threads, callback) {
		this._threads = threads
		callback()
	},

	/**
	 * Remove topic from modarete
	 * @param  {array} params Parameters for verification
	 * @param {function} callback Callback
	 */
	revoke(params, callback) {
		this.set(this._threads.filter(e => e.topic_id !== params.topic_id), callback)
		this.sync('write', _ => {
			console.log('[status] Moderator permissions writed')
		})
	},

	/**
	 * Add topic for moderate
	 * @param  {array} data Threads for moderation
	 * @param {function} callback Callback
	 */
	add(data, callback) {
		this._threads.push(data)
		this.sync('write', _ => {
			console.log('[status] Moderator permissions writed')
		})
		callback()
	},

	/**
	 * Sync with storage
	 * @param {string} method Method of wtfman
	 * @param {function} callback Callback
	 */
	sync(method = 'write', callback) {
		switch (method) {
			case 'write':
				storage.setItem(SESSION_KEY, JSON.stringify(this._threads))
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
