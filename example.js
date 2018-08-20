'use strict'

const positions = require('.')

const readable = positions({
	north: 52.5,
	west: 13.389,
	south: 52.497,
	east: 13.395
})
readable.once('error', (err) => {
	console.error(err)
	process.exit(1)
})

let i = 0
readable.on('data', (movement) => {
	console.log(movement)
	if (++i >= 5) readable.destroy() // stop receiving positions
})
