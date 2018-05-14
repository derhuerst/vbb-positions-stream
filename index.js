'use strict'

const createFormatBitmask = require('hafas-client/format/products-bitmask')
const products = require('hafas-client/p/vbb/modes')
const util = require('vbb-util')
const parseLine = require('vbb-parse-line')
const qs = require('query-string')
const Promise = require('pinkie-promise')
const {fetch} = require('fetch-ponyfill')({Promise})
const formatCoord = require('hafas-client/format/coord')
const stream = require('stream')

const formatBitmask = createFormatBitmask(products)

const parse = (m) => {
	if (!m.p) return []

	const keyframes = m.p.map((p) => ({
		  latitude:  p.y / 1000000
		, longitude: p.x / 1000000
		, t: +p.t
	}))

	const line = m.n && parseLine(m.n) || {}
	const product = products.bitmasks[parseInt(m.c)]

	keyframes.line = line._ || null
	keyframes.mode = line.mode || product && product.mode || null
	keyframes.product = line.product || product && product.product || null

	keyframes.direction = m.l ? m.l.trim() : null
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

const userAgent = 'vbb-positions-stream'

// min latitude, min longitude, max latitude, max longitude
const request = (bbox, opt) => {
	const query = qs.stringify({
		look_miny: formatCoord(bbox[0]),
		look_minx: formatCoord(bbox[1]),
		look_maxy: formatCoord(bbox[2]),
		look_maxx: formatCoord(bbox[3]),
		// todo
		look_nv: [
			'zugposmode',   2,
			'interval',     opt.duration,
			'intervalstep', opt.interval
		].join('|'),
		look_productclass: util.products.stringifyBitmask(opt.products) + '',
		tpl: 'trains2json2',
		look_json: 'yes',
		performLocating: '1'
	})

	return fetch('https://fahrinfo.vbb.de/bin/query.exe/dny?' + query, {
		method: 'GET',
		mode: 'cors',
		redirect: 'follow',
		headers: {'user-agent': userAgent}
	})
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.json()
	})
	.then((res) => {
		if (!res || !Array.isArray(res.t)) return []
		return res.t.map(parse)
	})
}



const positions = (bbox, opt) => {
	if (!Array.isArray(bbox) || bbox.length !== 4)
		throw new Error('invalid bbox array')

	opt = opt || {}
	const products = Object.assign({}, defaults.products, opt.products)
	opt = Object.assign({}, defaults, opt, {products})

	let stop, running, duration // of request
	const out = new stream.Readable({objectMode: true})
	out._read = () => {if (!running) collect()}
	out.stop = () => {stop = true}

	const collect = () => {
		running = true
		const beginning = Date.now()
		request(bbox, opt)
		.then((data) => {
			duration = Date.now() - beginning
			if (stop) return running = false
			else setTimeout(collect, Math.max(opt.interval - duration, 0))

			for (let movement of data) {
				for (let node of movement) out.push({
					  line: movement.line
					, mode: movement.mode
					, product: movement.product
					, latitude: node.latitude
					, longitude: node.longitude
					, when: beginning + node.t
				})
			}

		})
		.catch((err) => out.emit('error', err))
	}
	return out
}

positions.request = request
module.exports = positions
