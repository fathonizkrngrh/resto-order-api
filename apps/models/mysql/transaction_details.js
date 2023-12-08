/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transaction_details', {
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
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
    trx_code: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
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
    tableName: 'transaction_details',
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
      {
        name: "transaction_details_FK",
        using: "BTREE",
        fields: [
          { name: "cart_id" },
        ]
      },
      {
        name: "transaction_details_FK_2",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "transaction_details_FK_3",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
    ]
  });
};
