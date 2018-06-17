const pad = (n) => { return n < 10 ? '0' + n : n }

const timeFormat = (timestamp) => {
	let a = new Date(timestamp * 1000),
		year = a.getFullYear(),
		month = pad(a.getMonth() + 1),
		date = pad(a.getDate()),
		hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours(),
		min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes(),
		time = date + '.' + month + '.' + year + ' ' + hour + ':' + min
	return time;
}

const ommited = (count) => {
	let cases = [2, 0, 1, 1, 1, 2],
		titles = ['comment', 'comments', 'comments']
	return count + ' ' + titles[ (count%100 > 4 && count%100 < 20) ? 2 : cases[Math.min(count%10, 5)] ]
}

export default { timeFormat, ommited }
