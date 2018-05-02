import React from 'react';
import { Tabs, Icon, message, Input } from 'antd';
import { cloneDeep } from 'lodash';
import 'antd/dist/antd.css';
// import { Glo_getRequest } from '../../../global/js/request';
import EditSecondCategory from './edit-second-category';
import ConfirmButton from './confirm-button';
import './style.less';

const TabPane = Tabs.TabPane;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialData: [], // 保存初始数据
      category: [], // 总类目数据
      activeKey: '0', // 激活的tab
      moveFrom: NaN, // 要移动的二级类目
      moveCurrent: NaN, // 二级类目移动位置时当时所处位置
      isMove: false, // 二级类目是否是在位置移动
      isLess: false, // 二级类目位移时判断前移还是后移
      showEdit: false, // 是否显示二级类目编辑窗口
      secondCategory: '', // 二级类目内容
      tempData: {}, // 临时保存数据
      isPrevent: true, // 是否阻止默认事件(用于阻止拖动选中文本)
    };
  }
  onPaneChange = (activeKey) => {
    this.setState({ activeKey });
  }
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }
  // 增加一级标签
  add = () => {
    const tempState = Object.assign({}, this.state);
    const key = +tempState.category[tempState.category.length - 1].key + 1;
    tempState.category.push({ name: `一级类目${key + 1}`, value: [], key: String(key) });
    this.setState(tempState);
  }
  // 移除一级标签
  remove = (targetKey) => {
    const tempState = Object.assign({}, this.state);
    if (tempState.category[targetKey].value.length > 0) {
      return message.warn('抱歉,该一级类目内还有二级类目,请先清空二级类目后尝试删除!');
    }
    let lastIndex;
    tempState.category.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const category = tempState.category.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && tempState.activeKey === targetKey) {
      tempState.activeKey = category[lastIndex].key;
    }
    tempState.category = category;
    this.initPanesKeys();
    this.setState(tempState);
  }
  changeName = (e) => {
    e.stopPropagation();
    const tempState = Object.assign({}, this.state);
    const index = +e.target.getAttribute('name');
    tempState.category[index].name = <Input type="text" size="small" autoFocus={true}
      style={{ width: 56 }} defaultValue={ tempState.category[index].name }
      onFocus={ ev => this.firstChange('firstName', ev.target.value, index) }
      onChange={ ev => this.firstChange('firstName', ev.target.value, index) }
      onPressEnter={ () => this.saveFirstName('firstName', index) }
      onBlur={ () => this.saveFirstName('firstName', index) }/>;
    tempState.isPrevent = false;
    this.setState(tempState);
  }
  firstChange = (type, value, index) => {
    const tempState = Object.assign({}, this.state);
    if (!tempState.tempData[type]) {
      tempState.tempData[type] = [];
    }
    tempState.tempData[type][index] = value;
    this.setState(tempState);
  }
  saveFirstName = (type, index) => {
    const tempState = Object.assign({}, this.state);
    const value = tempState.tempData[type][index];
    if (value === '') {
      return message.warn('类目名称不能为空!');
    } else if (value.length !== 4) {
      return message.warn('类目名称只能为四个字!');
    }
    tempState.category[index].name = value;
    tempState.isPrevent = true;
    this.setState(tempState);
  }
  // 更换一级标签顺序
  changePositon = (e, type) => {
    // 阻止冒泡,避免重再触发onchange
    e.stopPropagation();
    const tempState = Object.assign({}, this.state);
    const index = +e.target.getAttribute('name');
    const i = type === 'up' ? index - 1 : index + 1;
    const temp = tempState.category[index];
    tempState.category[index] = tempState.category[i];
    tempState.category[i] = temp;
    this.initPanesKeys();
    tempState.activeKey = `${i}`;
    this.setState(tempState);
  }
  // 初始化数据的key值,方便对数据的操作
  initPanesKeys = () => {
    const tempState = Object.assign({}, this.state);
    tempState.category.forEach((e, i) => {
      e.key = `${i}`;
    });
    this.setState(tempState);
  }
  // 增加二级标签
  addSecondTab = () => {
    const tempState = Object.assign({}, this.state);
    tempState.category[tempState.activeKey].value.push({ secondName: '新增类目', url: '', backCategory: [] });
    this.setState(tempState);
  }
  // 移除二级标签
  removeSecondTab = (e) => {
    e.stopPropagation();
    const tempState = Object.assign({}, this.state);
    const index = +e.currentTarget.getAttribute('name');
    tempState.category[tempState.activeKey].value.splice(index, 1);
    this.setState(tempState);
  }
  // 鼠标点下的样式更换,以及movefrom赋值
  onPaneMouseDown = (e) => {
    e.preventDefault();
    const tempState = Object.assign({}, this.state);
    const from = +e.currentTarget.getAttribute('name');
    tempState.moveFrom = from;
    tempState.isMove = true;
    this.setState(tempState);
  }
  // 鼠标划过样式更换
  onPaneMouseOver = (e) => {
    const tempState = Object.assign({}, this.state);
    if (!tempState.isMove) {
      return false;
    }
    const current = +e.currentTarget.getAttribute('name');
    tempState.moveCurrent = current;
    tempState.isLess = tempState.moveFrom < current;
    this.setState(tempState);
  }
  // 鼠标划过样式更换
  onPaneMouseOut = () => {
    const tempState = Object.assign({}, this.state);
    if (!tempState.isMove) {
      return false;
    }
    tempState.moveCurrent = NaN;
    this.setState(tempState);
  }
  // 鼠标抬起更换tabpane顺序
  onPaneMouseUp = (e) => {
    const tempState = Object.assign({}, this.state);
    const to = +e.currentTarget.getAttribute('name');
    if (!tempState.isMove) {
      return false;
    }
    tempState.isMove = false;
    if (tempState.moveFrom === to) {
      tempState.moveFrom = NaN;
      tempState.moveCurrent = NaN;
      return this.setState(tempState);
    }
    // 更换位置
    const temp = cloneDeep(
      tempState.category[tempState.activeKey].value[tempState.moveFrom]);
    tempState.category[tempState.activeKey].value.splice(+tempState.moveFrom, 1);
    tempState.category[tempState.activeKey].value.splice(+to, 0, temp);
    // 清除样式
    tempState.moveFrom = NaN;
    tempState.moveCurrent = NaN;
    this.setState(tempState);
  }
  // 更换二级类目所属一级类目
  onTabMouseUp = (e) => {
    const tempState = Object.assign({}, this.state);
    const to = +e.currentTarget.getAttribute('name');
    if (!tempState.isMove) {
      return false;
    }
    tempState.isMove = false;
    if (+tempState.activeKey === to) {
      tempState.moveFrom = NaN;
      return this.setState(tempState);
    }
    // 更换位置
    const temp = cloneDeep(
      tempState.category[tempState.activeKey].value[tempState.moveFrom]);
    tempState.category[tempState.activeKey].value.splice(+tempState.moveFrom, 1);
    tempState.category[to].value.push(temp);
    // 清除样式
    tempState.moveFrom = NaN;
    this.setState(tempState);
  }
  // 点击二级类目进入编辑界面
  onPaneClick = (e) => {
    const tempState = Object.assign({}, this.state);
    const current = +e.currentTarget.getAttribute('name');
    const secondCategory = tempState.category[tempState.activeKey].value[current];
    secondCategory.firstName = tempState.category[tempState.activeKey].name;
    tempState.secondCategory = secondCategory;
    tempState.showEdit = true;
    this.setState(tempState);
  }
  reqFirstCategory = () => {
    this.setState({
      category: [
        {
          name: '达人优选',
          value: [
            {
              secondName: '基础护肤',
              url: '//cdn1.showjoy.com/images/df/dfd00e7652494866aa4498165cf3b875.png',
              backCategory: ['后台类目1', '后台类目2'],
            }, {
              secondName: '面部清洁',
              url: '//cdn1.showjoy.com/images/24/24d0335fe8824621a21115b7989c0bed.png',
              backCategory: [],
            }, {
              secondName: '明星面膜',
              url: '//cdn1.showjoy.com/images/16/16da9df9a0314b75953359c3bd977c93.png',
              backCategory: [],
            }, {
              secondName: '礼盒套组',
              url: '//cdn1.showjoy.com/images/16/168c741c53d84944b974af9ee3efbf99.png',
              backCategory: [],
            }],
          key: '0',
        }, {
          name: '美容护肤',
          value: [
            {
              secondName: '面膜',
              url: '//cdn1.showjoy.com/images/11/118db958f7b04ae8894b76e79bd9a133.png',
              backCategory: [],
            }, {
              secondName: '眼部护理',
              url: '//cdn1.showjoy.com/images/75/750e4c2a92d64d5fb2859f487850d314.png',
              backCategory: [],
            }, {
              secondName: '唇部护理',
              url: '//cdn1.showjoy.com/images/0a/0ac0d20f8e3d42d2ac51ae111330878c.png',
              backCategory: [],
            }, {
              secondName: '美容仪器',
              url: '//cdn1.showjoy.com/images/34/341bbe42c9ff4655af92d3af8aa37f0f.png',
              backCategory: [],
            }],
          key: '1',
        }, {
          name: '品质生活',
          value: [
            {
              secondName: '生活优选',
              url: '//cdn1.showjoy.com/images/3b/3bef8b53621941039761f6338929bcf6.png',
              backCategory: [],
            }, {
              secondName: '生活电器',
              url: '//cdn1.showjoy.com/images/e9/e9d8357ab2ed43b2ac248d73c26feee4.png',
              backCategory: [],
            }, {
              secondName: '厨房烹饪',
              url: '//cdn1.showjoy.com/images/c6/c6fe55f5c68d40c6b9f13c8c048e75f9.png',
              backCategory: [],
            }, {
              secondName: '品质家纺',
              url: '//cdn1.showjoy.com/images/7a/7ae8f2dcb6874edc8e36c38ca544f96f.png',
              backCategory: [],
            }, {
              secondName: '3C数码',
              url: '//cdn1.showjoy.com/images/1c/1ca26645bb75447ca1063c4d56dbaae5.png',
              backCategory: [],
            },
          ],
          key: '2',
        },
      ],
      initialData: [
        {
          name: '达人优选',
          value: [
            {
              secondName: '基础护肤',
              url: '//cdn1.showjoy.com/images/df/dfd00e7652494866aa4498165cf3b875.png',
              backCategory: ['后台类目1', '后台类目2'],
            }, {
              secondName: '面部清洁',
              url: '//cdn1.showjoy.com/images/24/24d0335fe8824621a21115b7989c0bed.png',
              backCategory: [],
            }, {
              secondName: '明星面膜',
              url: '//cdn1.showjoy.com/images/16/16da9df9a0314b75953359c3bd977c93.png',
              backCategory: [],
            }, {
              secondName: '礼盒套组',
              url: '//cdn1.showjoy.com/images/16/168c741c53d84944b974af9ee3efbf99.png',
              backCategory: [],
            }],
          key: '0',
        }, {
          name: '美容护肤',
          value: [
            {
              secondName: '面膜',
              url: '//cdn1.showjoy.com/images/11/118db958f7b04ae8894b76e79bd9a133.png',
              backCategory: [],
            }, {
              secondName: '眼部护理',
              url: '//cdn1.showjoy.com/images/75/750e4c2a92d64d5fb2859f487850d314.png',
              backCategory: [],
            }, {
              secondName: '唇部护理',
              url: '//cdn1.showjoy.com/images/0a/0ac0d20f8e3d42d2ac51ae111330878c.png',
              backCategory: [],
            }, {
              secondName: '美容仪器',
              url: '//cdn1.showjoy.com/images/34/341bbe42c9ff4655af92d3af8aa37f0f.png',
              backCategory: [],
            }],
          key: '1',
        }, {
          name: '品质生活',
          value: [
            {
              secondName: '生活优选',
              url: '//cdn1.showjoy.com/images/3b/3bef8b53621941039761f6338929bcf6.png',
              backCategory: [],
            }, {
              secondName: '生活电器',
              url: '//cdn1.showjoy.com/images/e9/e9d8357ab2ed43b2ac248d73c26feee4.png',
              backCategory: [],
            }, {
              secondName: '厨房烹饪',
              url: '//cdn1.showjoy.com/images/c6/c6fe55f5c68d40c6b9f13c8c048e75f9.png',
              backCategory: [],
            }, {
              secondName: '品质家纺',
              url: '//cdn1.showjoy.com/images/7a/7ae8f2dcb6874edc8e36c38ca544f96f.png',
              backCategory: [],
            }, {
              secondName: '3C数码',
              url: '//cdn1.showjoy.com/images/1c/1ca26645bb75447ca1063c4d56dbaae5.png',
              backCategory: [],
            },
          ],
          key: '2',
        },
      ],
    });
  }
  initData = () => {
    this.setState({
      category: cloneDeep(this.state.initialData),
    });
  }
  saveData = () => {
    console.log(this.state.category);
  }
  inputChange = (type, value, index) => {
    console.log('[SearchChange] 表单区域输入选择 类型 %O，值 %o', type, value);
    const tempState = Object.assign({}, this.state);
    if (index !== undefined) {
      tempState.secondCategory[type][index] = value;
    } else {
      tempState.secondCategory[type] = value;
    }
    this.setState(tempState);
  }

  addBackCategory = () => {
    const tempState = Object.assign({}, this.state);
    tempState.secondCategory.backCategory.push('');
    this.setState(tempState);
  }

  closeEditpane = () => {
    this.setState({ showEdit: false });
  }

  componentWillMount() {
    this.reqFirstCategory();
  }
  render() {
    const {
      secondCategory,
      category,
    } = this.state;
    return (
      <div onMouseMove={ e => this.state.isPrevent && e.preventDefault() }>
        <Tabs
          className = "categoryPane"
          tabPosition='left'
          onChange={this.onPaneChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={(targetKey, action) => { this.onEdit(targetKey, action); }}>
          { this.state.category.map((pane, j) =>
            <TabPane
              tab={<span name={j}
                onMouseUp={e => this.onTabMouseUp(e)}>
                <span className="upDown">
                  {j ? <Icon type="up" className="up" name={j} onClick={e => this.changePositon(e, 'up')} /> : null}
                  {j !== this.state.category.length - 1 ? <Icon type="down" className="down" name={j} onClick={e => this.changePositon(e, 'down')} /> : null}
                </span>
                <span name={j} onDoubleClick={e => this.changeName(e)}>{pane.name}</span>
              </span>}
              key={pane.key}
            >
              {pane.value.map((item, i) =>
                <div
                  key={`${pane.key}${i}`}
                  name={i}
                  className={`tabDiv ${i === +this.state.moveFrom ? 'move' : ''} ${i === +this.state.moveCurrent ? (this.state.isLess ? 'moving-right' : 'moving-left') : ''}`}
                  onMouseDown={ e => this.onPaneMouseDown(e) }
                  onMouseOver={ e => this.onPaneMouseOver(e) }
                  onMouseOut={ e => this.onPaneMouseOut(e) }
                  onMouseUp={ e => this.onPaneMouseUp(e) }
                  onClick={ e => this.onPaneClick(e) }>
                  <Icon className="delete" type="cross" name={i}
                    onClick={ e => this.removeSecondTab(e) }/>
                  <img className="tabImg" src={item.url} alt={item.secondName}/>
                  <p className="name">{item.secondName}</p>
                </div>)
              }
              <div
                className="tabDiv addTab"
                onClick={this.addSecondTab}
              >
                <Icon type="plus" style={{ paddingTop: '60px' }}/>
              </div>
            </TabPane>) }
        </Tabs>
        { this.state.showEdit ?
          <EditSecondCategory
            secondCategory={secondCategory}
            category={category}
            imageUrl={secondCategory.url}
            closeEditpane={this.closeEditpane}
            addBackCategory={this.addBackCategory}
            inputChange={(type, value, index) => this.inputChange(type, value, index)}
          >
          </EditSecondCategory> : null }
        <ConfirmButton
          showEdit={this.state.showEdit}
          category={category}
          initData={this.initData}
          saveData={this.saveData}
        ></ConfirmButton>
        <div style={{position: 'absolute', bottom: 200 }}>*:图片所有权归<a href="http://www.showjoy.com/">尚妆</a>所有</div>
      </div>
    );
  }
}


export default App;
