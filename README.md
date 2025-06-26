# 🍋 MongoDB Wrapper for FiveM

> ⚠️ **This resource is currently in testing phase.** Expect frequent updates and improvements. Feedback is welcome!

A modern and lightweight **MongoDB wrapper** built for **FiveM** using Lua. It provides a simple and efficient way to interact with MongoDB databases in your server scripts, supporting all the essential operations like `find`, `insert`, `update`, and `delete`.

---

## 🚀 Features

- ✅ Simple and readable Lua MongoDB API
- ✅ Asynchronous operations with callback support
- ✅ Support for `ObjectId` conversion
- ✅ ESX/QBCore-friendly
- ✅ Easily extendable for custom use cases
- ✅ Built with scalability in mind

---

## 📦 Supported Operations

- `Mongo:Find()`
- `Mongo:FindOne()`
- `Mongo:InsertOne()`
- `Mongo:UpdateOne()`
- `Mongo:DeleteOne()`
- `Mongo:FindMany()`
- `Mongo:FindOneAndDelete()`

---

## 📚 Example Usage

```lua
local Mongo
RegisterCommand('getusers', function(source, args, rawCommand)
    Mongo:Find({
        collection = "users",
        query = {}
    }, function(users)
        if not users or #users == 0 then
            print("^1No users found.^7")
            return
        end

        for _, user in ipairs(users) do
            print(("User: %s | Last Login: %s"):format(user.username, user.last_login or "Never"))
        end
    end)
end, false)
```


## ⚙️ Configuration


```cfg

set mongoCredentials "mongodb+srv://acc:pw@cluster0.127c7e5.mongodb.net/db"
set mongoDatabase "db"

```



