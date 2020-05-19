
var columns = [
    {"index": "name",  "renderer": (r) => r.player.name},
    {"index": "won",   "renderer": (r) => r.won? "Won" : "Lost"},
    {"index": "items", "renderer": renderItems}];

function insertEntry(row){
var log = $(".log-table tbody");
var logString = "";
columns.forEach((key, i) => {
    logString += `<td class=${key.index}-col>` + key.renderer(row) + "</td>";
});
log.append(
"<tr>" + logString + "</tr>"
)
}

function renderItems(row){
  var markup = ""
  row.items.forEach((elt, i) => {
    markup += `<img class="image-icon" src=\"images/${elt.gfx}\" title=\"${elt.name}\" width=64px hieght=>`
  });
  return markup
}
function getLogEntries(){
  $.ajax({
    url: "/log",
    method: "GET",
    success: function(res){
      res.forEach((row, i) => {
        insertEntry(row)
      });

    },
    failure: function(res){

    }
  })
}
$(document).ready(getLogEntries)
