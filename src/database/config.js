import * as entities from 'src/entities/index';
import * as migrations from './migrations/index';
import * as subscribers from 'src/subscribers/index';

const ormconfig = require('../../ormconfig.json');

ormconfig.entities = Object.values(entities);
ormconfig.migrations = Object.values(migrations);
ormconfig.subscribers = Object.values(subscribers);

export default ormconfig;