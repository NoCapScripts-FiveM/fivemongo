local Mongo = exports["fivemongo"]


RegisterCommand('register', function(source, args, rawCommand)
    local username = args[1]
    local password = args[2]
    local src = tonumber(source)    
    if not username or not password then
        print("^1Usage: /register <username> <password>^7")
        return
    end

    Mongo:InsertOne({
        collection = "users",
        document = {
            username = username,
            password = password,
            created_at = os.date("%Y-%m-%d %H:%M:%S"),
            last_login = nil    ,
            whitelist = false,
            source = src,

            ip = ''  -- Assuming you want to store the player's IP address
        }
    }, function(result)
        if result then
            print("^2User registered successfully.^7")
        else
            print("^1Failed to register user.^7")
        end
    end)
end, false)


RegisterCommand('login', function(source, args, rawCommand)
    local username = args[1]
    local password = args[2]

    if not username or not password then
        print("^1Usage: /login <username> <password>^7")
        return
    end

   Mongo:FindOne({
        collection = "users",
        query = { username = username, password = password }
    }, function(result)
        if result then
            print("^2Login successful for user: " .. result.username .. "^7")
             print("^2User IP: " .. result.ip .. "^7")
        else
            print("^1Invalid username or password.^7")
        end
    end)
end, false)


RegisterCommand('deleteuser', function(source, args, rawCommand)
    local username = args[1]

    if not username then
        print("^1Usage: /deleteuser <username>^7")
        return
    end

    Mongo:DeleteOne({
        collection = "users",
        query = { username = username }
    }, function(result)
        print("^5Mongo Raw Result:^7", json.encode(result))

        if result and result.deletedCount == 1 then
            print("^2User deleted successfully.^7")
        elseif result and result.deletedCount == 0 then
            print("^1No user found with that username.^7")
        else
            print("^1Failed to delete user.^7")
        end
    end)
end, false)

RegisterCommand('getusers', function(source, args, rawCommand)
    Mongo:Find({
        collection = "users",
        query = {}  -- Use empty table, NOT nil
    }, function(result)
        if not result or #result == 0 then
            print("^1No users found.^7")
            return
        end

        for _, user in ipairs(result) do
            print("User: " .. user.username .. ",  Last Login: " .. (user.last_login or "Never"))
        end
    end)
end, false)




local function OnPlayerConnecting(name, setKickReason, deferrals)
    local player = source
    local steamIdentifier
    local identifiers = GetPlayerIdentifiers(player)

    for _, v in pairs(identifiers) do
        if string.find(v, "steam") then
            steamIdentifier = v
            break
        end
    end

    Mongo:InsertOne({
        collection = "players",
        document = {
            name = name,
            identifier = steamIdentifier or "unknown",
            connected_at = os.date("%Y-%m-%d %H:%M:%S"),
            source = player
        }
    }, function(result)
        if result then
            print("^2Player connecting: " .. name .. ", Identifier: " .. (steamIdentifier or "unknown") .. "^7")
        else
            print("^1Failed to log player connection.^7")
        end
    end)

    if not steamIdentifier then
        CancelEvent()
        setKickReason("You are not connected to Steam.")
    end
end

AddEventHandler("playerConnecting", OnPlayerConnecting)


