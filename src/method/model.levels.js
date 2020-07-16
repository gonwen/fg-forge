export default class ModelLevels {
    constructor (viewer, rootId) {
        this.viewer = viewer
        this.rootId = rootId
        this.layer = []
        this.init()
    }
    init () {
        viewer.model.getProperties(this.rootId, rootProps => {
            var levelIds = this.getLevelIds(rootProps)
            viewer.model.getBulkProperties(levelIds, {}, levels => {
                levels.forEach(level => {
                    let elevation = this.getElevation(level)
                    let n = level.name
                    let gc = null
                    if (elevation && elevation.displayValue) {
                        gc = elevation.displayValue
                        this.layer.push({
                            ev: elevation,
                            og: gc,
                            ng: (Number(gc) / 3.28),
                            nm: n
                        })
                    }
                })
            })
        })
    }
    getLevelIds (rootProps) {
        return rootProps.properties
            .filter(x => x.displayCategory === '__internalref__' && x.displayName === 'Level')
            .map(x => x.displayValue)
    }
    getElevation (level) {
        return level.properties
            .find(x => x.displayCategory === 'Constraints' && x.displayName === 'Elevation')
    }
}
