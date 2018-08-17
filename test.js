#!/usr/bin/env node
'use strict'

const a = require('assert')
const isStream = require('is-stream')
const positions = require('.')

const p = positions({
	north: 52.558346,
	west: 13.367170,
	south: 52.544990,
	east: 13.347711
})

setTimeout(() => p.destroy(), 10 * 1000)

p.once('error', (err) => {
	console.error(err)
	process.exit(1)
})

a.ok(isStream(p))
p.on('data', (d) => {
	a.strictEqual(typeof d.line, 'string')
	a.strictEqual(typeof d.mode, 'string')
	a.strictEqual(typeof d.product, 'string')
	a.strictEqual(typeof d.when, 'number')

	a.strictEqual(typeof d.latitude, 'number')
	if (!(d.latitude > 52.5)) console.error(d.line, d.latitude)
	a.ok(d.latitude > 52.5)
	if (!(d.latitude < 52.6)) console.error(d.line, d.latitude)
	a.ok(d.latitude < 52.6)

	a.strictEqual(typeof d.longitude, 'number')
	if (!(d.longitude > 13.3)) console.error(d.line, d.longitude)
	a.ok(d.longitude > 13.3)
	if (!(d.longitude < 13.4)) console.error(d.line, d.longitude)
	a.ok(d.longitude < 13.4)
})

