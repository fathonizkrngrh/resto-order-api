/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('staffs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    merchant_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(14),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    roles: {
      type: DataTypes.ENUM('owner','cashier','waiter'),
      allowNull: false,
      defaultValue: "owner"
    },
    status: {
      type: DataTypes.ENUM('active','incative'),
      allowNull: false,
      defaultValue: "active"
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified_on: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0, 1"
    }
  }, {
    sequelize,
    tableName: 'staffs',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
