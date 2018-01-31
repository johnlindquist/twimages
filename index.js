const Nightmare = require("nightmare")
const download = require("./downloader")
const zip = require("./zipper")
const fs = require("fs-extra")
const path = require("path")

const checkBottom = async nightmare => {
  console.log(`scrolling...`)
  const check = await nightmare.evaluate(() => {
    const { className } = document.querySelector(
      ".timeline-end"
    )

    return className.includes("has-more-items")
  })

  return check
}
const scrape = async function(id) {
  const nightmare = Nightmare({ show: false })
  await nightmare.goto(
    `https://twitter.com/${id}/media`
  )

  await nightmare.wait("#page-container")

  while (await checkBottom(nightmare)) {
    const sh = await nightmare.evaluate(
      () => document.body.scrollHeight
    )
    await nightmare.scrollTo(sh, 0).wait(100)
  }

  return await nightmare
    .evaluate(() =>
      Array.from(document.querySelectorAll("img"))

        .filter(img =>
          img.src.startsWith(
            "https://pbs.twimg.com/media/"
          )
        )
        .map(({ src, alt = "" }) => ({
          src,
          alt
        }))
    )
    .end()

    .then(data => data)
    .catch(error => {
      console.error("Search failed:", error)
    })
}

const go = async function(id) {
  const images = await scrape(id)
  const dir = path.join(__dirname, id)
  await fs.remove(dir)
  await fs.ensureDir(dir)
  await download(dir, images)

  console.log(`DONE DOWNLOADING`)
  await zip(id)
}

const send = require("send")
const query = require("micro-query")

module.exports = async (req, res) => {
  const { id } = query(req)
  if (!id) return "I need an id!"

  await go(id)
  send(
    req,
    path.join(__dirname, `${id}.zip`)
  ).pipe(res)
}
