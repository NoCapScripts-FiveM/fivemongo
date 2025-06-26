fx_version "cerulean"
game "common"
lua54 "yes"
name "mongodb"
description "Start using mongodb in FiveM."

version "3.6.7-beta"


shared_scripts {
    
    "init.lua",
    "@ox_lib/init.lua",
}

server_scripts  {
    "@oxmysql/lib/MySQL.lua",
    "server/*.lua",
    
    "dist/build.js",

    
} 

files {
    "init.lua",
}