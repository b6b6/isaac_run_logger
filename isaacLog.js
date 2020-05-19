module.exports = {
  "api": api,
  "parse": parseLog,
  "cache": writeCache,
  "renderImage": renderImage
}

const fs = require('fs')
const path = require('path')
const QUESTION_MARK = path.join(getIsaacDir(),"resources", "gfx", "items", "collectibles", "questionmark.png")

let cache = readCache()
function api(req, res){
    if (req.method == "GET"){
      console.log('Got to GET')
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(parseLog())
    }
}

function getModDir(){
  return path.join(process.env['userprofile'], 'Documents', 'My games', 'Binding of Isaac Afterbirth+ Mods')
}
function getIsaacDir(){
  return path.join(process.env['ProgramFiles(x86)'], 'Steam', 'steamapps', 'common', 'The Binding of Isaac Rebirth', 'resources')
}

function getMods(){
  const modDir = getModDir()
  return dirEntries(modDir)
}

function getChildren(p){
  const dir = fs.opendirSync(p)
  let pages = []
  let currPage = dir.readSync()
  while (currPage){
    pages.push(currPage)
    currPage = dir.readSync()
  }
  dir.closeSync()
  return pages
}

function getChildrenDirs(p){
  return getChildren(p).filter((e)=> e.isDirectory())
}

function search(p, entry){
  if (fs.existsSync(path.join(p, entry))){
    return [path.join(p, entry)]
  }
  else {
    let children = getChildrenDirs(p)
    let found = []
    children.forEach((item, i) => {
      found = found.concat(search(path.join(p, item.name), entry))
    });
    return found
  }
}

function writeCache(){
    fs.writeFileSync('cache', JSON.stringify(cache))
}

function readCache(){
    return JSON.parse(fs.readFileSync('cache'))
}

function parseLog(){
  const options = {
    "encoding": "utf8"
  }
  content = fs.readFileSync('isaac.log', options)
  let lines = content.split(/\r?\n/).filter((l) => l !="")
  lines.forEach((log, i) => {
    lines[i] = JSON.parse(log)
    lines[i]["items"].forEach((entry, j) => {
      let imageName = path.basename(entry.gfx)
      if (!(imageName in cache)){
        let modGfx = search(getModDir(), entry.gfx)
        let baseGfx = search(getIsaacDir(), entry.gfx)
        if (modGfx[0]){
          cache[imageName] = modGfx[0]
        }
        else if (baseGfx[0]) {
          cache[imageName] = baseGfx[0]
        }
        else {
          cache[imageName] = QUESTION_MARK
        }
      }
      entry.gfx = imageName
    });
  });
  return JSON.stringify(lines.filter((e) => e != ""))
}

function renderImage(req, res){
  console.log('renderImage')
  if (path.basename(req.url) in cache){
    res.statusCode = 200
    res.setHeader("Content-Type", "image/png")
    res.end(fs.readFileSync(cache[path.basename(req.url)]))
  }
  else {
    res.statusCode = 404
    res.setHeader("Content-Type", "text/html")
    res.end("Image Not Found")
  }
}
