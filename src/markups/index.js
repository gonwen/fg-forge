import './markups.scss'
!function(){
    window.initMarkups = (viewer) => {
        let base = 'http://dghy.ciip.net/BIMIF'
        let serUrl = {
            list: base + '/GetNotesList', // 列表
            info: base + '/GetNotesInfo', // 单个批注详情
            add: base + '/AddNotes', // 添加批注
            delete: base + '/DelNotes', // 删除批注
            edname: base + '/UpdateNotesName', // 修改批注名
            edmk: base + '/UpdateNotesMark' // 修改批注涂鸦
        }
        let modelCode = MODEL_CODE || ''
        let markupList = []
        let itemCode = ''
        // 挂载批注插件
        viewer.loadExtension('Viewing.Extension.Markup3D')
        window.markups = viewer.loadedExtensions["Viewing.Extension.Markup3D"]
        let markupDom = $(
            `<div id="markup-list" class="markup-list">
                <h6>批注列表<a href="javascript:;" onclick="handelClickMarkup()" class="markup-btn">新增</a></h6>
                <div class="markup-input"><input class="markup-list-input"><a id="martup-btn-save" class="markup-btn" href="javascript:;" onclick="handelClickSaveMarkup()">保存</a></div>
                <ul><!--<li><a href="javascript:;">1grgrtg</a><i>&times;</i></li>--></ul>
                <div id="MyViewerDiv"></div>
            </div>`
        )
        $('body').append(markupDom)
        markupDom.show()
        // 已有批注列表数据
        window.markupAllList = []
        // 保存新批注
        window.saveMarkupInfo = () => {
            let oarr = localStorage.getItem('x-h-markups')
            let arr = []
            let state = viewer.getState()
            let flag = false // 是否有新增标注
            let inputName = $('.markup-input .markup-list-input').val()
            if (!inputName) {
                alert('请填写批注标题')
                return
            }
            state.viewport.name = inputName
            if (oarr && (JSON.parse(oarr)).constructor === Array) arr = JSON.parse(oarr)
            if (
                state &&
                state.Markup3D &&
                state.Markup3D.MarkupCollection &&
                state.Markup3D.MarkupCollection.length > 0
            ) {
                arr.push(state)
                flag = true
            }
            if (flag) {
                let item = state.Markup3D.MarkupCollection[0].item || {}
                if (!item.name || !item.value) {
                    alert('批注名称和批注说明不能为空')
                    return
                }
                $.ajax({
                    url: serUrl.add,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        statejson: JSON.stringify(state),
                        mark: JSON.stringify(state),
                        pzname: inputName,
                        modelbh: modelCode,
                        pzuser: 'ciip',
                        pztime: new Date().getTime()
                    },
                    success: (json) => {
                        if (json.success) {
                            localStorage.setItem('x-h-markups', JSON.stringify(arr))
                            viewer.restoreState({})
                            alert('已添加成功')
                            handelClickMarkup()
                            $('.markup-input input').val('')
                            // saveMarkupInfo()
                        } else alert('添加失败')
                    },
                    error: (err) => {
                        alert(err)
                    }
                })
            } else alert('未发现新增的批注信息')
        }
        // 设置批注列表
        window.viewMarkUpInfo = () => {
            let group = $('#markup-list ul')
            if (modelCode) {
                $.ajax({
                    url: serUrl.list,
                    type: 'get',
                    dataType: 'json',
                    data: {
                        modelbh: modelCode
                    },
                    success: (json) => {
                        if (json.success && json.data && json.data.constructor === Array) {
                            let arr = json.data
                            markupAllList = arr
                            let html = ''
                            for (let i = 0; i < arr.length; i++) {
                                let n = arr[i].pzname
                                html += `<li><a href="javascript:;" onclick="handelClickViewMarkup('${arr[i].pzbh}', 'V', '${i}')">${n}</a><i onclick="handelClickViewMarkup('${arr[i].pzbh}', 'D', '${i}')">&times;</i></li>`

                            }
                            group[0].innerHTML = html
                            group.show()
                        } else {
                            markupAllList = []
                            group.hide()
                        }
                    },
                    error: (err) => {
                        console.log(err)
                        markupAllList = []
                        group.hide()
                    }
                })
            } else {
                markupAllList = []
                group.hide()
            }
        }
        // 新增批注按钮
        window.handelClickMarkup = () => {
            let btn = $('#markup-list h6 a')[0]
            let input = $('.markup-list .markup-input')
            if (markups) {
                let flag = markups.markup3DTool.create
                btn.innerText = flag ? '新增' : '取消'
                viewer.restoreState({})
                if (flag) {
                    input.hide()
                    viewMarkUpInfo()
                    // 停止使用
                    markups.markup3DTool.stopCreate()
                } else {
                    input.show()
                    // 激活
                    markups.markup3DTool.startCreate()
                }
            }
        }
        // 保存批注按钮
        window.handelClickSaveMarkup = () => {
            saveMarkupInfo()
        }
        // 选择显示对应的批注信息 或 删除某批注信息 type => D 删除 V 显示
        window.handelClickViewMarkup = (code, type, index) => {
            viewer.restoreState({})
            if (type === 'D') {
                $.ajax({
                    url: serUrl.delete,
                    type: 'get',
                    dataType: 'json',
                    data: {
                        pzbh: code
                    },
                    success: (json) => {
                        if (json.success) {
                            viewMarkUpInfo()
                            markups.markup3DTool.stopCreate()
                        } else alert('删除失败')
                    },
                    error: (err) => {
                        alert(err)
                    }
                })
            }
            if (type === 'V') {
                itemCode = code
                $.ajax({
                    url: serUrl.info,
                    type: 'get',
                    dataType: 'json',
                    data: {
                        pzbh: code
                    },
                    success: (json) => {
                        if (json.success && json.data && json.data[0] && json.data[0].mark) {
                            var info = json.data[0].mark
                            info = JSON.parse(info)
                            if (info.Markup3D && info.Markup3D.MarkupCollection && info.Markup3D.MarkupCollection.constructor === Array) {
                                var a = info.Markup3D.MarkupCollection
                                for (var i = 0; i< a.length; i++) {
                                    if (info.Markup3D.MarkupCollection[i].item) info.Markup3D.MarkupCollection[i].item.code = code
                                }
                            }
                            viewer.restoreState(info)
                            onBtnSaveClick()
                        }
                        else alert('获取批注详情失败')
                    },
                    error: (err) => {
                        alert(err)
                    }
                })
            }
        }
        viewMarkUpInfo()
        function onBtnSaveClick() {
            var group = markups.markupCollection
            for (var guid in group) {
                markups.markupCollection[guid].labelMarker.onBtnSaveClick = (event) => {
                    var state = viewer.getState()
                    $.ajax({
                        url: serUrl.edmk,
                        type: 'post',
                        dataType: 'json',
                        data: {
                            pzbh: itemCode,
                            mark: JSON.stringify(state)
                        },
                        success: (json) => {
                            if (json.success) {
                                handelClickViewMarkup(itemCode, 'V')
                                alert('更新成功')
                            } else alert('更新失败')
                        },
                        error: (err) => {
                            alert(err)
                        }
                    })
                }
            }
        }
    }
}()
