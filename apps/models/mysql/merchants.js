/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('merchants', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(14),
      allowNull: false
    },
    package_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    facebook: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'merchants',
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
