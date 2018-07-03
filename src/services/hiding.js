import { isObject, getKeyByValue } from 'utilities'

const storage = window.localStorage
const SESSION_KEY = "hiding"

export default {

	loaded: false,

	/** Hiddes objects array */
	_hidden: {
		topics: [],
		comments: [],
		trees: [],
		tags: []
	},

	/**
	 * Return count of threads
	 */
	stats() {
		return {
			topics: this._hidden.topics.length || 0,
			comments: this._hidden.comments.length || 0,
			trees: this._hidden.trees.length || 0,
			tags: this._hidden.tags.length || 0
		}
	},

	/**
	 * Check for hidden
	 * @param  {array} params Hidden Object Parameters
	 * @return {bool} Hidden or not
	 */
	hidden(params) {
		let value, type
		if (params.topic_id !== undefined) {
			value = params.topic_id
			type = 'topics'
		}
		if (params.comment_id !== undefined) {
			value = params.comment_id
			type = 'comments'
		}
		if (params.tag_slug !== undefined) {
			value = params.tag_slug
			type = 'tags'
		}
		return this._hidden[type].indexOf(value) != -1
	},

	toggle(params, callback) {
		let value, type
		if (params.topic_id !== undefined) {
			value = params.topic_id
			type = 'topics'
		}
		if (params.comment_id !== undefined) {
			value = params.comment_id
			type = 'comments'
		}
		if (params.tag_slug !== undefined) {
			value = params.tag_slug
			type = 'tags'
		}

		let hide = params.hide

		if (hide)
			this._hidden[type].push(value)
		else
			this._hidden[type] = this._hidden[type].filter(e => e !== value)

		this.sync('write', _ => {
			console.log('[status] Hiding rules writed')
		})

		callback(this.hidden(params))
	},

	/**
	 * Load objects from store
	 * @param  {array} hidden Hidded objects
	 * @param {function} callback Callback
	 */
	set(hidden, callback) {
		this._hidden = hidden
		callback()
	},

	/**
	 * Reset hidden props by type
	 * @param  {string}   type     Type of hidden objects
	 * @param  {Function} callback Callback
	 */
	reset(type, callback) {
		this._hidden[type].length = 0

		this.sync('write', _ => {
			console.log('[status] Hiding rules writed')
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
				storage.setItem(SESSION_KEY, JSON.stringify(this._hidden))
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
