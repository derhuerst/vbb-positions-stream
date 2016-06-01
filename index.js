'use strict'

const movements = require('./request')

const duration = 60000
const bbox = [52.544990, 13.347711, 52.558346, 13.367170]
movements(bbox, {duration})
