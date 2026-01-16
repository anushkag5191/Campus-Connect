const sql = require("mssql/msnodesqlv8");

const config = {
  connectionString:
    "Driver={ODBC Driver 18 for SQL Server};" +
    "Server=localhost\\SQLEXPRESS;" +
    "Database=CampusConnect;" +
    "Trusted_Connection=yes;" +
    "TrustServerCertificate=yes;"
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ SQL Server Connected");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed");
    console.error(err);
    throw err;   // 🔥 THIS LINE FIXES EVERYTHING
  });

module.exports = { sql, poolPromise };
