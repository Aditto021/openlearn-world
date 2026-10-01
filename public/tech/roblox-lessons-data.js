const ROBLOX_LESSONS = [
  {
    id: 'hello', icon: '👋', title: 'Hello, Output',
    where: 'Script, inside ServerScriptService',
    summary: 'Every script has a print() for debugging — output shows up in Studio’s Output window (View → Output).',
    code: `print("Hello, Roblox!")

-- Variables use local by default
local playerName = "Builder"
print("Welcome, " .. playerName)`
  },
  {
    id: 'parts', icon: '🧱', title: 'Changing a Part',
    where: 'Script, inside ServerScriptService (assumes a Part named "MyPart" in Workspace)',
    summary: 'Every object in the 3D world is an Instance with properties you can read and set directly from a script.',
    code: `local part = workspace:WaitForChild("MyPart")

part.Color = Color3.fromRGB(110, 231, 255)
part.Transparency = 0.2
part.Anchored = true
part.Size = Vector3.new(4, 1, 4)`
  },
  {
    id: 'touch', icon: '👆', title: 'Touch Events',
    where: 'Script, inside ServerScriptService',
    summary: 'Touched fires whenever anything touches the part — a debounce (a "cooldown" flag) stops it firing dozens of times per second.',
    code: `local part = workspace:WaitForChild("MyPart")
local debounce = false

part.Touched:Connect(function(hit)
  if debounce then return end
  debounce = true

  part.Color = Color3.fromRGB(52, 211, 153)
  print(hit.Parent.Name .. " touched the part!")

  task.wait(1)
  debounce = false
end)`
  },
  {
    id: 'leaderstats', icon: '🏆', title: 'A Score System (leaderstats)',
    where: 'Script, inside ServerScriptService',
    summary: 'Roblox automatically shows any "leaderstats" folder under a Player as a scoreboard — this is the standard pattern almost every game uses for points/coins/level.',
    code: `local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
  local leaderstats = Instance.new("Folder")
  leaderstats.Name = "leaderstats"
  leaderstats.Parent = player

  local points = Instance.new("IntValue")
  points.Name = "Points"
  points.Value = 0
  points.Parent = leaderstats
end)`
  },
  {
    id: 'ui', icon: '🖱️', title: 'A Clickable Button',
    where: 'LocalScript, inside the button (a TextButton in a ScreenGui under StarterGui)',
    summary: 'UI logic runs client-side with a LocalScript — only the player who clicks sees the effect, unless you explicitly tell the server.',
    code: `local button = script.Parent -- the TextButton this script sits inside

button.MouseButton1Click:Connect(function()
  button.Text = "Clicked!"
  button.BackgroundColor3 = Color3.fromRGB(52, 211, 153)
end)`
  },
  {
    id: 'module', icon: '📦', title: 'Reusable Code (ModuleScript)',
    where: 'ModuleScript named "MathUtils" in ReplicatedStorage, required from a Script',
    summary: 'ModuleScripts package functions you want to reuse across multiple scripts — require() runs the module once and gives you back whatever it returns.',
    code: `-- MathUtils (ModuleScript)
local MathUtils = {}

function MathUtils.clampHealth(value)
  return math.clamp(value, 0, 100)
end

return MathUtils

-- In another Script:
local MathUtils = require(game.ReplicatedStorage.MathUtils)
print(MathUtils.clampHealth(150)) --> 100`
  },
];
