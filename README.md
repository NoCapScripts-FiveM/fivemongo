# 🍋 MongoDB Wrapper for FiveM

> ⚠️ **This resource is in active development.** Bugs and frequent updates are expected. Feedback and contributions are welcome!

A modern, lightweight **MongoDB wrapper** built for **FiveM** using Lua and TypeScript. It provides a simple and efficient way to interact with MongoDB databases inside your server scripts — supporting all essential operations such as `find`, `insert`, `update`, `delete`, and more.

---

## 🚀 Features

- ✅ Clean and readable Lua-based API  
- ✅ Asynchronous operations with callback support  
- ✅ Automatic `ObjectId` handling  
- ✅ Compatible with ESX / QBCore  
- ✅ Easily extendable for custom use cases  
- ✅ Built with scalability in mind  

---


## 🍋 MongoDB Install

-  [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/#std-label-install-mdb-community-edition)

## 📦 Supported Operations

- `Mongo:Find()`  
- `Mongo:FindOne()`  
- `Mongo:InsertOne()`  
- `Mongo:InsertMany()`  
- `Mongo:UpdateOne()`  
- `Mongo:UpdateMany()`  
- `Mongo:DeleteOne()`  
- `Mongo:DeleteMany()`  
- `Mongo:FindMany()`  
- `Mongo:FindOneAndDelete()`  
- `Mongo:Count()`  
- `Mongo:Aggregate() `  *[TODO]*
- `Mongo:FindSpec()` *(custom utility)*

---

## 📚 Example Usages



```lua
local Mongo
RegisterCommand('getusers', function(source, args, rawCommand)
    Mongo:FindMany({
        collection = "users",
        query = {}
    }, function(err, users)
        if not users or #users == 0 then
            print("^1No users found.^7")
            return
        end

        for _, user in ipairs(users) do
            print(("User: %s | Last Login: %s"):format(user.username, user.last_login or "Never"))
        end
    end)
end, false)


Mongo:FindOne({
    collection = "developers",
    query = { steamhex = identifier }
}, function(err, existingUser)
    if (err) then
        print("Error searching developer whitelist:", err)
        return cb(false)
    end

   

    if (existingUser) then
        -- User found in whitelist
        print("User already in whitelist:", json.encode(existingUser))
        cb(true)  -- Already whitelisted, treat as success
    elseif (not existingUser) then
        -- User not found, insert new whitelist entry
        Mongo:InsertOne({
            collection = "developers",
            document = {
                steamhex = identifier,
                addedAt = os.date("!%Y-%m-%dT%H:%M:%SZ") -- ISO 8601 UTC timestamp
            }
        }, function(err, result)
            if (err) then
                print("Failed to add user to developer list:", identifier, err)
                cb(false)
            else
                print("User added to developer list:", identifier)
                cb(true)
            end
        end)
    end
end)


Mongo:InsertMany({
    collection = "users",
    documents = {
        { username = "user1", email = "user1@example.com" },
        { username = "user2", email = "user2@example.com" }
    }
}, function(err, result)
    if err then
        print("InsertMany Error:", err)
    else
        print("Inserted documents:", json.encode(result.insertedIds))
    end
end)


Mongo:UpdateOne({
    collection = "users",
    query = { username = "jane_doe" },
    update = {
        ["$set"] = { last_login = os.date("!%Y-%m-%dT%H:%M:%SZ") } or last_login = os.date("!%Y-%m-%dT%H:%M:%SZ") 
    }
}, function(err, result)
    if err then
        print("UpdateOne Error:", err)
    else
        print("Modified count:", result.modifiedCount)
    end
end)



Mongo:UpdateMany({
    collection = "users",
    query = { active = false },
    update = {
        ["$set"] = { active = true }
    }
}, function(err, result)
    if err then
        print("UpdateMany Error:", err)
    else
        print("Documents updated:", result.modifiedCount)
    end
end)




Mongo:DeleteOne({
    collection = "users",
    query = { username = "user_to_delete" }
}, function(err, result)
    if err then
        print("DeleteOne Error:", err)
    else
        print("Deleted count:", result.deletedCount)
    end
end)




Mongo:DeleteMany({
    collection = "users",
    query = { inactive = true }
}, function(err, result)
    if err then
        print("DeleteMany Error:", err)
    else
        print("Deleted documents:", result.deletedCount)
    end
end)


Mongo:Count({
    collection = "users",
    query = { active = true }
}, function(err, count)
    if err then
        print("CountDocuments Error:", err)
    else
        print("Active users count:", count)
    end
end)


Mongo:FindSpec({
    collection = "users",
    query = { age = { ["$gt"] = 18 } },
    limit = 50
}, function(err, data)
    if err then
        print("Error fetching users:", err)
        return
    end

    for _, user in ipairs(data) do
        print(("User: %s | Identifier: %s"):format(user.username, user.identifier))
    end
end)



-- TODO!
Mongo:Aggregate({
    collection = "users",
    pipeline = {
        { ["$match"] = { active = true } },
        { ["$group"] = {
            _id = "$country",
            count = { ["$sum"] = 1 }
        }}
    }
}, function(err, results)
    if err then
        print("Aggregate Error:", err)
    else
        for _, row in ipairs(results) do
            print(("Country: %s | Users: %d"):format(row._id, row.count))
        end
    end
end)



```


## ⚙️ Configuration


```cfg

set mongoCredentials "mongodb+srv://acc:pw@cluster0.127c7e5.mongodb.net/db"
set mongoDatabase "db"

```


or 



```cfg

set mongoCredentials "mongodb://localhost:27017/db"
set mongoDatabase "db"

```





