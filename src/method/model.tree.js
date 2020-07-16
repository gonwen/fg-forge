export default class BuildModelTree {
    constructor(model){
        // this.viewer = viewer
        this.model = model
        this.instanceTree = null
    }
    init () {
        return new Promise((resolve, reject) => {
            this.model.getObjectTree(instanceTree => {
                this.instanceTree = instanceTree
                resolve(instanceTree)
            })
        })
    }
    rec (node) {
        this.instanceTree.enumNodeChildren( node.dbId, childId => {
            node.children = node.children || []
            let childNode = {
                dbId: childId,
                name: this.instanceTree.getNodeName(childId)
            }
            node.children.push(childNode)
            this.rec(childNode)
        })
    }
    async getTree () {
        await this.init()
        let rootId = this.instanceTree.getRootId()
        let rootNode = {
            dbId: rootId,
            name: this.instanceTree.getNodeName(rootId )
        }
        this.rec(rootNode)
        return rootNode
    }
}
