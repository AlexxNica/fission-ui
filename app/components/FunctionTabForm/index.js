/**
*
* FunctionForm
*
*/

import React from 'react';
// import styled from 'styled-components';

import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/mode/php';
import 'brace/mode/javascript';
import 'brace/mode/python';
import 'brace/theme/github';
import LoadingIndicator from 'components/LoadingIndicator';
import FunctionTestForm from 'components/FunctionTestForm';

class FunctionTabForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      mode: 'javascript',
    };

    this.onModeChange = this.onModeChange.bind(this);
  }


  onModeChange(e) {
    this.setState({ mode: e.target.value });
  }

  render() {
    const { onChange, environments, item, nameEditable, onCodeChange, onFunctionTest, functionTest } = this.props;
    const { mode } = this.state;

    return (
      <form>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="formFunctionName">Function name</label>
              <input type="text" className="form-control" id="formFunctionName" name="name" value={item.name} onChange={onChange} disabled={!nameEditable} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="formFunctionName">Environment</label>
              <select className="form-control" value={item.environment} name="environment" id="formFunctionName" onChange={onChange}>
                {
                  environments.map((environment, index) => (
                    <option value={environment.name} key={`environmentSelect-${index}`}>{environment.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-md-6">
            <AceEditor
              mode={mode}
              theme="github"
              name="FunctionForm"
              value={item.code}
              editorProps={{ $blockScrolling: true }}
              onChange={onCodeChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="formFunctionName">Syntax</label>
            <select className="form-control" onChange={this.onModeChange}>
              <option value="javascript">Javascript</option>
              <option value="java">Java</option>
              <option value="php">Php</option>
              <option value="python">Python</option>
            </select>
            {
              functionTest.loading ? <LoadingIndicator /> : <FunctionTestForm onFunctionTest={onFunctionTest} functionTest={functionTest} />
            }

          </div>
        </div>
      </form>
    );
  }
}

FunctionTabForm.propTypes = {
  item: React.PropTypes.object,
  environments: React.PropTypes.array,
  onChange: React.PropTypes.func.isRequired,
  onCodeChange: React.PropTypes.func.isRequired,
  onFunctionTest: React.PropTypes.func.isRequired,
  nameEditable: React.PropTypes.bool,
  functionTest: React.PropTypes.object,
};

export default FunctionTabForm;
