const Fabric = require("../models/fabric");
const { getIO } = require('../utils/setupSocket')
exports.startWatcher = async () => {

    const io = await getIO();
    console.log("*****Watcher started for mongodb*****")

    const fabricWatcher = Fabric.watch([], { fullDocument: 'updateLookup' });

    fabricWatcher.on('change', async (change) => {

        // Check if 'rollInfo' is updated
        if (change.updateDescription && change.updateDescription.updatedFields) {
            const updatedFields = change.updateDescription.updatedFields;
            const rollInfoUpdated = Object.keys(updatedFields).some(field => field.startsWith('rollInfo'));

            if (rollInfoUpdated) {
                console.log('Change in rollInfo:', updatedFields);

                // Emit a socket event when a change occurs in 'rollInfo'
                if (io) {
                    io.emit('rollInfoChange', updatedFields);
                }
            }
        }

        if (change.operationType === 'insert') {

            // Emit a socket event when a new document is inserted
            if (io) {
                io.emit('newDocument', change.fullDocument);
            }
        }
    });
}