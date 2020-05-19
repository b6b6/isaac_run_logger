--[[
Description: Lua hooks to log data from TBOI during runs.
Date 05/18/2020
--]]


-- StartDebug()
local table = require("table")
local json = require("json")
local os = require("os")

 -- Register
local mod = RegisterMod("Run Logger", 1)

local function logger(logString)
  local profile = os.getenv("userprofile")
  local f = assert(io.open(profile .. "\\Documents\\My games\\Binding of Isaac Afterbirth+ Mods\\run_logger\\isaac.log", "a"))
  f:write(tostring(logString) .. "\n")
  f:close()
end

local function getItemString()
  -- OLD
  local player = Isaac.GetPlayer(0)
  local itemString = ""
  local itemCfg = Isaac.GetItemConfig()
  local maxCollectible = itemCfg:GetCollectibles().Size - 1
  for i=1,maxCollectible do
    if player:HasCollectible(i) then
      local coll = itemCfg:GetCollectible(i)
      local entry = string.format("{\"name\": \"%s\", \"gfx\": \"%s\"}", coll.Name, coll.GfxFileName)
      itemString = (itemString == "" and "{" .. entry) or itemString .. " , " .. entry
    end
  end
  itemString = itemString .. "}"
  return itemString
end


local function getMaxCollectibleID(_)
  -- Works with modded items
 return Isaac.GetItemConfig():GetCollectibles().Size - 1
end

local function getState()
  local state = {items= {}, player= {}}
  local player = Isaac.GetPlayer(0)
  -- Source Items in mods vs vanilla
  local itemCfg = Isaac.GetItemConfig()
  local maxCollectible = itemCfg:GetCollectibles().Size - 1
  for i=1,maxCollectible do
     if player:HasCollectible(i) then
       local coll = itemCfg:GetCollectible(i)
       table.insert(state['items'],{name=coll.Name,  gfx=coll.GfxFileName})
     end
  end
  -- Player Info
  state['player']={name=player:GetName()}
  -- Player Data - if needed later
  state['data']=player:GetData()
  return state
end

local function postGameEnd(_, playerWin)
  --  true if lost
  --  false if won
  local state = getState()
  logger(json.encode(state))
  state["won"] = not playerWin
  logger(json.encode(state))
end

mod:AddCallback(ModCallbacks.MC_POST_GAME_END, postGameEnd)
