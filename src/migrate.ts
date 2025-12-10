import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./db";
import {neon} from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";

const databseUrl = process.env.DATABASE_URL;
if(!databseUrl) {
    throw new Error("databse url not found")
}

const sql = neon(databseUrl);

const dbClient = drizzle(sql)

async function main() {
    try {
        await migrate(dbClient, {migrationsFolder: "drizzle"})
        console.log("migration successfull")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

main()
