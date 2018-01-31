const zipFolder = require("zip-folder")
const path = require("path")

module.exports = async (dir = "johnlindquist") =>
  await new Promise((res, rej) => {
    zipFolder(
      path.join(__dirname, `${dir}`),
      path.join(__dirname, `${dir}.zip`),
      function(err) {
        if (err) {
          console.log("zip failed")
          rej(err)
        } else {
          console.log("zip success")
          res()
        }
      }
    )
  })
