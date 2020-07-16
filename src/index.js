// 入口文件
import base64Url from 'base64-url'
import loadModelSuccess from './method/load.success'
import {
    getQueryParams,
    createStyleForFullScreenBtn,
    modelLoadAsync
} from './method'
import {initIframeInfo, modelStatus} from './method/postmessage'
// import BuildModelTree from './method/model.tree'

const params = getQueryParams()
// 只显示 模型 其他面板隐藏
const hideToolStatus = !!params.hdtl
const config = {
    extensions: [
        'Autodesk.Viewing.ZoomWindow'
    ]
}
const options = {
    docid: params.file || '',
    env: 'Local',
    offline: 'true',
    useADP: false
}
const element = document.getElementById('viewer-local')
const viewer = new Autodesk.Viewing.Private.GuiViewer3D(element, config)

if (window.self !== window.top) createStyleForFullScreenBtn()
if (params.n) document.title = `${params.n}-模型预览`
window.MODEL_CODE = params.modelcode || ''
window.viewer = viewer

if (params.u) {
    try {
        options.docid = base64Url.decode(params.u)
    } catch (e) {
        console.log('file url is error')
    }
}
initIframeInfo(viewer)
Autodesk.Viewing.Initializer (options, async () => {
    // modelStatus(1)
    // params.vtp 预览模式
    // undefined || null 单个模型预览模式
    // empty 建立空白场景
    // more 多模型模式

    const vtp = params.vtp
    const path = options.docid
    if (!vtp && path) {
        let loadRes = await modelLoadAsync(viewer, path)
        modelStatus(1)
        if (loadRes.flag) {
            loadModelSuccess(viewer, hideToolStatus)
            modelStatus(2)
        } else {
            modelStatus(3)
            console.log('fail')
        }
    }
    if (vtp === 'more') {
        /*
        let more = [
            {
                path: 'https://mxzh-prod.oss-cn-beijing.aliyuncs.com/modelFolder_0302677f-f855-4c52-8c90-911560a13efd/output/3d.svf',
                oths: '立式多级离心泵'
            },
            // {
            //     path: 'https://mxzh-prod.oss-cn-beijing.aliyuncs.com/modelFolder_ded9c7fd-a43c-4e69-90c1-5f63a307c912/output/3d.svf',
            //     oths: '碳钢式隔膜气压罐'
            // },
            // {
            //     path: 'file=https://mxzh-prod.oss-cn-beijing.aliyuncs.com/modelFolder_7c7020cb-0223-4d97-8a88-54371fa8bb7e/output/3d.svf',
            //     oths: '金光混流风机（JGXF-2.5-C）'
            // },
            {
                path: 'https://mxzh-prod.oss-cn-beijing.aliyuncs.com/modelFolder_e37a185a-420c-4e13-80ad-852b84affbe2/output/3d.svf',
                oths: '给水设备-泵'
            },
            {
                path: 'https://mxzh-prod.oss-cn-beijing.aliyuncs.com/modelFolder_7e2295d4-40a5-410c-8ade-f07f7ffef22a/output/3d.svf',
                oths: 'M_离心泵-卧式端吸'
            }
        ]
        more.forEach(async (item, index) => {
            if (item.path) await modelLoadAsync(viewer, item.path)
        })
        */
    }
})
