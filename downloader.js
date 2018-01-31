const download = require("image-downloader")
const path = require("path")
const bluebird = require("bluebird")

module.exports = (dest, images) =>
  bluebird.each(
    images.map(({ src }) => src),
    url => {
      return download
        .image({
          url,
          dest
        })
        .then(foo => {
          console.log(`Downloaded: ${url}`)
        })
        .catch(err => {
          console.log(err)
          return ""
        })
    }
  )
