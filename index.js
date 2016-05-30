'use strict'

const stringify = require('vbb-hafas/lib/stringify')
const request = require('vbb-hafas/lib/request')



const c = stringify.coord

// min latitude, min longitude, max latitude, max longitude
const movements = (bbox) => {
	if (!Array.isArray(bbox) || bbox.length !== 4)
		throw new Error('invalid bbox array')
	const when = new Date()

	return request({
		  meth: 'JourneyGeoPos'
		, req: {
			  maxJny: 256
			, onlyRT: false
			, time: stringify.time(when)
			, date: stringify.date(when)
			, rect: {
				  llCrd: {x: c(bbox[1]), y: c(bbox[0])}
				, urCrd: {x: c(bbox[3]), y: c(bbox[2])}
			}
			, perStep: 10000
			, ageOfReport: true
			, jnyFltrL: [{type: 'PROD', mode: 'INC', value: '127'}]
			, perSize: 30000
			, trainPosMode: 'CALC'
		}
	})
}
