local Mongo = exports["fivemongo"]


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






RegisterCommand("addproduct", function(source, args, rawCommand)
    local productName = args[1] or "Red Car"
    local randomPrice = math.random(1000, 5000)

    Mongo:InsertOne({
        collection = "products",
        document = {
            name = productName,
            price = randomPrice,
            category = "vehicle"
        }
    }, function(result)
        if result then
            print("^2Inserted product successfully!^7")

            Mongo:FindOne({
                collection = "products",
                query = { name = productName }
            }, function(findResult)
                if not findResult or not findResult.name then
                    print("^1Product not found or missing name field.^7")
                    return
                end
                print("^5Mongo Raw Result:^7", json.encode(findResult))
                print("The first product is: " .. findResult.name)
            end)

            Mongo:FindMany({
                collection = "products",
                query = { category = "vehicle" }
            }, function(findManyResult)
                if not findManyResult or #findManyResult == 0 then
                    print("^1No products found in the vehicle category.^7")
                    return
                end

                for _, product in ipairs(findManyResult) do
                    print("Vehicle Product: " .. product.name .. ", Price: " .. product.price)
                end

                print("^2Found " .. #findManyResult .. " products in the vehicle category.^7")
            end)
        else
            print("^1Failed to insert product^7")
        end
    end)
end, false)

RegisterCommand("findproduct", function(source, args, rawCommand)
    local productName = args[1]
    if not productName then
        print("^1Please provide a product name to find.^7")
        return
    end

    Mongo:FindOne({
        collection = "products",
        query = { name = productName }
    }, function(result)
        print("^5Mongo Raw Result:^7", json.encode(result))
        if not result then
            print("^1Product not found.^7")
            return
        end
        if result then
             print("Found product: " .. result.name .. ", Price: " .. result.price)
        end
      
    end)
end, false)

RegisterCommand("getproducts", function(source, args, rawCommand)
    Mongo:Find({
        collection = "products",
        query = {}
    }, function(result)
        if not result or #result == 0 then
            print("^1No products found.^7")
            return
        end

        for _, product in ipairs(result) do
            print("Product: " .. product.name .. ", Price: " .. product.price)
        end
    end)
end, false)

RegisterCommand("deleteproduct", function(source, args, rawCommand)
    local productName = args[1]
    if not productName then
        print("^1Please provide a product name to delete.^7")
        return
    end

    Mongo:FindOne({
        collection = "products",
        query = { name = productName }
    }, function(findResult)
        if not findResult then
            print("^1Product not found.^7")
            return
        end

        Mongo:DeleteOne({
            collection = "products",
            query = { name = productName }
        }, function(deleteResult)
            if deleteResult and deleteResult.deletedCount and deleteResult.deletedCount > 0 then
                print("^2Deleted product: " .. productName .. "^7")
            else
                print("^1Failed to delete product.^7")
            end
        end)
    end)
end, false)
