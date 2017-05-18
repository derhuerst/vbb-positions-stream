#!/usr/bin/env node
'use strict'

const a = require('assert')
const isStream = require('is-stream')
const positions = require('.')

const bbox = [52.544990, 13.347711, 52.558346, 13.367170]
const p = positions(bbox)

p.once('error', (err) => {
	console.error(err)
	process.exit(1)
})

a.ok(isStream(p))
p.on('data', (d) => {
	a.strictEqual(typeof d.line, 'string')
	a.strictEqual(typeof d.product, 'string')
	a.strictEqual(typeof d.when, 'number')

	a.strictEqual(typeof d.latitude, 'number')
	a.ok(d.latitude > bbox[0])
	a.ok(d.latitude < bbox[2])

	a.strictEqual(typeof d.longitude, 'number')
	a.ok(d.longitude > bbox[1])
	a.ok(d.longitude < bbox[3])
})

