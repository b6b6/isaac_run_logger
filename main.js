const http = require('http')
const fs = require('fs')
const isaacLog = require("./isaacLog")

const staticRouter = function(path, mimeType){
  return function(req, res){
    const options = {"encoding" : "utf8"}
    res.statusCode = 200
    res.setHeader("Content-Type", mimeType)
    res.end(fs.readFileSync('assets/' + path, options))
  }
}

const port = 80

const router = {
  '/' : staticRouter('isaac_log.html', 'text/html'),
  '/log' : isaacLog.api,
  '/style.css': staticRouter('style.css', 'text/css'),
  '/logger.js': staticRouter('logger.js', 'text/javascript')
}


const server = http.createServer((req, res) => {
  console.log(`Method: ${req.method} Path: ${req.url}`)
  try {
    if (req.url in router){
      router[req.url](req, res)
    }
    else {
      if (req.url.match(/\/images/)){
        console.log('matched')
        isaacLog.renderImage(req, res)
      }
    }
  } catch (e) {
    res.statusCode = "404"
    res.setHeader("Content-Type", "text/html")
    res.end(e.message + "\n" + e.stack)
  }
})

server.listen(port, () => {
  console.log(`Server running at port ${port}`)
})
setTimeout(isaacLog.cache, 60 * 1000)
