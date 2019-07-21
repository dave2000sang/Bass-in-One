const ytdl = require('ytdl-core')
const url = 'QuJGPMFGvKI'
const fs = require('fs')

ytdl(url).pipe(fs.createWriteStream('audio.mp3'))

