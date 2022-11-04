'use strict';

var dbm;
var type;
var seed;
var async = require('async');
var mc = require('../migrate-common.js');

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

var NETWORKS_TO_LINK_RENAMES = ["links", "SINMap"];

/*
  This migration is likely to be overtaken by design changes, but is provided for
  consistency.
*/
exports.up = function (db, callback) {
	mc.log("migrating to 1.0.9");
	// runSql used as to rename a primary key in use as a foreign key
	// should be done via dropping foreign the key, renaming and then
	// readding, MySQL 'RENAME COLUMN' is shorthand for this, but is
	// probably not portable.
	async.series([
		db.renameTable.bind(db, "networks", "links"),
		(cb) => {
			mc.log("Changing id_network to id_link", mc.DEBUG);
			NETWORKS_TO_LINK_RENAMES.forEach((table) => {
				mc.log("table " + table, mc.DEBUG);
				db.runSql(
					"ALTER TABLE " + table + " RENAME COLUMN id_network TO id_link",
				);
			});
			cb(null);
		},
		db.renameTable.bind(db, "SINMap", "SystemInterfaceToLinkMap"),
		db.renameColumn.bind(db, "SystemInterfaceToLinkMap", "id_SINMap", "id_SILMap"),

		db.renameTable.bind(db, "SIMap", "InterfaceToSystemMap"),
		db.runSql.bind(db,
			"ALTER TABLE InterfaceToSystemMap RENAME COLUMN id_SIMap to id_ISMap"
		),

		db.createTable.bind(db, "technologyCategories",
			{
				id_techCategory: {
					type: "int",
					autoIncrement: true,
					primaryKey: true,
					notNull: true
				},
				name: { type: "varchar", length: 45, notNull: true },
				color: { type: "varchar", length: 45, notNull: true }
			}
		),
		db.addColumn.bind(db, "technologies", "id_techCategory",
			{
				type: "int",
				notNull: true, foreignKey: {
					name: 'fk_technologies_techCategory_idx',
					table: 'technologyCategories',
					mapping: 'id_techCategory', rules: {
						onDelete: 'No Action', onUpdate: 'No Action'
					}
				}
			}
		),
		async () => {
			var cb = arguments[arguments.len - 1];
			mc.log("Calling foreach", mc.DEBUG);
			var fall = [];
			["Red",
				"Green",
				"Blue"
			].forEach((val) => {
				mc.log("Calling insert for " + val, mc.INFO);
				db.insert(
					"technologyCategories", ["name", "color"],
					[val, val.toLowerCase()]
				);
				mc.log("Selecting for " + val, mc.INFO);
				function update_table(err, results) {
					if (err) {
						mc.log("Error in select id tech category " + err, mc.ERROR);
						return;
					}
					mc.log(`select for ${val} got ${results[0]["id"]} updating`, mc.INFO);
					var p = db.runSql("UPDATE technologies SET id_techCategory = ? " +
						" WHERE category = ?", [results[0]["id"], val.toLowerCase()]
					);
					fall.push(p);
				};
				var p = db.runSql("SELECT id_techCategory as id FROM technologyCategories WHERE name = ?", val, update_table);
				fall.push(p);
			});
			mc.log("For each call completed, removing column after wait", mc.DEBUG);
			await Promise.all(fall);
			db.removeColumn("technologies", "category");
			mc.log("Column remove done", mc.INFO);
			if (typeof cb == "function") {
				cb(null);
			}
		},
		db.createTable.bind(db, 'paramGroups', {
			id_paramGroup: { type: 'int', autoIncrement: true, primaryKey: true, notNull: true },
			name: { type: 'varchar', length: 45, notNull: true },
			description: { type: 'longtext' }
		}),
		db.createTable.bind(db, 'paramDefinitions', {
			id_paramDefinition: { type: 'int', autoIncrement: true, primaryKey: true, notNull: true },
			id_paramGroup: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_paramDefinitions_paramGroup_idx',
					table: 'paramGroups',
					mapping: 'id_paramGroup', rules: {
						onDelete: 'No Action', onUpdate: 'No Action'
					}
				}
			},
			name: { type: 'varchar', length: 45 },
			description: { type: 'longtext' },
			paramType: { type: 'varchar', length: 45 },
			options: { type: 'longtext' },
			applicableToSystem: { type: 'boolean', default: false },
			applicableToInterface: { type: 'boolean', default: false },
			applicableToLink: { type: 'boolean', default: false },
			applicableToTechnology: { type: 'boolean', default: false }
		}),
		db.createTable.bind(db, 'params', {
			id_param: { type: 'int', autoIncrement: true, primaryKey: true, notNull: true },
			id_paramDefinition: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_params_paramDefinitions_idx',
					table: 'paramDefinitions',
					mapping: 'id_paramDefinition', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			},
			value: { type: 'longtext' },
			id_system: {
				type: 'int', notNull: false, foreignKey: {
					name: 'fk_params_systems_idx',
					table: 'systems',
					mapping: 'id_system', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			},
			id_interface: {
				type: 'int', notNull: false, foreignKey: {
					name: 'fk_params_interfaces_idx',
					table: 'interfaces',
					mapping: 'id_interface', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			},
			id_link: {
				type: 'int', notNull: false, foreignKey: {
					name: 'fk_params_links_idx',
					table: 'links',
					mapping: 'id_link', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			},
			id_technology: {
				type: 'int', notNull: false, foreignKey: {
					name: 'fk_params_technologies_idx',
					table: 'technologies',
					mapping: 'id_technology', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			},
		}),
		db.addColumn.bind(db, 'SystemInterfaceToLinkMap', 'isPrimary',
			{ type: 'boolean' }),
		db.runSql.bind(db, 'UPDATE SystemInterfaceToLinkMap set isPrimary=true WHERE category = "primary"'),
		db.runSql.bind(db, 'UPDATE SystemInterfaceToLinkMap set isPrimary=false WHERE category = "alternate"'),
		db.runSql.bind(db, "DELETE FROM SystemInterfaceToLinkMap WHERE category = 'incapable'"),
		db.removeColumn.bind(db, 'SystemInterfaceToLinkMap', 'category')
	], callback);
};

exports.down = function (db, callback) {
	async.series([
		db.addColumn.bind(db, "SystemInterfaceToLinkMap", "category", {
			type: 'varchar', length: 16, notNull: false
		}),
		db.runSql.bind(db, 'UPDATE SystemInterfaceToLinkMap set category = "primary" WHERE isPrimary=true'),
		db.runSql.bind(db, 'UPDATE SystemInterfaceToLinkMap set category = "alternate" WHERE isPrimary=false'),
		db.removeColumn.bind(db, 'SystemInterfaceToLinkMap', 'isPrimary'),

		db.dropTable.bind(db, 'paramGroups', { ifExists: true }),
		db.dropTable.bind(db, 'paramDefinitions', { ifExists: true }),
		db.dropTable.bind(db, 'params', { ifExists: true }),

		db.addColumn.bind(db, "technologies", "category", {
			type: 'varchar', length: 16
		}),
		async () => {
			var cb = arguments[arguments.len - 1];
			mc.log("Restoring color data", mc.DEBUG);
			var promises = [];
			db.runSql('SELECT name, color FROM technologyCategories',
				(err, results) => {
					if (err) {
						mc.log('Failed to get colors for restoration', mc.WARNING);
						return;
					}
					results.forEach(row => {
						promises.push(
							db.runSql(
								"UPDATE technologies SET category = ? WHERE id_technology = ?",
								row["name"], row["id"]
							)
						);
					});
				});
			await Promise.all(promises);
			db.removeForeignKey('technologies', 'fk_technologies_techCategory'),
				db.removeColumn('technologies', 'id_techCategory');
			if (cb) {
				cb(null);
			}
		},

		db.dropTable.bind(db, 'technologyCategories', { ifExists: true }),

		db.runSql.bind(db,
			"ALTER TABLE InterfaceToSystemMap RENAME COLUMN id_ISMap to id_SIMap"
		),
		db.renameTable.bind(db, 'InterfaceToSystemMap', 'SIMap'),
		db.renameColumn.bind(db, 'SystemInterfaceToLinkMap', 'id_SILMap', 'id_SINMap'),
		db.renameTable.bind(db, 'SystemInterfaceToLinkMap', 'SINMap'),
		(cb) => {
			mc.log("Changing id_link to id_network", mc.DEBUG);
			NETWORKS_TO_LINK_RENAMES.forEach((table) => {
				mc.log("table " + table, mc.DEBUG);
				db.runSql(
					"ALTER TABLE " + table + " RENAME COLUMN id_link TO id_network",
				);
			});
			cb(null);
		},
		db.renameTable.bind(db, 'links', 'networks')

	], callback);

};

exports._meta = {
	"version": 1
};