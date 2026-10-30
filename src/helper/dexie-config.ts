import Dexie from "dexie";



const dataDb = [
    { name: "users", keys: "++id" },

] as const;

export type TableType = (typeof dataDb)[number]["name"];
const nameDataBase = "AppDatabase";
class AppDatabase extends Dexie {

    users!: Dexie.Table<any, number>;


    constructor() {
        super(nameDataBase);
        // Construir el esquema dinámicamente
        const schema: Record<string, string> = {};
        dataDb.forEach((entry) => {
            schema[entry.name] = entry.keys;
        });
        this.version(1).stores(schema);
        dataDb.forEach((entry) => {
            (this as any)[entry.name] = this.table(entry.name);
        });
    }
}

const db = new AppDatabase();
export default db;

export const getDatabaseDexie = async (
    database: TableType,
    orderBy: string = "id",
    reverse: boolean = false
) => {
    const returnDB = db[database];
    return reverse
        ? (await returnDB.orderBy(orderBy).reverse().toArray()) || []
        : (await returnDB.orderBy(orderBy).toArray()) || [];
};

export const updateDatabaseDexie = async (database: TableType, data: any) => {
    try {
        const dbTable = db[database] as Dexie.Table;
        await dbTable.clear();
        await dbTable.bulkAdd(data || []);
    } catch (error) {
        console.error(`Error al insertar datos en la tabla ${database} :`, error);
    }
};

export const deleteDatabase = async () => {
    db.close();
    try {
        await Dexie.delete(nameDataBase);
        await db.open();
    } catch (error) {
        console.error("Error al abrir la base de datos Dexie:", error);
    }
};
