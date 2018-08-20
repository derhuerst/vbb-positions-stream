# vbb-positions-stream

**Get realtime positions of VBB vehicles** in a certain area.

![well](wat.png)

[![npm version](https://img.shields.io/npm/v/vbb-positions-stream.svg)](https://www.npmjs.com/package/vbb-positions-stream)
[![build status](https://img.shields.io/travis/derhuerst/vbb-positions-stream.svg)](https://travis-ci.org/derhuerst/vbb-positions-stream)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-positions-stream.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install vbb-positions-stream
```


## Usage

`positions` returns a [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams) in [object mode](https://nodejs.org/api/stream.html#stream_object_mode).

```js
const positions = require('vbb-positions-stream')

const readable = positions({
	north: 52.5,
	west: 13.385,
	south: 52.495,
	east: 13.395
})
let i = 0
readable.on('data', (movement) => {
	console.log(movement)
	if (++i >= 5) readable.destroy() // stop receiving positions
})
```

```js
{
	tripId: '84/32569/18/21/86',
	mode: 'train',
	product: 'subway',
	latitude: 52.498064,
	longitude: 13.391617,
	when: 1534763850777,
	line: 'U6'
}
{
	tripId: '84/32569/18/21/86',
	mode: 'train',
	product: 'subway',
	latitude: 52.497938,
	longitude: 13.391581,
	when: 1534763852777,
	line: 'U6'
}
{
	tripId: '84/32569/18/21/86',
	mode: 'train',
	product: 'subway',
	latitude: 52.497813,
	longitude: 13.391545,
	when: 1534763854777,
	line: 'U6'
}
{
	tripId: '84/32569/18/21/86',
	mode: 'train',
	product: 'subway',
	latitude: 52.497678,
	longitude: 13.391509,
	when: 1534763856777,
	line: 'U6'
}
{
	tripId: '84/32569/18/21/86',
	mode: 'train',
	product: 'subway',
	latitude: 52.497552,
	longitude: 13.391473,
	when: 1534763858777,
	line: 'U6'
}
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-positions-stream/issues).
