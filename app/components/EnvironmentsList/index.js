/**
*
* EnvironmentsList
*
*/

import React, { PropTypes } from 'react';
import LoadingIndicator from 'components/LoadingIndicator';
import EnvironmentsListItem from 'components/EnvironmentsListItem';

// import styled from 'styled-components';


function EnvironmentsList({ loading, error, environments }) {
  if (loading) {
    return <LoadingIndicator />;
  }
  if (error !== false) {
    return <h3>{ error }</h3>;
  }
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Environment name</th>
          <th>Docker image</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {
          environments.map((item, index) => (
            <EnvironmentsListItem item={item} key={`environment-${index}`} />
          ))
        }
      </tbody>
    </table>
  );
}

EnvironmentsList.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.any,
  environments: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
};

export default EnvironmentsList;
