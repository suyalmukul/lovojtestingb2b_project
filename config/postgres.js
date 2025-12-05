require("dotenv").config({
    path: `config/.env.${process.env.NODE_ENV}`,
});

const { Sequelize } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize(
    process.env.POSTGRES_DATABASE_NAME,
    process.env.username,
    process.env.password,
    {
        host: process.env.POSTGRES_DB_URL,
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: false, // Set to true if you want to log queries
        // dialectOptions: {
        //     ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
        // },
        pool: {
            max: Number(process.env.DB_MAX) || 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test Database Connection
(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        console.log('Sequelize connected to PostgreSQL ✅');
    } catch (error) {
        console.error('❌ Sequelize connection error:', error);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🚦 Closing database connection...');
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
});

module.exports = sequelize;
