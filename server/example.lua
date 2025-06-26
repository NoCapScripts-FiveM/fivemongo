local Mongo = exports["fivemongo"]

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
