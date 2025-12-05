const { DataTypes } = require('sequelize');
const db = require('../config/postgres')
const Asset = db.define('Asset', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  category: { type: DataTypes.STRING, allowNull: false },
  page: { type: DataTypes.STRING, allowNull: false },
  file: { type: DataTypes.TEXT, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  format: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: true,
  tableName: 'assets'
});

module.exports = Asset;