'use strict'

const util = require('vbb-util')
const got = require('got')
const stringify = require('vbb-hafas/lib/stringify')
const stream = require('stream')



const findLine = /([a-z]{0,3}\d{1,3})/i

const parse = (m) => {
	const keyframes = m.p ? m.p.map((p) => ({
		  latitude:  p.x / 1000000
		, longitude: p.y / 1000000
		, t: +p.t
	})) : []
	keyframes.line = findLine.exec(m.n)[1] || null
	keyframes.product = util.products.bitmasks[parseInt(m.c)].type
	keyframes.direction = m.l
	return keyframes
}



const defaults = {
	duration: 60000,
	interval: 2000,
	products: {
		suburban:   true,
		subway:     true,
		tram:       true,
		bus:        true,
		ferry:      true,
		express:    true,
		regional:   true
	}
}



// min latitude, min longitude, max latitude, max longitude
const request = (bbox, opt) => {
	if (!Array.isArray(bbox) || bbox.length !== 4)
		throw new Error('invalid bbox array')

	opt = opt || {}
	const products = Object.assign({}, defaults.products, opt.products)

	return got.post('fahrinfo.vbb.de/bin/query.exe/dny', {
		json: true,
		query: {
			  look_miny: stringify.coord(bbox[0])
			, look_minx: stringify.coord(bbox[1])
			, look_maxy: stringify.coord(bbox[2])
			, look_maxx: stringify.coord(bbox[3])
			// todo
			, look_nv: [
				  'zugposmode',   2
				, 'interval',     opt.duration
				, 'intervalstep', opt.interval
			].join('|')
			, look_productclass: util.products.stringifyBitmask(products) + ''
			, tpl: 'trains2json2', look_json: 'yes', performLocating: '1'
		}
	})
	.then((res) => {
		if (!res.body || !Array.isArray(res.body.t)) return []
		return res.body.t.map(parse)
	}, (err) => err)
}



const positions = (bbox, opt) => {
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
					  line: movement.line
					, product: movement.product
					, latitude: node.latitude
					, longitude: node.longitude
					, when: from + node.t
				})
			}

		}, console.error)
	}
	return out
}

module.exports = positions
