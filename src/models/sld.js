/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Sld = sequelize.define('Sld', {
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
    tableName: 't_sld'
  })

  Sld.associate = function (models) {
    Sld.hasMany(models.Record)
  }

  return Sld
}
