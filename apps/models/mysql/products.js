/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products', {
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_categories',
        key: 'id'
      }
    },
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    type: {
      type: DataTypes.ENUM('stock','cook'),
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ready: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    total_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('fee','percentage'),
      allowNull: true
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    discount_date_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    discount_date_end: {
      type: DataTypes.STRING(100),
      allowNull: true
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
    tableName: 'products',
    timestamps: false,
  });
};
