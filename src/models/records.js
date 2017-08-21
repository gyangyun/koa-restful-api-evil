/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Record = sequelize.define('Record', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    dname: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    urltype: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    evilclass: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    eviltype: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    source: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 't_records'
  })

  Record.associate = function (models) {
    Record.belongsTo(models.Sld)
  }

  return Record
}
