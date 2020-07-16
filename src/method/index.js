// 根据参数名解析地址query参数
export const getQueryString = (name) => {
    let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r != null) return decodeURI(r[2])
    return null
}
// 解析地址query参数返回json
export const getQueryParams = (u) => {
    let url = u || window.location.search
    let params = {}
    let urls = url.split('?')
    let arr = urls[1].split('&')
    for (let i = 0, l = arr.length; i < l; i++) {
        let a = arr[i].split('=')
        params[a[0]] = a[1]
    }
    return params
}
// 当前页面未嵌入应用时 隐藏全屏按钮
export const createStyleForFullScreenBtn = () => {
    let cssString = '#toolbar-fullscreenTool{display: none;}'
    let doc = document
    let style = doc.createElement('style')
    style.setAttribute('type', 'text/css')
    if(style.styleSheet){
        style.styleSheet.cssText = cssString
    } else {
        let cssText = doc.createTextNode(cssString)
        style.appendChild(cssText)
    }
    doc.getElementsByTagName('head')[0].appendChild(style)
}
// 模型节点查询
export const modelSearchAsync = async (viewer, val) => {
    return new Promise((resolve, reject) => {
        viewer.search(
            val,
            suc => resolve(suc),
            err => reject(err)
        )
    })
}

// 模型加载
export const modelLoadAsync = async (viewer, path, option) => {
    return new Promise((resolve, reject) => {
        viewer.start()
        viewer.loadModel(
            path,
            option || undefined,
            suc => resolve({flag: true, data: suc}),
            err => reject({flag: false, data: err})
        )
    })
}

// 改变模型构建颜色
export const changeModelColor = async (viewer, obj, c) => {
    let ids = obj.ids
    let status = obj.s || false // false 清除 主体颜色 true 添加主体颜色
    if (obj.c) {
        c = obj.c
    }
    viewer.clearThemingColors()
    if (ids.constructor === Array && ids.length > 0) {
        ids.forEach(id => {
            if (status) {
                c = c || [1, 1, 1, 1]
                let color = new THREE.Vector4(...c)
                viewer.setThemingColor(id, color)
            }
            // viewer.model.getProperties(id, res => console.log(res))
        })
    }
}

// 模型选择事件操作
export const addSelectModelChangeColorEvent = async (viewer, c) => {
    viewer.addEventListener('selection', event => {
        let id = event.dbIdArray[0]
        if (id) {
            let color = c || new THREE.Vector4(255 / 255, 0, 0, 1)
            viewer.setThemingColor(id, color)
            viewer.model.getProperties(id, res => console.log(res))
        }
    })
}

/**
 *
 通过 dbid  获取  seletionid
 eq:
 let dbid = 389
 let seletionid = it.nodeAccess.nameSuffixes[it.nodeAccess.dbIdToIndex[dbid]]
 *
 * */
export const getSeletionidByDbid = (it, dbid) => {
    return it.nodeAccess.nameSuffixes[it.nodeAccess.dbIdToIndex[dbid]]
}

// 移除全部模型
export const removeAllModels = viewer => {
    if (viewer.model) {
        let models = viewer.impl.modelQueue().getModels()
        if (models.length > 0) {
            models.forEach(ite => {
                viewer.hideModel(ite.id)
            })
        }
    }
}

// 隐藏全部面板
export const hideTool = (modelViewer) => {
    // 移除工具栏
    modelViewer.toolbar.container.remove()
    // 隐藏虚影层
    modelViewer.impl.fadeMaterial.opacity = 0
    // 隐藏Cube
    modelViewer.displayViewCubeUI(false)
}
