import {initIframeInfo} from './postmessage'
import BuildModelTree from '../method/model.tree'
import ModelLevels from '../method/model.levels'
import {hideTool} from './index'

export default async (viewer, hide) => {
    viewer.fitToView()
    if (hide) {
        hideTool(viewer)
    }
    // 初始化Markups功能
    if (MODEL_CODE) initMarkups(viewer)

    // 获取模型树形节点
    // let buildModelTree = new BuildModelTree(viewer)
    // let root = await buildModelTree.getTree()
    // window.__it = buildModelTree.instanceTree
    // window.__root = root

    // 获取各楼层标高数据
    // console.log(new ModelLevels(viewer, 1).layer)
}

// LMV_VIEWER_VERSION 版本查看
// viewer.impl.modelQueue().getModels() 获取载入的模型
// viewer.getAggregateSelection() 获取当前视图选择的模型 以及选中的node节点
//  Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT
/**
 * 芯云谷
 * aHR0cHM6Ly9teHpoLXByb2Qub3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tL21vZGVsRm9sZGVyXzYxNDYzMTMxLTgzOTMtNDE2Mi1hODA1LTE0NTZlNjBkZGEwYi9vdXRwdXQvM2Quc3Zm
 *
 * 丽泽别墅
 * aHR0cHM6Ly9teHpoLXByb2Qub3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tL21vZGVsRm9sZGVyX2IzOTMyZjA5LTNiZjgtNDNmZC04MTE2LTI3MzRmNjNjZDdhNS9vdXRwdXQvM2Quc3Zm
 *
 * 嘉怡系列
 * aHR0cHM6Ly9teHpoLXByb2Qub3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tL21vZGVsRm9sZGVyX2IwYWFjMTAxLWMyMmQtNGNlMC1hNjRkLWRhOTNmMDc4ODgyMy9vdXRwdXQvM2Quc3Zm
 *
 * */
