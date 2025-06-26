import { ObjectId } from "mongodb";
import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";



export async function DeleteOne(context?: any, callback?: Function) {
    try {
        if (!context || typeof context !== "object") {
        console.warn("Invalid context passed to DeleteOne.");
        return callback ? callback(null) : null;
        }
    
        const data = await middleware(context);
        if (!data || typeof data !== "object") {
        console.warn("Middleware returned invalid data.");
        return callback ? callback(null) : null;
        }
    
        const query = prepareObject(data.params?.query || {});
        const options = prepareObject(data.params?.options || {});
        const { db } = await connectToDatabase();
        const collection = db.collection(data.params?.collection || context.collection);
    
        if (query._id && typeof query._id === "string") {
        query._id = new ObjectId(query._id);
        }
        const result = await collection.deleteOne(query, options);
        if (Config.Debug) {
            console.log(
                `^2[MongoDB] DeleteOne on collection ${data.params?.collection || context.collection} completed with ${result.deletedCount} document deleted.^7`
            );
        }
        return callback ? callback(result) : result;        
    } catch (error: any) {
        console.error("DeleteOne error:", error.message);
        return callback ? callback(null) : null;
    }
}