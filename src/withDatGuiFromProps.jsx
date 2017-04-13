import React from 'react'
import withDatGui from './withDatGui'
import { mapPropsToModel } from './utils'

export default (WrappedComponent) => {
  return (props) => {
    const model = mapPropsToModel({ ...WrappedComponent.defaultProps, ...props })
    const ComponentWithDatGui = withDatGui(WrappedComponent, model)
    return <ComponentWithDatGui {...props} />
  }
}
