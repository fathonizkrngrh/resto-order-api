/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('account_sessions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    useragent: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    expired: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified_on: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'account_sessions',
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
        name: "admin_sessions_FK",
        using: "BTREE",
        fields: [
          { name: "account_id" },
        ]
      },
    ]
  });
};
