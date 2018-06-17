const cancelEvent = (event) => {
	event = event || window.event
	if (event) {
		event = event.originalEvent || event

		if (event.stopPropagation) event.stopPropagation()
		if (event.preventDefault) event.preventDefault()
			event.returnValue = false
			event.cancelBubble = true
	}

	return false
}

const pasteHtmlAtCaret = (html, selectPastedContent = false) => {
	let sel, range
	if (window.getSelection) {
		// IE9 and non-IE
		sel = window.getSelection()
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0)
			range.deleteContents()

			// Range.createContextualFragment() would be useful here but is
			// only relatively recently standardized and is not supported in
			// some browsers (IE9, for one)
			let el = document.createElement("div")
				el.innerHTML = html
			let frag = document.createDocumentFragment(),
				node,
				lastNode
			while (node = el.firstChild)
				lastNode = frag.appendChild(node)

			let firstNode = frag.firstChild
			range.insertNode(frag)
			
			// Preserve the selection
			if (lastNode) {
				range = range.cloneRange()
				range.setStartAfter(lastNode)
				if (selectPastedContent) {
					range.setStartBefore(firstNode)
				} else {
					range.collapse(true)
				}
				sel.removeAllRanges()
				sel.addRange(range)
			}
		}
	} else if ( (sel = document.selection) && sel.type != "Control") {
		// IE < 9
		let originalRange = sel.createRange()
		originalRange.collapse(true)
		sel.createRange().pasteHTML(html)
		let range = sel.createRange()
		range.setEndPoint("StartToStart", originalRange)
		range.select()
	}
}

const getScrollTopElement = (e) => {
	let top = 0
	while (e.offsetParent != undefined || e.offsetParent != null) {
		top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0)
		e = e.offsetParent
	}
	return top
}

export { cancelEvent, pasteHtmlAtCaret, getScrollTopElement }