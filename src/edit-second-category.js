import React from 'react';
import { Row, Col, Select, Upload, Icon, message, Input, Button } from 'antd';


// ant design直接搬过来用的
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}
function beforeUpload(file) {
  const isImg = /image\/[a-z]*/i.test(file.type);
  if (!isImg) {
    message.error('只能上传图片文件哟!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过2MB!');
  }
  return isImg && isLt2M;
}

const Option = Select.Option;
export default class EditSecondCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secondCategory: this.props.secondCategory || {}, // 二级类目
      category: this.props.category || [], // 类目总数据
      loading: false, // 图片上传等待
      imageUrl: this.props.imageUrl || '', // 图片地址
    };
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl) => {
        this.inputChange('url', imageUrl);
        this.setState({
          loading: false,
        });
      });
    }
  }

  closeEditpane = () => {
    this.props.closeEditpane && this.props.closeEditpane();
  }

  inputChange = (type, value, i) => {
    this.props.inputChange && this.props.inputChange(type, value, i);
  }

  addBackCategory = () => {
    this.props.addBackCategory && this.props.addBackCategory();
  }

  componentWillReceiveProps(next) {
    this.setState(next);
  }

  render() {
    const {
      imageUrl,
      category,
      secondCategory,
    } = this.state;
    const {
      firstName = '',
      secondName = '',
      backCategory = [],
    } = secondCategory;
    // 后台类目输入框组
    const backCategoryInput = [];
    backCategory.forEach((e, i) => {
      backCategoryInput.push(
        <Input key={i}
          style={{ width: 200, marginBottom: 6 }}
          value={backCategory[i]}
          onChange={ ev => this.inputChange('backCategory', ev.target.value, i) }/>);
    });
    const firstCategory = [];
    category.length > 0 && category.forEach((elem) => {
      firstCategory.push(<Option key={elem.name} value={elem.name}>{elem.name}</Option>);
    });
    return (
      <div className="secondEditPane">
        <Icon type="cross" className="close" onClick={this.closeEditpane} />
        <Row gutter={16}>
          <Col span={8} className="leftTitle">前台一级类目名:</Col>
          <Col span={12}>
            <Input disabled={true}
              placeholder="一级类目名称"
              value={firstName}
              style={{ width: 200, marginBottom: 10 }}>
            </Input>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8} className="leftTitle">前台二级类目名:</Col>
          <Col span={12}>
            <Input
              placeholder="请填写二级类目名称"
              value={secondName}
              style={{ width: 200, marginBottom: 10 }}
              onChange={ e => this.inputChange('secondName', e.target.value) }>
            </Input>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8} className="leftTitle">图片:</Col>
          <Col span={14}>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action=""
              beforeUpload={beforeUpload}
              onChange={this.handleChange}
            >
              {imageUrl ? <img src={imageUrl} alt="" /> :
                <div style={{ paddingTop: '30px' }}>
                  <Icon type={this.state.loading ? 'loading' : 'plus'} />
                  <div className="ant-upload-text">Upload</div>
                </div>}
            </Upload>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8} className="leftTitle">后台类目:</Col>
          <Col span={12}>
            {backCategoryInput}
            <Button
              style={{ width: 200 }}
              onClick={this.addBackCategory}>+添加基础数据类目</Button>
          </Col>
        </Row>
      </div>
    );
  }
}
