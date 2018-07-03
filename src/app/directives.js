import { cancelEvent, getScrollTopElement } from 'utilities'
import BusEvents from 'bus-events'

/**
 * Превью ссылок.
 */
const LinkPreview = {
	bind(el, binding, vnode) {
		return false
		let siteNames = ['www.youtube.com', 't.me', 'vk.com', 'i.imgur.com', 'meduza.io']
		let links = el.getElementsByTagName('a'),
			timer_ms = 100

		for (let j = 0; j < links.length; j++) {
			let link = links[j],
				host = link.host,
				normal = siteNames.indexOf(host) > -1

			// Если не подходит для обработки, то возвращаемся
			if (!normal) return

			let oEmbded = document.createElement('div')
				oEmbded.className = 'oembded'
				oEmbded.innerHTML = '<div class="oembded-title"><a href="' + link.href + '">' + link.innerText + '</a></div> \
									 <div class="oembded-info"> \
										 <span>' + host + '</span><span>3:66</span><span>11 Aug 2014</span> \
									 </div>'
			link.parentNode.replaceChild(oEmbded, link)
		}
	}
}

/**
 * Превью ссылок с атрибутом
 */
const CommentPreview = {
	bind(el, binding, vnode) {
		let links = el.querySelectorAll('a[data-comment-preview]'),
			timers = {},
			timer_ms = 80

		const clearTimer = (num) => {
			if (timers.hasOwnProperty(num)) {
				clearTimeout(timers[num])
				delete timers[num]
			}
		}

		for (let j = 0; j < links.length; j++) {
			let link = links[j],
				data = link.getAttribute('data-comment-preview').split('|'),
				params = {
					topic_id: data[0],
					comment_id: data[1]
				}

			/*link.addEventListener('mouseover', (e) => {
				timers[params.comment_id] = setTimeout(() => {
					clearTimer(params.comment_id)
					vnode.context.$bus.emit(BusEvents.COMMENTS_PREVIEW, { e, type: e.type, params })
				}, timer_ms)
			})
			link.addEventListener('mouseout', (e) => {
				timers[params.comment_id] = setTimeout(() => {
					clearTimer(params.comment_id)
					vnode.context.$bus.emit(BusEvents.COMMENTS_PREVIEW, { e, type: e.type, params })
				}, timer_ms)
			})*/
			link.addEventListener('click', (e) => {
				let commentNode = document.getElementById(params.comment_id)
				if (!commentNode) return cancelEvent(e)
				
				window.scrollTo(0, getScrollTopElement(commentNode) - 60)
				vnode.context.$bus.emit(BusEvents.COMMENTS_HIGHLIGHT, params.comment_id)
				cancelEvent(e)
			})
		}
	}
}

const CropHighText = {
	bind(el, binding, vnode) {
		let data = binding.value
		if (data.on)
			return
		vnode.context.$nextTick(() => {
			if (el.offsetHeight >= data.height) {
				el.classList.add(data.class)
				el.style.maxHeight = data.height + 'px'
			}
		})
	}
}

export default { LinkPreview, CommentPreview, CropHighText }