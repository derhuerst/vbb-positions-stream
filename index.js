'use strict'

const stream = require('stream')
const request = require('./request')



const movements = (bbox, opt) => {
	let stop, running, duration // of request
	const out = new stream.Readable({objectMode: true})
	out._read = () => {if (!running) collect()}
	out.stop = () => {stop = true}

	const collect = () => {
		running = true
		const from = Date.now()
		request(bbox, opt).then((data) => {
			duration = Date.now() - from
			if (stop) return running = false
			else setTimeout(collect, opt.duration - duration)

			for (let movement of data) {
				for (let node of movement) out.push({
					  line: movement.line._
					, product: movement.product.type
					, latitude: node.latitude
					, longitude: node.longitude
					, when: from + node.t
				})
			}

		}, console.error)
	}
	return out
}

module.exports = movements
