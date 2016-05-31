'use strict'

const line = require('vbb-parse-line')
const util = require('vbb-util')
const got = require('got')
const stringify = require('vbb-hafas/lib/stringify')



const findLine = /([a-z]{0,3}\d{1,3})/i

const parseMovement = (m) => {
	const keyframes = m.p.map((p) => ({
		  latitude:  p.x / 1000000
		, longitude: p.y / 1000000
		, t: +p.t
	}))
	const match = findLine.exec(m.n)[1]
	keyframes.line = match ? line(match): null
	keyframes.product = util.products.bitmasks[parseInt(m.c)]
	keyframes.direction = m.l
	return keyframes
}

// min latitude, min longitude, max latitude, max longitude
const movements = (bbox) => {
	if (!Array.isArray(bbox) || bbox.length !== 4)
		throw new Error('invalid bbox array')

	return got.post('fahrinfo.vbb.de/bin/query.exe/dny', {
		json: true,
		query: {
			  look_miny: stringify.coord(bbox[0])
			, look_minx: stringify.coord(bbox[1])
			, look_maxy: stringify.coord(bbox[2])
			, look_maxx: stringify.coord(bbox[3])
			// todo
			, look_nv: 'zugposmode|2|interval|30000|intervalstep|2000|'
			, look_productclass: '127' // todo
			, tpl: 'trains2json2', look_json: 'yes', performLocating: '1'
		}
	})
	.then((res) => {
		if (!res.body || !Array.isArray(res.body.t)) return []
		return res.body.t.map(parseMovement)
	}, (err) => err)
}
