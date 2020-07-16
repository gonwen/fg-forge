// 初始化message绑定事件（嵌入式应用）
import {changeModelColor, modelLoadAsync, removeAllModels} from './index'
import BuildModelTree from './model.tree'
import ModelLevels from './model.levels'

export const initIframeInfo = (modelViewer) => {
    modelStatus(0)
    window.addEventListener('message',async e => {
        let modelTreeList
        let data = e.data
        let s = data.s // 状态值 true 进行相应类型动作
        let t = data.t // tree 获取树形  hide 隐藏  show  显示
        let o = data.o // 对应类型数据
        if (s && t) {
            switch (t) {
                case 'click':
                    changeModelColor(modelViewer, o)
                    break
                case 'tree':
                    // 获取模型树形节点
                    let modes = modelViewer.impl.modelQueue().getModels()
                    let root = []
                    modes.forEach(async (sitm, sindex) => {
                        let buildModelTree = new BuildModelTree(sitm)
                        root.push(await buildModelTree.getTree())
                        if (sindex === modes.length - 1) {
                            parent.postMessage({
                                sign: 'model',
                                modelViewRoot: root
                            }, '*')
                        }
                    })
                    break
                case 'levels':
                    let levels = new ModelLevels(viewer, 1).layer
                    parent.postMessage({
                        sign: 'model',
                        modelViewLevels: levels
                    }, '*')
                    break
                case 'hide':
                    modelViewer.hide(o)
                    parent.postMessage({
                        sign: 'model',
                        modelViewHideStatus: true
                    }, '*')
                    break
                case 'show':
                    modelViewer.show(o)
                    parent.postMessage({
                        sign: 'model',
                        modelViewShowStatus: true
                    }, '*')
                    break
                case 'lines':
                    // 初始化隐藏全部模型构件
                    modelViewer.hide(modelViewer.model.id)
                    // 隐藏工具栏
                    hideTool(modelViewer)
                    break
                case 'hideTool':
                    hideTool(modelViewer)
                    break
                case 'loadModels':
                    let fs = o.files || []
                    if (fs.constructor === String) fs = [fs]
                    removeAllModels(modelViewer)
                    fs.forEach(item => {
                        if (item.path) modelLoadAsync(modelViewer, item.path)
                    })
                    break
            }
        }
    })
}

export const modelStatus = (sign) => {
    // sign 0 = 渲染引擎实例化后 1 = 模型挂载前  2 = 模型挂载完 3 = 模型挂载失败
    parent.postMessage({
        sign: 'model',
        modelLoadingStatus: sign
    }, '*')
}
