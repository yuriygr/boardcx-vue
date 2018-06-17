import axios from 'axios'

const instance = axios.create({
	baseURL: 'https://api.board.cx/',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	}
})

instance.interceptors.response.use(
	(data) => {
		const { response } = JSON.parse(data.request.response)
		return response
	},
	(error) => {
		return Promise.reject(error.response.data.error)
	}
)

const topics = {
	list(params) {
		return instance.get('topics.list', { params })
	},
	item(params) {
		return instance.get('topics.item', { params })
	},
	refresh(params) {
		return instance.get('topics.refresh', { params })
	},
	add(formData) {
		return instance.post('topics.add', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
	},
	report(formData) {
		return instance.post('topics.report', formData)
	},
	like(params) {
		return instance.post('topics.like', { params })
	},
	password(formData) {
		return instance.post('topics.password', formData)
	},
	logs(params) {
		return instance.get('topics.logs', { params })
	}
}

const comments = {
	item(params) {
		return instance.get('comments.item', { params })
	},
	add(formData) {
		return instance.post('comments.add', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
	},
	report(formData) {
		return instance.post('comments.report', formData)
	}
}

const gallery = {
	list(params) {
		return instance.get('gallery.list', { params })
	}
}

const pages = {
	list() {
		return instance.get('pages.list')
	},
	item(params) {
		return instance.get('pages.item', { params })
	}
}

const tags = {
	list() {
		return instance.get('tags.list')
	},
	stats() {
		return instance.get('tags.stats')
	},
	find() {
		return instance.get('tags.find')
	}
}

const mod = {
	edit(formData) {
		return instance.post('mod.edit', formData)
	},
	ban(formData) {
		return instance.post('mod.ban', formData)
	},
	pin(formData) {
		return instance.post('mod.pin', formData)
	},
	close(formData) {
		return instance.post('mod.close', formData)
	},
	lock(formData) {
		return instance.post('mod.lock', formData)
	},
	delete(formData) {
		return instance.post('mod.delete', formData)
	},
	settings(formData) {
		return instance.post('mod.settings', formData)
	}
}

const oembded = {
	youtube(params) {
		return axios.get('https://www.googleapis.com/youtube/v3/videos', { params })
		.then((data) => {
			const response = JSON.parse(data)
			return data.data
		})
	}
}
export { topics, comments, gallery, pages, tags, mod, oembded }