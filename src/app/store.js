import Vue from 'vue'
import Vuex from 'vuex'
import api from 'board-api'

Vue.use(Vuex)

const state = {
	name: 'board.cx',
	version: '2.0.3',
	loading: false,

	sortList: [
		{ slug: 'new', label: 'New', description: 'by created time' },
		{ slug: 'top', label: 'Top' },
		{ slug: 'hot', label: 'Hot', description: 'by last comment time' },
		{ slug: 'gallery', label: 'Gallery', description: 'oh yes' }
	],

	// Tags
	tagsList: [],
	showTagsList: JSON.parse(localStorage.getItem('hidden.tagsList') || true),
	tagActive: false,
	tagsHidden: JSON.parse(localStorage.getItem('hidden.tags')) || [],

	// Topics
	topicsList: false,
	topicActive: false,

	// Other
	pageActive: false,
	galleryList: false
}

const mutations = {
	// App
	SET_LOADING (state, payload) {
		state.loading = payload
	},

	// Topic
	SET_TOPICS_LIST(state, payload) {
		state.topicsList = payload.topics_data
	},
	REMOVE_TOPICS_LIST(state) {
		state.topicsList = false
	},
	SET_TOPIC_ACTIVE(state, payload) {
		state.topicActive = payload.topic_data
	},
	REMOVE_TOPIC_ACTIVE(state) {
		state.topicActive = false
	},
	DELETE_TOPIC_ITEM(state, payload) {
		if (state.topicsList) {
			state.topicsList.items = state.topicsList.items.filter(e => e.id !== payload.topic_id)
		}
	},
	CLOSE_TOPIC_ITEM(state, payload) {
		if (state.topicsList) {
			state.topicsList.items.find(e => e.id === payload.topic_id).isClosed = true
		} else if (state.topicActive) {
			state.topicActive.isClosed = true
		}
	},

	// Refresh topic
	REFRESH_TOPIC (state, payload) {
		state.topicActive.comments.push(...payload.comments_data)
		state.topicActive.countComments = state.topicActive.comments.length
	},
	CHANGE_TOPIC_BUMP (state, payload) {
		let last_comment_index = payload.comments_data.length - 1
		state.topicActive.bump = payload.comments_data[last_comment_index].timestamp
	},

	// Comments
	BAN_COMMENT(state, payload) {
		state.topicActive.comments.find(e => e.id === payload.comment_id).isBanned = true
	},
	PIN_COMMENT(state, payload) {
		state.topicActive.comments.find(e => e.id === payload.comment_id).isPinned = true
	},
	REMOVE_COMMENT(state, payload) {
		state.topicActive.comments = state.topicActive.comments.filter(e => e.id !== payload.comment_id)
		state.topicActive.countComments = state.topicActive.comments.length
	},

	// Pages
	SET_PAGE_ACTIVE (state, payload) {
		state.pageActive = payload.page_data
	},
	REMOVE_PAGE_ACTIVE (state) {
		state.pageActive = false
	},

	// Gallery
	SET_GALLERY_LIST (state, payload) {
		state.galleryList = payload.gallery_data
	},
	REMOVE_GALLERY_LIST (state) {
		state.galleryList = false
	},

	// Tags
	SET_TAG_ACTIVE(state, payload) {
		state.tagActive = payload
	},
	REMOVE_TAG_ACTIVE(state) {
		state.tagActive = false
	},

	// Tags list
	SET_TAGS_LIST(state, payload) {
		state.tagsList = payload.tags_data
	},
	REMOVE_TAGS_LIST(state) {
		state.tagsList = false
	},
	HIDE_TAG(state, payload) {
		state.tagsHidden.push(payload.slug)
	},
	UNHIDE_TAG(state, payload) {
		state.tagsHidden = state.tagsHidden.filter(e => e !== payload.slug)
	},
	RESET_HIDE_TAGS(state) {
		state.tagsHidden = []
	},
	TOGGLE_TAGS_LIST(state, payload) {
		if (payload !== undefined)
			state.showTagsList = payload
		else
			state.showTagsList = !state.showTagsList
	},

	BUILD_REFMAP (state, payload) {
		state.topicActive.comments.forEach((comment, index) => {
			let replies = payload[comment.id]
			if (replies && replies.length > 0)
				comment.replies.push(...replies)
		})
	}
}

const actions = {
	// Topics
	FETCH_TOPICS_LIST ({ commit, state }, [type, tag, except, limit, page] ) {
		return api.topics.list({ type, tag, except, limit, page })
		.then((topics_data) => {
			if (state.topicActive)
				commit('REMOVE_TOPIC_ACTIVE')

			if (tag)
				commit('SET_TAG_ACTIVE', tag)

			commit('SET_TOPICS_LIST', { topics_data })
			return topics_data
		})
	},
	FETCH_TOPIC_ITEM ({ commit, state }, topic_id) {
		return api.topics.item({ topic_id })
		.then((topic_data) => {
			if (state.topicsList)
				commit('REMOVE_TOPICS_LIST')

			commit('SET_TOPIC_ACTIVE', { topic_data })
			return topic_data
		})
	},
	REFRESH_TOPIC ({ commit }, [topic_id, after_id]) {
		return api.topics.refresh({ topic_id, after_id })
		.then((comments_data) => {
			if (comments_data.length > 0) {
				commit('REFRESH_TOPIC', { comments_data })
				commit('CHANGE_TOPIC_BUMP', { comments_data })
			}
			return comments_data
		})
	},
	LIKE_TOPIC ({ commit }, topic_id) {
		return api.topics.like(topic_id)
		.then((data) => {
			return data
		})
	},

	// Page
	FETCH_PAGE ({ commit }, page_slug) {
		return api.pages.item({ page_slug })
		.then((page_data) => {
			commit('SET_PAGE_ACTIVE', { page_data })
		})
	},

	// Gallery
	FETCH_GALLERY ({ commit }, [tag, except, limit, page] ) {
		return api.gallery.list({ tag, except, limit, page })
		.then((gallery_data) => {
			if (tag)
				commit('SET_TAG_ACTIVE', tag)

			commit('SET_GALLERY_LIST', { gallery_data })
			return gallery_data
		})
	},

	// Tags
	FETCH_TAGS_LIST ({ commit }) {
		return api.tags.list()
		.then((tags_data) => {
			commit('SET_TAGS_LIST', { tags_data })
			return tags_data
		})
	},


	// Comments
	SEND_COMMENT ({ commit }, formData) {
		return api.comments.add(formData)
		.then((data) => {
			return data
		})
	},
	REPORT_COMMENT ({ commit }, formData) {
		return api.comments.report(formData)
		.then((data) => {
			return data
		})
	},

	// Modderation
	MOD_DELETE_TOPIC({ commit }, formData) {
		const topic_id = parseInt(formData.get('topic_id'))
		return api.mod.delete(formData)
		.then((data) => {
			commit('DELETE_TOPIC_ITEM', { topic_id })
			return data
		})
	},
	MOD_CLOSE_TOPIC({ commit }, formData) {
		const topic_id = parseInt(formData.get('topic_id'))
		return api.mod.close(formData)
		.then((data) => {
			commit('CLOSE_TOPIC_ITEM', { topic_id })
			return data
		})
	},
	MOD_BAN_COMMENT ({ commit }, formData) {
		const comment_id = parseInt(formData.get('comment_id'))
		return api.mod.ban(formData)
		.then((data) => {
			commit('BAN_COMMENT', { comment_id })
			return data
		})
	},
	MOD_PIN_COMMENT ({ commit }, formData) {
		const comment_id = parseInt(formData.get('comment_id'))
		return api.mod.pin(formData)
		.then((data) => {
			commit('PIN_COMMENT', { comment_id })
			return data
		})
	},
	MOD_DELETE_COMMENT ({ commit }, formData) {
		const comment_id = parseInt(formData.get('comment_id'))
		return api.mod.delete(formData)
		.then((data) => {
			commit('REMOVE_COMMENT', { comment_id })
			return data
		})
	}
}

const getters = {
	getTagActive (state) {
		return state.tagsList.filter(tag => tag.slug === state.tagActive)[0] || false
	}
}

const store = new Vuex.Store({
	state,
	mutations,
	actions,
	getters
})

// Подпишемся для сохранения в LS
store.subscribe((mutation, state) => {
	if (
		mutation.type === "RESET_HIDE_TAGS" ||
		mutation.type === "HIDE_TAG" ||
		mutation.type === "UNHIDE_TAG"
	) {
		localStorage.setItem('hidden.tags', JSON.stringify(state.tagsHidden))
	}
	if (mutation.type === "TOGGLE_TAGS_LIST") {
		localStorage.setItem('hidden.tagsList', JSON.stringify(state.showTagsList))
	}
})

export default store