import React from 'react';
import { Button } from 'antd';

export default class ConfirmButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEdit: false,
      category: this.props.category, // 总类目数据(实时的)
    };
  }

  confirm = () => {
    this.props.saveData && this.props.saveData();
  }

  cancel = () => {
    this.props.initData && this.props.initData();
  }

  componentWillReceiveProps(next) {
    this.setState(next);
  }

  render() {
    return (
      <div className="confirmButtonGroup">
        <Button
          size="large"
          type="primary"
          style={{ marginLeft: this.state.showEdit ? '430px' : '220px' }}
          onClick={this.confirm}>确定</Button>
        <Button
          size="large"
          style={{ marginLeft: '20px' }}
          onClick={this.cancel}>还原</Button>
      </div>
    );
  }
}
