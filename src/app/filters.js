
const timeFormat = (timestamp) => {
	const a = new Date(timestamp * 1000);
	const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const year = a.getFullYear() < (new Date()).getFullYear() ? ' ' + a.getFullYear() : '';
	const month = months[a.getMonth()];
	const date = a.getDate();
	const hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours();
	const min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
	const time = date + ' ' + month + year + ' at ' + hour + ':' + min;
	return time;
}

const ommited = (count) => {
	let cases = [2, 0, 1, 1, 1, 2],
		titles = ['comment', 'comments', 'comments']
	return count + ' ' + titles[ (count%100 > 4 && count%100 < 20) ? 2 : cases[Math.min(count%10, 5)] ]
}

export default { timeFormat, ommited }
