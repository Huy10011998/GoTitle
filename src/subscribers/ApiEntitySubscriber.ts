import {
    EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent, RemoveEvent,
    getRepository
} from "typeorm";
import {ApiEntity,SyncQueue} from "src/entities/index";
import {event} from "react-native-reanimated";
let moment = require('moment');


@EventSubscriber()
export class ApiEntitySubscriber implements EntitySubscriberInterface<ApiEntity> {

    listenTo() {
        return ApiEntity;
    }

    beforeInsert(event: InsertEvent<ApiEntity>) {
        console.log(`ApiEntitySubscriber: beforeInsert: `+(event.entity? event.entity.constructor.name : event.entity));
        if (event.entity) {
            if (event.entity.ignoreUpdateSyncedAt === true) {
                event.entity.ignoreUpdateSyncedAt = false;
            } else {
                // update syncedAt
                event.entity.syncedAt = moment().toISOString();
            }
        }

    }

    /**
     * Called before entity insertion.
     */
    beforeUpdate(event: UpdateEvent<ApiEntity>) {
        console.log(`ApiEntitySubscriber: beforeUpdate: `+(event.entity? event.entity.constructor.name+' '+event.entity.id: event.entity));
        if (event.entity) {
            if (event.entity.ignoreUpdateSyncedAt === true) {
                event.entity.ignoreUpdateSyncedAt = false;
            } else {
                // update syncedAt
                event.entity.syncedAt = moment().toISOString();
            }
        }
    }

    beforeRemove(event: RemoveEvent<ApiEntity>) {
        console.log(`ApiEntitySubscriber: beforeRemove `+ (event.entity? event.entity.constructor.name+' '+event.entity.id: event.entity));
        if (event.entity != null) {
            if (event.entity.ignoreRemoveApi) {
                delete event.entity.ignoreRemoveApi;
            } else if (event.entity.apiId) {
                console.log("ApiEntitySubscriber: beforeRemove - Entity added for future api delete");
                let syncQueueRepository = getRepository(SyncQueue);
                let syncQueue = syncQueueRepository.create();
                syncQueue.objId = event.entity.apiId;
                syncQueue.entity = event.entity.constructor.name;
                syncQueueRepository.save(syncQueue);
            }
        }
    }
}