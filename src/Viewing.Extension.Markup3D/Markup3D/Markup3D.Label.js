import GraphicMarker from 'GraphicMarker'
import SwitchButton from 'SwitchButton'
import Toolkit from 'Viewer.Toolkit'
import Dropdown from 'Dropdown'

export default class LabelMarker extends GraphicMarker {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(parent, viewer, dbId, screenPoint, properties = null) {

    super(viewer.container, {x: 100, y: 22})

    this.controlsId = this.guid()

    this.properties = properties

    this.labelId = this.guid()

    this.svgId = this.guid()

    this.viewer = viewer

    this.parent = parent

    this.dbId = dbId

    let labelItemInfo = {}
    // if (labelItemInfo.Markup3D && labelItemInfo.Markup3D.MarkupCollection && labelItemInfo.Markup3D.MarkupCollection.length > 0) labelItemInfo = labelItemInfo.Markup3D.MarkupCollection[0].item || {}
    this.setContent(`
      <div id="${this.labelId}" class="markup3D-label">
        <div class="markup-input markup3D-form">
            <a id="${this.labelId}BtnSave" class="markup-btn" href="javascipt:;">更新</a>
            <label><span>名称</span><input id="${this.labelId}InputName" data-name="name" value="${labelItemInfo.name || ''}"></label>          
            <label><span>说明</span><textarea id="${this.labelId}InputValue" data-name="value" value="${labelItemInfo.value || ''}"></textarea></label>
            <label><span>附件</span><input id="${this.labelId}InputFile" placeholder="附件资源地址或网址" data-name="file" value="${labelItemInfo.file || ''}"></label> 
        </div>
        <div class="markup3D-info">
            <a id="${this.labelId}BtnEdt" class="markup-btn" href="javascipt:;">修改</a>
            <h6>${labelItemInfo.name || ''}</h6>
            <p>${labelItemInfo.value || ''}</p>
            ${this.parseFileDomInfo(labelItemInfo.file)}
        </div>
      </div>
    `)
    //
    $(`#${this.labelId} .markup3D-form .markup-btn`).hide()
    $(`#${this.labelId} .markup3D-info`).hide()

    $(`#${this._markerId}`).css({
      'pointer-events': 'auto'
    })

    $(`#${this.svgId}`).css({
      cursor: 'pointer'
    })

    // var snap = Snap($(`#${this.svgId}`)[0])
    //
    // this.label = snap.paper.text(0, 15,
    //   'Place label ...')
    //
    // this.label.attr({
    //   fontFamily: 'Arial',
    //   fontSize: '13px',
    //   stroke: '#000000'
    // })

    this.setVisible(true)

    this.setScreenPoint(screenPoint)

    this.onMouseMoveHandler = (event)=>
      this.onMouseMove(event)

    this.onMouseUpHandler = (event)=>
      this.onMouseUp(event)

    this.onMouseDownHandler = (event)=>
      this.onMouseDown(event)

    this.onDoubleClickHandler = (event)=>
      this.onDoubleClick(event)

    // save
    this.onBtnSaveClickHandler = (event)=>
        this.onBtnSaveClick(event)
    // edtor
    this.onBtnEditorClickHandler = (event)=>
        this.onBtnEditorClick(event)
    // change
    this.onInputChangeHandler = (event) =>
        this.onInputChange(event)

    $(`#${this.labelId}BtnSave`).on(
        'click',
        this.onBtnSaveClickHandler)
    $(`#${this.labelId}BtnEdt`).on(
        'click',
        this.onBtnEditorClickHandler)
    $(`#${this.labelId} input, #${this.labelId} textarea`).on(
        'change',
        this.onInputChangeHandler)

    $(`#${this.labelId}`)
      .mouseover(() => {
        this.emit('mouseover')
      })
      .mouseout(() => {
        this.emit('mouseout')
      })

    $(`#${this.svgId}`).on(
      'mouseup',
      this.onMouseUpHandler)

    $(`#${this.svgId}`).on(
      'mousedown',
      this.onMouseDownHandler)

    $(`#${this.svgId}`).on(
      'dblclick',
      this.onDoubleClickHandler)

    this.createControls()

    this.showControls(false)

    this.timeoutId = 0
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setVisible (show) {

    if (show) {

      clearTimeout(this.timeoutId)
      this.timeoutId = 0
      super.setVisible(true)

    } else{

      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        super.setVisible(false)
      }, 400)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  startDrag () {

    $(`#${this.svgId}`).css({
      cursor: 'move'
    })

    var $canvas = $('canvas', this.viewer.container)

    this.viewerCursor = $canvas.css('cursor')

    $canvas.css({
      cursor: 'move'
    })

    this.parent.dragging = true

    $(`#${this.svgId}`).on(
      'mousemove',
      this.onMouseMoveHandler)

    this.parent.emit('drag.start', this.parent)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async endDrag () {

    this.parent.dragging = false

    $(`#${this.svgId}`).off(
      'mousemove',
      this.onMouseMoveHandler)

    this.parent.emit('drag.end', this.parent)

    var $canvas = $('canvas', this.viewer.container)

    $canvas.css({
      cursor: this.viewerCursor
    })

    $(`#${this._markerId}`).css({
      'pointer-events': 'auto'
    })

    $(`#${this.svgId}`).css({
      cursor: 'pointer'
    })

    if(this.item) {
      return
    }

    if (LabelMarker.prototype.labelName) {

      var prop = await Toolkit.getProperty(
        this.viewer.model,
        this.dbId,
        LabelMarker.prototype.labelName,
        'Not Available')

      this.updateLabel(
        prop.displayName,
        prop.displayValue)

      this.item = {
        value: prop.displayValue,
        name: prop.displayName
      }

    } else {

      this.showControls(true)
    }

    this.emit('created')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async createControls() {

    const properties = await Toolkit.getProperties(
      this.viewer.model,
      this.dbId,
      this.properties)

    const sortedProperties = properties.sort((a, b)=>{

      var nameA = a.displayName.toLowerCase()
      var nameB = b.displayName.toLowerCase()

      return nameA > nameB ? 1 : -1
    })

    var menuItems = sortedProperties.map((prop)=>{

      return {
        name: prop.displayName,
        value: prop.displayValue
      }
    })

    var $container = $(`#${this.controlsId}`)

    this.dropdown = new Dropdown({
      container: $container,
      title: 'Property',
      pos: {
        top: 0, left: 0
      },
      menuItems
    })

    this.dropdown.on('item.selected', (item) => {

      LabelMarker.prototype.labelName = item.name

      this.item = item

      this.emit('labelSelected')
    })

    var occlusionSwitchId = this.guid()
    var bindSwitchId = this.guid()
    var btnRemoveId = this.guid()
    var btnExitId = this.guid()

    var html = `
      <br>
      <div style="width: 150px;">

        <div id="${bindSwitchId}"
          style="margin-right:10px; float:left; padding-top:1px;">
        </div>
        <div style="height:30px">
          <b>Bind to state</b>
        </div>

        <div id="${occlusionSwitchId}"
          style="margin-right:10px; float:left; padding-top:1px;">
        </div>
        <div style="height:30px">
          <b>Occlusion</b>
        </div>

        <button id="${btnRemoveId}" class="btn btn-danger btn-ctrl"
          style="float: left; margin-right: 3px;"
          data-placement="bottom"
          data-toggle="tooltip"
          data-delay='{"show":"500", "hide":"100"}'
          title="delete markup">
         <span class="fa fa-remove btn-span"></span>
        </button>
        <button id="${btnExitId}" class="btn btn-success btn-ctrl"
          data-placement="bottom"
          data-toggle="tooltip"
          data-delay='{"show":"500", "hide":"100"}'
          title="exit edit mode">
         <span class="fa fa-sign-out btn-span"></span>
         </button>
      </div>
    `

    $container.append(html)

    const $target = $container.find('label[data-toggle="tooltip"]')

    if ($target.tooltip) {

      $target.tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })
    }


    this.bindSwitch =
      new SwitchButton('#' + bindSwitchId,
        this.parent.bindToState)

    this.bindSwitch.on('checked', (checked)=>{

      this.parent.bindToState = checked
    })

    this.occlusionSwitch =
      new SwitchButton('#' + occlusionSwitchId,
        this.parent.occlusion)

    this.occlusionSwitch.on('checked', (checked)=>{

      this.parent.occlusion = checked
    })

    $('#' + btnRemoveId).click(()=>{

      this.parent.remove()
    })

    $('#' + btnExitId).click(()=>{

      // ensure some default is set for next markup
      if (!this.item) {

        this.item = menuItems[0]

        LabelMarker.prototype.labelName =
          this.item.name
      }

      this.showControls(false)

      this.updateLabel(
        this.item.name,
        this.item.value)
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateLabel (item) {
    let name = item.name || ''
    let value = item.value || ''
    let file = item.file || ''
    let code = item.code || ''

    $(`#${this.labelId}InputName`).val(name)
    $(`#${this.labelId}InputValue`).val(value)
    $(`#${this.labelId}InputFile`).val(file)

    $(`#${this.labelId} .markup3D-info h6`).text(name)
    $(`#${this.labelId} .markup3D-info p`).text(value)
    $(`#${this.labelId} .markup3D-info img`).attr('src', file)

    $(`#${this.labelId} .markup3D-form .markup-btn`).show()
    // let saveDom = code ? `<a id="${this.labelId}BtnSave" class="markup-btn" href="javascipt:;">更新</a>` : ''
    // $(`#${this.labelId} .markup3D-form`).prepend(saveDom)
    // item-down
    $(`#${this.labelId} .markup3D-info`).append(this.parseFileDomInfo(file))
    // $(`#${this.labelId} .markup3D-info a.item-down`).attr('href', file)
    $(`#${this.labelId} .markup3D-info`).show()
    $(`#${this.labelId} .markup3D-form`).hide()
    // var snap = Snap($(`#${this.svgId}`)[0])
    //
    // this.label.remove()
    //
    // var nameLabel = snap.paper.text(0, 15,
    //   name.replace(':', '') + ': ')
    //
    // var valueLabel = snap.paper.text(
    //   nameLabel.getBBox().width, 15,
    //   value)
    //
    // nameLabel.attr({
    //   fontFamily: 'Arial',
    //   fontSize: '13px',
    //   stroke: '#FF0000'
    // })
    //
    // valueLabel.attr({
    //   fontFamily: 'Arial',
    //   fontSize: '13px',
    //   stroke: '#000000'
    // })
    //
    // this.label = snap.group(
    //   nameLabel,
    //   valueLabel)
    //
    // var width = nameLabel.getBBox().width +
    //   valueLabel.getBBox().width
    //
    // $(`#${this._markerId}`).css({
    //   width: width + 10
    // })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseMove (event) {

    if (this.parent.dragging) {

      this.parent.setLeaderEndPoint({
        x: event.clientX,
        y: event.clientY
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseUp (event) {

    if (this.parent.dragging) {

      this.endDrag()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseDown (event) {

    if (!this.parent.dragging) {

      this.startDrag()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onDoubleClick (event) {

    this.showControls(true)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  showControls (show) {

    $(`#${this.svgId}`).css({
      display: show ? 'none':'block'
    })

    $(`#${this.controlsId}`).css({
      display: show ? 'block' : 'none'
    })
  }


  // TODO 2019.10.29 @GW start
  onBtnSaveClick (event) {
    console.log(event)
    //
  }

  onBtnEditorClick (event) {
    $(`#${this.labelId} .markup3D-info`).hide()
    $(`#${this.labelId} .markup3D-form`).show()
  }

  onInputChange (event) {
    if (event) {
      /**
       * item
       *      value => 批注详细说明
       *      name => 批注标题
       *      file => 资源链接（图片、文档、视频...）
       *      code => 保存后存入数据库的批注编号
       * */
      this.item = {}
      let exWebSite = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/
      let file = $(`#${this.labelId}InputFile`).val()
      if (!file || (file && exWebSite.test(file))) {
        //
      } else {
        $(`#${this.labelId}InputFile`).val('')
        file = ''
        alert('附件地址不合法, eq: http://www.ciip.com/test.txt')
      }
      this.item.name = $(`#${this.labelId}InputName`).val()
      this.item.value = $(`#${this.labelId}InputValue`).val()
      this.item.file = file
    }
  }


  parseFormat (url) {
    let str = ''
    if (url) {
      let arr = url.split('.')
      if (arr.length > 0) str = arr[arr.length - 1]
      if (str) str = str.toLowerCase()
    }
    return str
  }
  parseFileDomInfo (file) {
    let str = this.parseFormat(file)
    let html = ''
    if (str) {
      let fm = {
        'mp4': 'VID',
        '3gp': 'VID',
        'jpg': 'IMG',
        'png': 'IMG',
        'ico': 'IMG',
        'jpeg': 'IMG',
        'gif': 'IMG',
        'webp': 'IMG',
        'bmp': 'IMG',
      }
      let type = fm[str]
      if (type === 'IMG')  html = `<img src="${file}" />`
      if (type === 'VID') html = `<video src="${file}" controls></video>`
      let btnName = type ? '新窗口打开预览' : '下载附件'
      html += `<a href="${file}" target="_blank">${btnName}</a>`
    }
    return html
  }
  // TODO 2019.10.29 @GW end
}
