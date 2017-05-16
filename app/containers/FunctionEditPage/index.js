/*
 *
 * FunctionEditPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import { Modal } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';
import FunctionForm from 'components/FunctionForm';
import LoadingIndicator from 'components/LoadingIndicator';
import ErrorIndicator from 'components/ErrorIndicator';
import { makeSelectLoading, makeSelectFunctionByName, makeSelectTriggersHttp, makeSelectTriggersTimer, makeSelectError, makeSelectFunctionTest, makeSelectKubeWatchers } from 'containers/FunctionsPage/selectors';
import { makeSelectEnvironments } from 'containers/EnvironmentsPage/selectors';
import { loadEnvironmentAction } from 'containers/EnvironmentsListPage/actions';
import { testFunctionAction, cleanTestFunctionAction } from 'containers/FunctionCreatePage/actions';
import { getFunctionAction, loadTriggersHttpAction, deleteTriggerHttpAction, updateFunctionAction, createFunctionAction,
  createTriggerHttpAction, loadKubeWatchersAction, createKubeWatcherAction, deleteKubeWatcherAction,
  createTriggerTimerAction, loadTriggersTimerAction, deleteTriggerTimerAction,
} from 'containers/FunctionEditPage/actions';
import commonMessages from 'messages';
import { encodeBase64 } from 'utils/util';

export class FunctionEditPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    const hash = this.props.location.hash.replace('#', '');
    // must use once for es lint errors
    props.functionByName();
    this.state = {
      inputErrors: [],
      activeTab: hash === '' ? 'function' : hash,
      editing: false,
      showDuplicateModal: false,
      duplicatedFuncName: '',
    };
    this.onFunctionChange = this.onFunctionChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onHttpTriggerRemove = this.onHttpTriggerRemove.bind(this);
    this.onHttpTriggerCreate = this.onHttpTriggerCreate.bind(this);
    this.onKubeWatcherRemove = this.onKubeWatcherRemove.bind(this);
    this.onKubeWatcherCreate = this.onKubeWatcherCreate.bind(this);
    this.onTimerTriggerRemove = this.onTimerTriggerRemove.bind(this);
    this.onTimerTriggerCreate = this.onTimerTriggerCreate.bind(this);
    this.onCodeChange = this.onCodeChange.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.onFunctionTest = this.onFunctionTest.bind(this);
    this.onDuplicate = this.onDuplicate.bind(this);
    this.onOpenDuplicateModal = this.onOpenDuplicateModal.bind(this);
    this.onCloseDuplicateModal = this.onCloseDuplicateModal.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.props.loadEnvironmentData();
    this.props.loadTriggersHttpData();
    this.props.loadKubeWatchersData();
    this.props.loadTriggersTimerData();
    this.props.loadFunctionData(this.props.params.name);
    this.props.cleanTestFunction();
  }

  componentWillReceiveProps(nextProps) {
    const nextState = nextProps.functionByName(nextProps.params.name);
    if (nextState !== false) {
      if (!this.state.editing) {
        this.state.item = nextState;
      } else {
        this.state.item.triggersHttp = nextState.triggersHttp;
        this.state.item.kubeWatchers = nextState.kubeWatchers;
        this.state.item.triggersTimer = nextState.triggersTimer;
      }
    }
  }


  onFunctionChange(event) {
    const obj = Object.assign({}, this.state.item);
    obj[event.target.name] = event.target.value;

    this.setState({ item: obj, editing: true });
  }

  onCodeChange(newValue) {
    const obj = Object.assign({}, this.state.item);
    obj.code = newValue;

    this.setState({ item: obj, editing: true });
  }

  onChange(event) {
    const obj = {};
    obj[event.target.name] = event.target.value;
    this.setState(obj);
  }

  onFunctionTest(test) {
    const fn = Object.assign({}, this.state.item);
    fn.code = encodeBase64(fn.code);
    fn.test = test;
    this.props.testFunction(fn);
    return true;
  }

  onHttpTriggerRemove(item) {
    this.props.deleteTriggerHttp(item);
  }

  onHttpTriggerCreate(tr) {
    const { item } = this.state;
    const trigger = Object.assign({}, tr);
    if (!trigger.urlpattern.startsWith('/')) {
      trigger.urlpattern = `/${trigger.urlpattern}`;
    }
    this.props.createTriggerHttp({
      method: trigger.method,
      urlpattern: trigger.urlpattern,
      function: item.name,
    });
  }

  onKubeWatcherRemove(watcher) {
    this.props.deleteKubeWatcher(watcher);
  }

  onKubeWatcherCreate(watcher) {
    const { item } = this.state;
    const obj = Object.assign({}, watcher);
    obj.function = item.name;
    this.props.createKubeWatcher(obj);
  }

  onTimerTriggerRemove(timer) {
    this.props.deleteTriggerTimer(timer);
  }

  onTimerTriggerCreate(timer) {
    const { item } = this.state;
    const obj = Object.assign({}, timer);
    obj.function = item.name;
    this.props.createTriggerTimer(obj);
  }

  onTabChange(newTabName) {
    this.setState({ activeTab: newTabName });
  }

  onSave(event) {
    event.preventDefault();
    const { item } = this.state;
    const fn = Object.assign({}, item);
    fn.code = encodeBase64(fn.code);
    this.props.updateFunction(fn);
  }

  onCloseDuplicateModal() {
    this.setState({ showDuplicateModal: false });
  }

  onOpenDuplicateModal() {
    this.setState({ showDuplicateModal: true });
  }

  onDuplicate(event) {
    event.preventDefault();
    const { item } = this.state;
    const fn = Object.assign({}, item);
    fn.name = this.state.duplicatedFuncName;
    fn.code = encodeBase64(fn.code);
    this.props.createFunction(fn);
    this.onCloseDuplicateModal();
  }

  render() {
    const { item, activeTab, showDuplicateModal } = this.state;
    const { loading, error, functionTest, environments } = this.props;
    if (loading || item === undefined) {
      return <LoadingIndicator />;
    }
    return (
      <div>
        <Helmet
          title="Edit function"
        />

        {error &&
          <ErrorIndicator errors={[error.response.data]} />
        }

        <FunctionForm
          environments={environments} onChange={this.onFunctionChange} item={item}
          onHttpTriggerRemove={this.onHttpTriggerRemove}
          onHttpTriggerCreate={this.onHttpTriggerCreate}
          onKubeWatcherRemove={this.onKubeWatcherRemove}
          onKubeWatcherCreate={this.onKubeWatcherCreate}
          onTimerTriggerCreate={this.onTimerTriggerCreate}
          onTimerTriggerRemove={this.onTimerTriggerRemove}
          metadataEditable={Boolean(false)}
          onCodeChange={this.onCodeChange}
          activeTab={activeTab}
          onTabChange={this.onTabChange}
          onFunctionTest={this.onFunctionTest}
          functionTest={functionTest}
        />

        <Modal show={showDuplicateModal} onHide={this.onCloseDuplicateModal}>
          <Modal.Header closeButton>
            <Modal.Title>Name the duplication</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Please rename the duplicated function</h4>
            <div className="form-group">
              <label htmlFor="funcName"><FormattedMessage {...commonMessages.name} /></label>
              <input type="text" className="form-control" id="funcName" name="duplicatedFuncName" onChange={this.onChange} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-primary" onClick={this.onDuplicate}>
              <FormattedMessage {...commonMessages.deploy} />
            </a>
            <a className="btn btn-default" onClick={this.onCloseDuplicateModal}>
              <FormattedMessage {...commonMessages.cancel} />
            </a>
          </Modal.Footer>
        </Modal>

        <div className="pull-right">
          <a className="btn btn-primary" onClick={this.onSave}><FormattedMessage {...commonMessages.deploy} /></a> { ' ' }
          <a className="btn btn-warning" onClick={this.onOpenDuplicateModal}><FormattedMessage {...commonMessages.duplicate} /></a> { ' ' }
          <Link to="/" className="btn btn-default"><FormattedMessage {...commonMessages.cancel} /></Link>
        </div>
      </div>
    );
  }
}
FunctionEditPage.propTypes = {
  environments: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  location: PropTypes.object,
  functionByName: PropTypes.func.isRequired,
  loadEnvironmentData: PropTypes.func.isRequired,
  loadFunctionData: PropTypes.func.isRequired,
  loadTriggersHttpData: PropTypes.func.isRequired,
  loadTriggersTimerData: PropTypes.func.isRequired,
  loadKubeWatchersData: PropTypes.func.isRequired,
  updateFunction: PropTypes.func.isRequired,
  createFunction: PropTypes.func.isRequired,
  createTriggerHttp: PropTypes.func.isRequired,
  deleteTriggerHttp: PropTypes.func.isRequired,
  createKubeWatcher: PropTypes.func.isRequired,
  deleteKubeWatcher: PropTypes.func.isRequired,
  createTriggerTimer: PropTypes.func.isRequired,
  deleteTriggerTimer: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  testFunction: PropTypes.func.isRequired,
  cleanTestFunction: PropTypes.func.isRequired,
  functionTest: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  functionByName: makeSelectFunctionByName(),
  environments: makeSelectEnvironments(),
  httpTriggers: makeSelectTriggersHttp(),
  timerTriggers: makeSelectTriggersTimer(),
  kubeWatchers: makeSelectKubeWatchers(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
  functionTest: makeSelectFunctionTest(),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEnvironmentData: () => dispatch(loadEnvironmentAction()),
    loadTriggersHttpData: () => dispatch(loadTriggersHttpAction()),
    loadKubeWatchersData: () => dispatch(loadKubeWatchersAction()),
    loadTriggersTimerData: () => dispatch(loadTriggersTimerAction()),
    loadFunctionData: (name) => dispatch(getFunctionAction(name)),
    updateFunction: (fn) => dispatch(updateFunctionAction(fn)),
    createFunction: (fn) => dispatch(createFunctionAction(fn)),
    createTriggerHttp: (trigger) => dispatch(createTriggerHttpAction(trigger)),
    deleteTriggerHttp: (trigger) => dispatch(deleteTriggerHttpAction(trigger)),
    testFunction: (fn) => dispatch(testFunctionAction(fn)),
    cleanTestFunction: () => dispatch(cleanTestFunctionAction()),
    createKubeWatcher: (watcher) => dispatch(createKubeWatcherAction(watcher)),
    deleteKubeWatcher: (watcher) => dispatch(deleteKubeWatcherAction(watcher)),
    createTriggerTimer: (trigger) => dispatch(createTriggerTimerAction(trigger)),
    deleteTriggerTimer: (trigger) => dispatch(deleteTriggerTimerAction(trigger)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FunctionEditPage);
