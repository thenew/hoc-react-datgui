import React, { Component } from 'react'
import forOwn from 'lodash/forOwn'
import isEmpty from 'lodash/isEmpty'
import dat from 'dat.gui/build/dat.gui'

import { getDisplayName, mapModelToData, mapAllDataToState, mapDataToState } from './mappers/model'

export default (WrappedComponent, model = {}) =>
  class extends Component {
    static displayName = `DatGui(${getDisplayName(WrappedComponent)})`;

    constructor(props) {
      super(props)
      this.data = mapModelToData(model, { ...WrappedComponent.defaultProps, ...props })
      this.state = mapAllDataToState(model, this.data)
    }

    hasData = () => !isEmpty(this.data)

    addGuiData = (prop) => {
      const { type, values, min, max, step } = model[prop]

      // Create appropriate data.gui controller
      let controller
      switch (type) {
        case 'enum':
          controller = this.gui.add(this.data, prop, values)
          break
        case 'color':
          controller = this.gui.addColor(this.data, prop)
          break
        case 'slider':
          controller = this.gui.add(this.data, prop, min, max)
          break
        default:
          controller = this.gui.add(this.data, prop)
          break
      }

      // Add datgui constraints (for numbers only)
      if (type === 'number') {
        min !== undefined && controller.min(min)
        max !== undefined && controller.max(max)
        step !== undefined && controller.step(step)
      }

      // Update state when a data changes
      const handleChange = (value) => {
        if (this.state[prop] !== value) {
          this.data[prop] = value
          this.setState({ [prop]: mapDataToState(value, prop, type) })
        }
      }
      if (type === 'object' || type === 'array') {
        controller.onFinishChange(handleChange)
      } else if (type !== 'function') {
        controller.onChange(handleChange)
      }
    };

    componentDidMount = () => {
      if (this.container && this.hasData()) {
        // create dat.gui and add it to the dom
        this.gui = new dat.GUI({ autoPlace: false })
        this.container.appendChild(this.gui.domElement)
        // Add each props to the dat.gui component
        forOwn(this.data, (value, key) => this.addGuiData(key))
      }
    };

    render = () => {
      if (!this.hasData()) {
        return <WrappedComponent {...this.props} />
      }
      return (
        <div style={{position: 'relative'}}>
          <div
            ref={(e) => {
              this.container = e
            }}
            style={{ position: 'absolute', right: '0px', top: '0px', zIndex: '2' }}
          />
          <WrappedComponent {...this.props} {...this.state} />
        </div>
      )
    };
  }
