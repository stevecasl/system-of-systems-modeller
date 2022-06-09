

-- Schema Update: Nested systems

USE db_sosm;

DROP TABLE IF EXISTS SSMap, subsystems, SMap, OSMap, OMap, organisation;

-- ALTER TABLE systems ADD COLUMN level INT AFTER image;

CREATE TABLE IF NOT EXISTS `db_sosm`.`SMap` (
  `id_SMap` INT NOT NULL AUTO_INCREMENT,
  `parent` INT NOT NULL,
  `child` INT NOT NULL,
  PRIMARY KEY (`id_SMap`),
  INDEX `id_parent_idx` (`parent` ASC) VISIBLE,
  INDEX `id_child_idx` (`child` ASC) VISIBLE,
  CONSTRAINT `fk_SMap_system_parent`
    FOREIGN KEY (`parent`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SMap_system_child`
    FOREIGN KEY (`child`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `db_sosm`.`organisation` (
`id_organisation` INT NOT NULL AUTO_INCREMENT,
`name` VARCHAR(200),
PRIMARY KEY (`id_organisation`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `db_sosm`.`OMap` (
  `id_OMap` INT NOT NULL AUTO_INCREMENT,
  `parent` INT NOT NULL,
  `child` INT NOT NULL,
  PRIMARY KEY (`id_OMap`),
  INDEX `id_organisation_parent_idx` (`parent` ASC) VISIBLE,
  INDEX `id_organisation_child_idx` (`child` ASC) VISIBLE,
  CONSTRAINT `fk_OMap_organisation_parent`
    FOREIGN KEY (`parent`)
    REFERENCES `db_sosm`.`organisation` (`id_organisation`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OMap_organisation_child`
    FOREIGN KEY (`child`)
    REFERENCES `db_sosm`.`organisation` (`id_organisation`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `db_sosm`.`OSMap` (
  `id_OSMap` INT NOT NULL AUTO_INCREMENT,
  `id_organisation` INT NOT NULL,
  `id_system` INT NOT NULL,
  `quantity` INT DEFAULT 0,
  PRIMARY KEY (`id_OSMap`),
  INDEX `id_organisation_idx` (`id_organisation` ASC) VISIBLE,
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_OSMap_organisation`
    FOREIGN KEY (`id_organisation`)
    REFERENCES `db_sosm`.`organisation` (`id_organisation`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OSMap_systems`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


ALTER TABLE SIMap ADD COLUMN name VARCHAR(45) AFTER isProposed;
ALTER TABLE networks ADD COLUMN linkColor VARCHAR(45) AFTER image;
ALTER TABLE technologies ADD COLUMN category VARCHAR(45) AFTER name;